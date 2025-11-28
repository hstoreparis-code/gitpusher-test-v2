from fastapi import APIRouter
from models.schemas import WebhookJobCompleted

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/job.completed")
async def job_completed_webhook(payload: WebhookJobCompleted, db=None):
    """
    Internal webhook called when a job completes.
    Can be used to notify partners or trigger other actions.
    """
    # Log webhook event
    await db.webhook_events.insert_one({
        "type": "job.completed",
        "job_id": payload.jobId,
        "status": payload.status,
        "repo_url": payload.repoUrl,
        "summary": payload.summary,
        "received_at": datetime.now(timezone.utc).isoformat()
    })
    
    # TODO: Forward to external webhooks if configured
    
    return {"ok": True}


from datetime import datetime, timezone
