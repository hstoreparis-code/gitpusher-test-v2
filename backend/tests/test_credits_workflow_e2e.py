"""
End-to-End test for the complete credit workflow.

Tests the full job lifecycle with credit consumption.
"""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app, db, credits_service, job_manager


@pytest.fixture
async def test_user():
    """Create a test user with credits"""
    user_id = "test_user_e2e_123"
    
    # Clean up any existing user
    await db.users.delete_one({"_id": user_id})
    
    # Create test user with credits
    await db.users.insert_one({
        "_id": user_id,
        "email": "test@example.com",
        "display_name": "Test User",
        "credits": 10,
        "github_access_token": "fake_token"
    })
    
    yield user_id
    
    # Cleanup
    await db.users.delete_one({"_id": user_id})
    await db.jobs_v1.delete_many({"user_id": user_id})
    await db.billing_transactions.delete_many({"user_id": user_id})


@pytest.mark.asyncio
async def test_job_success_consumes_credits(test_user):
    """Test that successful job consumes credits"""
    user_id = test_user
    
    # Get initial credits
    initial_credits = await credits_service.get_user_credits(user_id)
    assert initial_credits == 10
    
    # Create a job
    job = await job_manager.create_job(
        user_id=user_id,
        job_type="test",
        job_data={"test": "data"},
        required_credits=2
    )
    job_id = job["_id"]
    
    # Credits should NOT be consumed yet
    credits_after_create = await credits_service.get_user_credits(user_id)
    assert credits_after_create == 10
    
    # Start and complete job successfully
    await job_manager.start_job(job_id)
    await job_manager.complete_job(job_id, success=True)
    
    # CRITICAL: Credits should now be consumed
    credits_after_complete = await credits_service.get_user_credits(user_id)
    assert credits_after_complete == 8  # 10 - 2
    
    # Verify job is marked as charged
    job_doc = await db.jobs_v1.find_one({"_id": job_id})
    assert job_doc["credits_charged"] is True
    assert job_doc["status"] == "success"


@pytest.mark.asyncio
async def test_job_failure_no_credit_consumption(test_user):
    """Test that failed job does NOT consume credits"""
    user_id = test_user
    
    # Get initial credits
    initial_credits = await credits_service.get_user_credits(user_id)
    assert initial_credits == 10
    
    # Create a job
    job = await job_manager.create_job(
        user_id=user_id,
        job_type="test",
        job_data={"test": "data"},
        required_credits=3
    )
    job_id = job["_id"]
    
    # Start and complete job with failure
    await job_manager.start_job(job_id)
    await job_manager.complete_job(job_id, success=False, error="Test error")
    
    # CRITICAL: Credits should NOT be consumed
    credits_after_complete = await credits_service.get_user_credits(user_id)
    assert credits_after_complete == 10  # Still 10
    
    # Verify job is marked as failed and NOT charged
    job_doc = await db.jobs_v1.find_one({"_id": job_id})
    assert job_doc["credits_charged"] is False
    assert job_doc["status"] == "failed"


@pytest.mark.asyncio
async def test_idempotent_completion(test_user):
    """Test that completing a job twice doesn't double-charge"""
    user_id = test_user
    
    # Create and complete a job
    job = await job_manager.create_job(
        user_id=user_id,
        job_type="test",
        job_data={},
        required_credits=1
    )
    job_id = job["_id"]
    
    await job_manager.start_job(job_id)
    await job_manager.complete_job(job_id, success=True)
    
    credits_after_first = await credits_service.get_user_credits(user_id)
    assert credits_after_first == 9
    
    # Try to complete again
    result = await job_manager.complete_job(job_id, success=True)
    assert result is False  # Should fail
    
    # Credits should remain the same
    credits_after_second = await credits_service.get_user_credits(user_id)
    assert credits_after_second == 9  # Still 9


@pytest.mark.asyncio
async def test_insufficient_credits_at_creation(test_user):
    """Test that job creation fails with insufficient credits"""
    user_id = test_user
    
    # Update user to have only 1 credit
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"credits": 1}}
    )
    
    # Try to create job requiring 5 credits
    with pytest.raises(ValueError, match="Insufficient credits"):
        await job_manager.create_job(
            user_id=user_id,
            job_type="test",
            job_data={},
            required_credits=5
        )
    
    # Credits should remain unchanged
    final_credits = await credits_service.get_user_credits(user_id)
    assert final_credits == 1
