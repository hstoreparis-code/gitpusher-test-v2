"""
Role-Based Access Control for Admin
"""
from enum import Enum
from fastapi import HTTPException

class UserRole(str, Enum):
    FOUNDER_ADMIN = "FOUNDER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    VIEWER = "VIEWER"

ROLE_HIERARCHY = {
    "VIEWER": 0,
    "STAFF": 1,
    "ADMIN": 2,
    "FOUNDER_ADMIN": 3
}

def check_role_permission(user_role: str, required_role: str) -> bool:
    """Check if user role has permission for required role"""
    user_level = ROLE_HIERARCHY.get(user_role, 0)
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    return user_level >= required_level

async def require_role(user: dict, required_role: str):
    """Require specific role or higher"""
    user_role = user.get("role", "VIEWER")
    if not check_role_permission(user_role, required_role):
        raise HTTPException(
            status_code=403,
            detail=f"Access denied. Required role: {required_role}, Your role: {user_role}"
        )
    return user
