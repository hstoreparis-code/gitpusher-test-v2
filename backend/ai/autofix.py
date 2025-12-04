from datetime import datetime, timezone
from typing import Dict, Any
import uuid

from autofix.ai_autofix import run_autofix as core_run_autofix


async def run_ai_autofix(db) -> Dict[str, Any]:
    """Run the global AI AutoFix routine and log an AI event.

    This wraps the existing autofix.ai_autofix.run_autofix() so that we expose
    a clean /api/ai/autofix endpoint that AI agents can call without needing
    admin headers.
    """
    fixes = core_run_autofix()

    # Best-effort logging into ai_events (do not fail on error)
    try:  # noqa: SIM105
        event = {
            "_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "gitpusher.ai",
            "event_type": "ai_autofix_run",
            "endpoint": "/api/ai/autofix",
            "metadata": fixes,
        }
        await db.ai_events.insert_one(event)
    except Exception:  # noqa: BLE001
        pass

    return {"status": "ok", "fixes": fixes}
