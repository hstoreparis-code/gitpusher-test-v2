from fastapi import APIRouter, HTTPException
from models.schemas import (
    AutopushSettings,
    AutopushLogItem,
    AutopushTriggerRequest
)
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/autopush", tags=["autopush"])


@router.get("/settings", response_model=AutopushSettings)
async def get_autopush_settings(db=None, user_id: str = None):
    """
    Get user's autopush settings.
    """
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    settings = user.get("autopush_settings", {})
    return AutopushSettings(**settings) if settings else AutopushSettings()


@router.post("/settings", response_model=AutopushSettings)
async def update_autopush_settings(payload: AutopushSettings, db=None, user_id: str = None):
    """
    Update user's autopush settings.
    """
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "autopush_settings": payload.dict(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return payload


@router.get("/logs")
async def get_autopush_logs(limit: int = 50, db=None, user_id: str = None):
    """
    Get user's autopush execution logs.
    """
    logs = await db.autopush_logs.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("triggered_at", -1).limit(limit).to_list(limit)
    
    return {"logs": logs}


@router.post("/trigger")
async def trigger_autopush(payload: AutopushTriggerRequest, db=None, user_id: str = None):
    """
    Manually trigger an autopush.
    """
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Create autopush job
    job = {
        "_id": job_id,
        "user_id": user_id,
        "upload_id": payload.uploadId,
        "repo_name": payload.repoName,
        "type": "autopush",
        "status": "queued",
        "created_at": now
    }
    
    await db.jobs_v1.insert_one(job)
    
    # Log autopush trigger
    await db.autopush_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "repo_name": payload.repoName,
        "status": "triggered",
        "triggered_at": now,
        "job_id": job_id
    })
    
    return {"jobId": job_id, "startedAt": now}
