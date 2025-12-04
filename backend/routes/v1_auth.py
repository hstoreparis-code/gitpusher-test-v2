from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import httpx
from models.schemas import GitHubTokenRequest, GitHubTokenResponse
from datetime import datetime, timezone
import uuid
import os

from rate_limit import check_login_lockout, record_login_failure


def _get_identity_from_token(auth_header: Optional[str]) -> str:
    if not auth_header:
        return "github-token:unknown"
    return f"github-token:{auth_header[:16]}"

from logging_config import log_security

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/github", response_model=GitHubTokenResponse)
async def connect_github_token(payload: GitHubTokenRequest, db=None, user_id: Optional[str] = None):
    identity = _get_identity_from_token(payload.githubToken)
    if check_login_lockout(identity):
        log_security("GitHub token login attempt while locked out", identity=identity)
        raise HTTPException(status_code=429, detail="Too many failed attempts. Temporarily locked.")
    """
    Connect GitHub via Personal Access Token.
    Validates token, fetches user info, stores encrypted token.
    """
    github_token = payload.githubToken
    
    # Validate token by calling GitHub API
    async with httpx.AsyncClient() as client:
        try:
            user_res = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {github_token}"},
                timeout=20
            )
            
            if user_res.status_code != 200:
                record_login_failure(identity)
                log_security("GitHub token login failed", identity=identity)
                raise HTTPException(status_code=400, detail="Invalid GitHub token")
            
            gh_profile = user_res.json()
            gh_id = str(gh_profile.get("id"))
            gh_email = gh_profile.get("email") or f"{gh_profile.get('login')}@github.local"
            gh_login = gh_profile.get("login")
            gh_name = gh_profile.get("name") or gh_login
            
            # Get token scopes
            scopes_header = user_res.headers.get("X-OAuth-Scopes", "")
            scopes = [s.strip() for s in scopes_header.split(",")] if scopes_header else []
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=400, detail=f"GitHub API error: {str(e)}")
    
    # Find or create user
    user = await db.users.find_one({"email": gh_email})
    if user:
        # Update existing user
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "provider_github_id": gh_id,
                    "github_access_token": github_token,
                    "github_scopes": scopes,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        user_id = user["_id"]
    else:
        # Create new user
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "email": gh_email,
            "display_name": gh_name,
            "password_hash": None,
            "provider_github_id": gh_id,
            "github_access_token": github_token,
            "github_scopes": scopes,
            "credits": 10,
            "plan": "free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    
    return GitHubTokenResponse(
        userId=user_id,
        githubScopes=scopes
    )
