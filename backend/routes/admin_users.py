from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin/users")

class RoleUpdate(BaseModel):
    role: str

async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)

@router.patch("/{user_id}/role")
async def update_user_role(user_id: str, payload: RoleUpdate, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db
    from datetime import datetime, timezone
    
    # Validate role
    valid_roles = ["VIEWER", "STAFF", "ADMIN", "FOUNDER_ADMIN"]
    if payload.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Update user
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": {"role": payload.role, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"ok": True, "role": payload.role}


@router.delete("/{user_id}")
async def delete_user(user_id: str, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    result = await db.users.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"ok": True}
