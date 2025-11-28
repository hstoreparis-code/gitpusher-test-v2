from fastapi import APIRouter, HTTPException, Header
from models.schemas import PartnerRepoCreateRequest
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/partner/v1", tags=["partner"])


async def verify_partner_key(api_key: str, db) -> Optional[dict]:
    """Verify partner API key."""
    partner = await db.partner_keys.find_one({"api_key": api_key, "active": True})
    return partner


@router.post("/repos/create")
async def partner_create_repo(
    payload: PartnerRepoCreateRequest,
    db=None,
    x_api_key: Optional[str] = Header(None)
):
    """
    Partner endpoint to create repo for a user.
    """
    # Verify partner key
    api_key = payload.partnerApiKey or x_api_key
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    partner = await verify_partner_key(api_key, db)
    if not partner:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Create job for the user
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    job = {
        "_id": job_id,
        "partner_id": partner["_id"],
        "user_identifier": payload.userIdentifier,
        "s3_artifact_url": payload.s3ArtifactUrl,
        "repo_name": payload.repoName,
        "visibility": payload.visibility,
        "status": "queued",
        "type": "partner",
        "created_at": now
    }
    
    await db.jobs_v1.insert_one(job)
    
    return {"jobId": job_id}
