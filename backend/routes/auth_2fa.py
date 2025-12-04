from fastapi import APIRouter, HTTPException, Response, Request
from typing import Optional

import pyotp

from logging_config import log_security
from security_config import is_secure_env
from services.session_store import create_session
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta

router = APIRouter()


def _get_jwt_secret() -> str:
    # Lazy import to avoid circular dependency
    from server import SECRET_KEY  # type: ignore

    return SECRET_KEY


async def _get_db():
    from server import db  # type: ignore

    return db


def _decode_temp_token(temp_token: str) -> str:
    """Decode a short-lived temp JWT and return user_id.

    The token is expected to contain a `sub` (user_id) and `scope="admin_2fa"`.
    """
    try:
        payload = jwt.decode(temp_token, _get_jwt_secret(), algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired temp token")

    if payload.get("scope") != "admin_2fa":
        raise HTTPException(status_code=401, detail="Invalid token scope")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid temp token payload")

    return user_id


@router.post("/api/auth/2fa/setup")
async def setup_2fa(authorization: Optional[str] = None):
    """Setup 2FA for the currently authenticated user (JWT-based).

    Used from the logged-in UI (admin or user) to enable 2FA on their account.
    """
    # Late import to avoid circular import
    from server import get_user_from_token  # type: ignore

    user = await get_user_from_token(authorization)
    user_id = user["_id"]

    secret = pyotp.random_base32()

    db = await _get_db()
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "two_fa_secret": secret,
                "two_fa_enabled": False,
                "requires_2fa": True,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    otpauth = pyotp.totp.TOTP(secret).provisioning_uri(
        name=f"gitpusher:{user.get('email', user_id)}", issuer_name="GitPusher.ai"
    )
    log_security("2FA setup secret created", user_id=user_id)
    return {"secret": secret, "otpauth_url": otpauth}


@router.post("/api/auth/2fa/verify")
async def verify_2fa(code: str, authorization: Optional[str] = None):
    """Verify a 2FA code for the current user and enable 2FA on their account."""
    from server import get_user_from_token  # type: ignore

    user = await get_user_from_token(authorization)
    user_id = user["_id"]

    secret = user.get("two_fa_secret")
    if not secret:
        raise HTTPException(status_code=400, detail="2FA not set up")

    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        log_security("2FA code invalid", user_id=user_id)
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    db = await _get_db()
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "two_fa_enabled": True,
                "requires_2fa": True,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    log_security("2FA verified", user_id=user_id)
    return {"status": "ok"}


@router.post("/api/auth/login-2fa")
async def login_2fa(response: Response, code: str, temp_token: str):
    """Second step of admin login: verify TOTP code and issue session cookie.

    Assumes password has already been checked and a short-lived temp JWT was issued
    with scope="admin_2fa".
    """
    user_id = _decode_temp_token(temp_token)

    db = await _get_db()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    secret = user.get("two_fa_secret")
    if not secret:
        raise HTTPException(status_code=400, detail="2FA not set up")

    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        log_security("2FA login invalid", user_id=user_id)
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # Create a persistent session (7 days)
    session = await create_session(user_id=user_id, ttl_minutes=60 * 24 * 7)

    # Determine cookie security based on environment
    secure_flag = is_secure_env()

    response.set_cookie(
        key="gitpusher_session",
        value=session.id,
        httponly=True,
        secure=secure_flag,
        samesite="Lax",
        max_age=60 * 60 * 24 * 7,
    )

    log_security("2FA login success", user_id=user_id, session_id=session.id)
    return {"status": "ok"}
