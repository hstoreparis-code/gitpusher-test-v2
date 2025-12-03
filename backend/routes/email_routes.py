from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin/email")

class TemplateCreate(BaseModel):
    key: str
    name: str
    subject: str
    body_html: str
    body_text: Optional[str] = ""

class SendTestRequest(BaseModel):
    to: str
    name: Optional[str] = "User"

async def get_email_service():
    from server import db
    from services.email_service import EmailService
    return EmailService(db)

async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)

@router.get("/templates")
async def list_templates(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    email_service = await get_email_service()
    templates = await email_service.list_templates()
    return {"templates": templates}

@router.get("/templates/{key}")
async def get_template(key: str, authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    email_service = await get_email_service()
    tmpl = await email_service.get_template(key)
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    return tmpl

@router.post("/templates")
async def create_update_template(payload: TemplateCreate, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    email_service = await get_email_service()
    result = await email_service.create_or_update_template(payload.dict(), admin["_id"])
    return result

@router.post("/templates/{key}/send-test")
async def send_test_email(key: str, payload: SendTestRequest, authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    email_service = await get_email_service()
    
    try:
        await email_service.send_from_template(key, payload.to, {"name": payload.name})
        return {"status": "sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
