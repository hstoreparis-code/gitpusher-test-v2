from fastapi import APIRouter

from dashboard.credit_safety import router as credit_router

admin_dashboard_router = APIRouter()

admin_dashboard_router.include_router(credit_router, prefix="/credit-safety", tags=["admin-credit-safety"])
