from fastapi import APIRouter, HTTPException, Response, Request
import os

import pyotp

from models.session import Session, store_session
from logging_config import log_security

router = APIRouter()

# Simplified in-memory user store for 2FA secret (to be replaced with DB)
USER_2FA: dict[str, str] = {}  # user_id -> secret


def get_current_user_id_stub() -> str:
  # Placeholder: integrate with real auth/user model
  return "admin"


@router.post("/api/auth/2fa/setup")
def setup_2fa():
    user_id = get_current_user_id_stub()
    secret = pyotp.random_base32()
    USER_2FA[user_id] = secret
    # otpauth URL for Google Authenticator
    otpauth = pyotp.totp.TOTP(secret).provisioning_uri(
        name=f"gitpusher:{user_id}", issuer_name="GitPusher.ai"
    )
    log_security("2FA setup secret created", user_id=user_id)
    return {"secret": secret, "otpauth_url": otpauth}


@router.post("/api/auth/2fa/verify")
def verify_2fa(code: str):
    user_id = get_current_user_id_stub()
    secret = USER_2FA.get(user_id)
    if not secret:
        raise HTTPException(status_code=400, detail="2FA not set up")
    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        log_security("2FA code invalid", user_id=user_id)
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    log_security("2FA verified", user_id=user_id)
    return {"status": "ok"}


@router.post("/api/auth/login-2fa")
def login_2fa(request: Request, response: Response, code: str):
    """Assumes password already checked separately, here we just do 2FA + session cookie."""
    user_id = get_current_user_id_stub()
    secret = USER_2FA.get(user_id)
    if not secret:
        raise HTTPException(status_code=400, detail="2FA not set up")
    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        log_security("2FA login invalid", user_id=user_id)
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    session = Session.new(user_id=user_id, ttl_minutes=60)
    store_session(session)
    # Set HttpOnly cookie
    response.set_cookie(
        key="gp_session",
        value=session.id,
        httponly=True,
        secure=True,
        samesite="Lax",
    )
    log_security("2FA login success", user_id=user_id, session_id=session.id)
    return {"status": "ok", "user_id": user_id}
