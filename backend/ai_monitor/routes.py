from fastapi import APIRouter, Header, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import json
import asyncio
import random

router = APIRouter(prefix="/admin/ai-monitor")

async def get_db():
    from server import db
    return db

async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)

@router.get("/stream")
async def ai_monitor_stream(authorization: Optional[str] = Header(None)):
    """SSE stream for realtime AI activity"""
    await require_admin_auth(authorization)
    
    async def event_generator():
        while True:
            freq = random.random() * 100
            likelihood = min(100, max(0, int(freq + (random.random() * 15 - 7))))
            data = json.dumps({"freq": freq, "likelihood": likelihood, "t": int(datetime.now(timezone.utc).timestamp() * 1000)})
            yield f"data: {data}\n\n"
            await asyncio.sleep(0.8)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/live")
async def ai_monitor_live(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    db = await get_db()
    events = await db.ai_events.find({}, {"_id": 0}).sort("timestamp", -1).limit(300).to_list(300)
    return {"events": events, "count": len(events)}

@router.get("/stats")
async def ai_monitor_stats(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    db = await get_db()
    now = datetime.now(timezone.utc)
    day_ago = (now - timedelta(days=1)).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    
    events_24h = await db.ai_events.count_documents({"timestamp": {"$gte": day_ago}})
    events_7d = await db.ai_events.count_documents({"timestamp": {"$gte": week_ago}})
    
    pipeline = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    by_source = await db.ai_events.aggregate(pipeline).to_list(100)
    
    return {
        "stats_24h": events_24h,
        "stats_7d": events_7d,
        "by_source": by_source,
        "health": "OK" if events_24h > 0 else "WARNING"
    }

@router.get("/top-ias")
async def ai_monitor_top(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    db = await get_db()
    pipeline = [
        {"$group": {"_id": "$source", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 10}
    ]
    top = await db.ai_events.aggregate(pipeline).to_list(10)
    return {"top_ias": top}
