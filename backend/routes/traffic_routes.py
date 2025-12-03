from fastapi import APIRouter, Header
from fastapi.responses import StreamingResponse
from typing import Optional
import json
import asyncio
from datetime import datetime, timezone

router = APIRouter(prefix="/admin/traffic")

async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)

@router.get("/stream")
async def traffic_stream(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    
    async def event_generator():
        from server import db
        from datetime import timedelta
        
        while True:
            now = datetime.now(timezone.utc)
            one_min_ago = (now - timedelta(minutes=1)).isoformat()
            
            recent = await db.traffic_logs.find({"timestamp": {"$gte": one_min_ago}}).to_list(1000)
            rps = len(recent) / 60 if recent else 0
            unique_ips = await db.traffic_logs.distinct("ip", {"timestamp": {"$gte": one_min_ago}})
            avg_response = sum(r.get("duration_ms", 0) for r in recent) / len(recent) if recent else 0
            
            data = json.dumps({
                "t": int(datetime.now(timezone.utc).timestamp() * 1000),
                "rps": round(rps, 2),
                "users": len(unique_ips),
                "response_ms": round(avg_response, 2)
            })
            yield f"data: {data}\n\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/stats")
async def traffic_stats(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    from server import db
    from datetime import timedelta
    
    # Get traffic from MongoDB
    now = datetime.now(timezone.utc)
    one_min_ago = (now - timedelta(minutes=1)).isoformat()
    
    total = await db.traffic_logs.count_documents({})
    total_ai = await db.traffic_logs.count_documents({"is_ai": True})
    recent = await db.traffic_logs.find({"timestamp": {"$gte": one_min_ago}}).to_list(1000)
    
    rps = len(recent) / 60 if recent else 0
    avg_response = sum(r.get("duration_ms", 0) for r in recent) / len(recent) if recent else 0
    
    # Unique IPs
    unique_ips = await db.traffic_logs.distinct("ip")
    
    # Top endpoints
    pipeline_endpoints = [
        {"$group": {"_id": "$path", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_endpoints_list = await db.traffic_logs.aggregate(pipeline_endpoints).to_list(10)
    top_endpoints = {item["_id"]: item["count"] for item in top_endpoints_list}
    
    # AI Traffic
    pipeline_ai = [
        {"$match": {"is_ai": True}},
        {"$group": {"_id": "$ai_source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    ai_traffic_list = await db.traffic_logs.aggregate(pipeline_ai).to_list(20)
    ai_traffic = {item["_id"]: item["count"] for item in ai_traffic_list}
    
    # By hour
    pipeline_hour = [
        {"$group": {"_id": {"$substr": ["$timestamp", 0, 13]}, "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
        {"$limit": 24}
    ]
    by_hour_list = await db.traffic_logs.aggregate(pipeline_hour).to_list(24)
    by_hour = [{"hour": item["_id"].split("T")[1] if "T" in item["_id"] else item["_id"][-5:], "count": item["count"]} for item in reversed(by_hour_list)]
    
    return {
        "rps": round(rps, 2),
        "active_users": len(unique_ips),
        "unique_visitors": len(unique_ips),
        "avg_response_ms": round(avg_response, 2),
        "total_requests": total,
        "total_ai_requests": total_ai,
        "top_endpoints": top_endpoints,
        "ai_traffic": ai_traffic,
        "by_country": {"France": len(unique_ips)},
        "by_hour": by_hour,
        "top_pages": top_endpoints
    }

@router.get("/export")
async def export_traffic(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    from server import db
    from fastapi.responses import StreamingResponse
    import io
    
    logs = await db.traffic_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(1000).to_list(1000)
    
    json_data = json.dumps({"traffic_logs": logs, "exported_at": datetime.now(timezone.utc).isoformat()}, indent=2)
    
    return StreamingResponse(
        io.BytesIO(json_data.encode()),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=traffic-export-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.json"}
    )


