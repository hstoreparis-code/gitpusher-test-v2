from fastapi import APIRouter, HTTPException
from models.schemas import JobCreateRequest, JobCreateResponse, JobStatus
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobCreateResponse)
async def create_job(payload: JobCreateRequest, db=None, user_id: str = None, credits_service=None):
    """
    Create a new job to process upload and create GitHub repo.
    """
    # Check if upload exists
    upload = await db.uploads_v1.find_one({"_id": payload.uploadId, "user_id": user_id})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Check credits
    if not await credits_service.consume_credits(user_id, 1):
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # Create job
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    job = {
        "_id": job_id,
        "user_id": user_id,
        "upload_id": payload.uploadId,
        "repo_name": payload.repoName,
        "visibility": payload.visibility,
        "auto_prompts": payload.autoPrompts.dict() if payload.autoPrompts else {},
        "status": "queued",
        "logs": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.jobs_v1.insert_one(job)
    
    # TODO: Trigger async job processing
    
    return JobCreateResponse(
        jobId=job_id,
        startedAt=now
    )


@router.get("/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str, db=None, user_id: str = None):
    """
    Get job status and logs.
    """
    job = await db.jobs_v1.find_one({"_id": job_id, "user_id": user_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatus(
        jobId=job_id,
        status=job.get("status", "unknown"),
        logs=job.get("logs", []),
        repoUrl=job.get("repo_url"),
        errors=job.get("errors", [])
    )
