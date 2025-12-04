from fastapi import APIRouter

router = APIRouter()


@router.get("/api/admin/security/ping")
async def security_ping():
  return {"status": "ok"}
