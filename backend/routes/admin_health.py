from fastapi import APIRouter
import time
try:
    import psutil
except ImportError:  # Lightweight fallback if psutil is not installed
    psutil = None


router = APIRouter()

START_TIME = time.time()


@router.get("/api/admin/health")
async def admin_health():
    uptime = time.time() - START_TIME
    if psutil is not None:
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
    else:
        cpu = 0.0
        memory = 0.0
    return {
        "status": "ok",
        "uptime": uptime,
        "cpu": cpu,
        "memory": memory,
    }
