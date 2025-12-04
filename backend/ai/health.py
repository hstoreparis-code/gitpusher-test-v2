from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any

from .visibility_score import compute_ai_visibility_score


async def compute_ai_health(db) -> Dict[str, Any]:
    """Aggregate AI health signals (files + events + ping logs).

    This endpoint is meant to be very fast and "safe" to call from AI agents
    or cron jobs. It does **not** modify state; it only reads files & DB.
    """
    now = datetime.now(timezone.utc)

    visibility = compute_ai_visibility_score()

    checks = []

    # 1) DB connectivity & ai_events collection
    db_ok = True
    events_last_hour = 0
    events_last_24h = 0
    try:
        # Simple ping to Mongo via users collection
        await db.users.find_one({})
        # AI events volume
        one_hour_ago = (now - timedelta(hours=1)).isoformat()
        day_ago = (now - timedelta(days=1)).isoformat()
        events_last_hour = await db.ai_events.count_documents({"timestamp": {"$gte": one_hour_ago}})
        events_last_24h = await db.ai_events.count_documents({"timestamp": {"$gte": day_ago}})
    except Exception as exc:  # noqa: BLE001
        db_ok = False
        checks.append({
            "name": "mongodb",
            "ok": False,
            "error": f"db_error: {exc}",
        })

    if db_ok:
        checks.append({
            "name": "mongodb",
            "ok": True,
            "events_last_hour": int(events_last_hour),
            "events_last_24h": int(events_last_24h),
        })

    # 2) Ping logs from /api/ai/ping-all
    ping_log_path = Path("/app/logs/ai_ping_log.json")
    ping_info: Dict[str, Any]
    if ping_log_path.exists():
        try:
            import json

            data = json.loads(ping_log_path.read_text(encoding="utf-8"))
            last = data[-1] if isinstance(data, list) and data else None
            ping_info = {
                "name": "ai_ping_log",
                "ok": True,
                "path": str(ping_log_path),
                "last_timestamp": last.get("timestamp") if isinstance(last, dict) else None,
                "total_pinged": last.get("total_pinged") if isinstance(last, dict) else None,
            }
        except Exception as exc:  # noqa: BLE001
            ping_info = {
                "name": "ai_ping_log",
                "ok": False,
                "error": f"invalid_log: {exc}",
                "path": str(ping_log_path),
            }
    else:
        ping_info = {
            "name": "ai_ping_log",
            "ok": False,
            "error": "missing",
            "path": str(ping_log_path),
        }
    checks.append(ping_info)

    # 3) Fold visibility score into overall status
    score = visibility.get("score", 0)
    grade = visibility.get("grade", "unknown")

    # Overall status heuristic
    if not db_ok or score < 50:
        status = "CRITICAL"
    elif score < 75:
        status = "WARN"
    else:
        status = "OK"

    return {
        "status": status,
        "timestamp": now.isoformat(),
        "visibility": visibility,
        "checks": checks,
    }
