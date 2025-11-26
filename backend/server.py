from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
import uuid
import logging
import base64
import httpx
import json
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# JWT config
SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth & GitHub
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "")

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.environ.get("GITHUB_REDIRECT_URI", "")

# LLM (Emergent / OpenAI via Emergent gateway)

# Admin demo user (can be overridden via env)
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@pushin.app")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin1234!")
ADMIN_DISPLAY_NAME = os.environ.get("ADMIN_DISPLAY_NAME", "Admin")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
EMERGENT_API_URL = os.environ.get("EMERGENT_API_URL", "https://api.emergent.sh")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# Pydantic models
class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(UserBase):
    id: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: str = "en"  # "fr" | "en"
    provider: str = "github"  # github | gitlab | bitbucket | gitea | azure_devops



class ProjectPublic(BaseModel):
    id: str
    name: str
    status: str
    github_repo_url: Optional[str] = None
    created_at: datetime


class ProjectDetail(ProjectPublic):
    description: Optional[str] = None
    readme_md: Optional[str] = None
    commit_messages: List[str] = []



class UserUpdateProfile(BaseModel):
    display_name: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class JobCreate(BaseModel):
    project_id: str


class JobPublic(BaseModel):
    id: str
    project_id: str
    status: str
    error: Optional[str] = None
    created_at: datetime


class PlanUpdate(BaseModel):
    plan: str




# PlanUpdate class removed

# FastAPI app
app = FastAPI(title="GitPusher API")
api_router = APIRouter(prefix="/api")




class I18nTranslateRequest(BaseModel):
    target_lang: str
    base_lang: str = "en"
    entries: Dict[str, str]


@api_router.post("/i18n/translate")
async def translate_i18n(req: I18nTranslateRequest):
    """Translate UI strings using LLM. If EMERGENT_LLM_KEY is absent, return entries unchanged.

    This is a simple helper: it takes key->English text and returns key->translated text.
    """
    if not EMERGENT_LLM_KEY:
        # No key configured, just echo base entries
        return {"translations": req.entries}

    # Build prompt listing all keys and values
    lines = [f"{k}: {v}" for k, v in req.entries.items()]
    catalog = "\n".join(lines)

    prompt = f"""
You are a professional product UI translator.
Translate each value to the target language "{req.target_lang}" while keeping the keys exactly the same.
Return a JSON object only, with the same keys and translated string values, no explanations.

Here are the entries (as key: text):
{catalog}
"""
    text = await call_llm(prompt, language=req.target_lang)

    try:
        translated = json.loads(text)
        if not isinstance(translated, dict):  # fallback if LLM didn't follow instructions
            raise ValueError("Invalid LLM JSON")
    except Exception:  # noqa: BLE001
        # In case of parsing error, just return base entries
        return {"translations": req.entries}

    return {"translations": translated}





class GitRepoInfo(BaseModel):
    url: str
    full_name: str


class GitProviderBase:
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:  # pragma: no cover - interface
        raise NotImplementedError

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):  # pragma: no cover - interface
        raise NotImplementedError


class GitHubProvider(GitProviderBase):
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        async with httpx.AsyncClient() as client_http:
            res = await client_http.post(
                "https://api.github.com/user/repos",
                headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                json={"name": name, "description": description or "", "private": False},
                timeout=20,
            )
            if res.status_code not in (200, 201):
                logger.error("GitHub create repo failed: %s", res.text)
                raise HTTPException(status_code=400, detail="Failed to create GitHub repo")
            data = res.json()
            return GitRepoInfo(url=data["html_url"], full_name=data["full_name"])

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        b64 = base64.b64encode(content_bytes).decode("utf-8")
        async with httpx.AsyncClient() as client_http:
            res = await client_http.put(
                f"https://api.github.com/repos/{repo.full_name}/contents/{path}",
                headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                json={"message": message, "content": b64},
                timeout=20,
            )
            if res.status_code not in (200, 201):
                logger.error("GitHub put file %s failed: %s", path, res.text)
                raise HTTPException(status_code=400, detail=f"Failed to upload file {path} to GitHub")


# Placeholders pour d'autres providers (GitLab, Bitbucket, Gitea, Azure DevOps)
# Ces classes peuvent être implémentées plus tard pour supporter d'autres plateformes.
class GitLabProvider(GitProviderBase):
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        raise HTTPException(status_code=501, detail="GitLab provider not implemented yet")

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        raise HTTPException(status_code=501, detail="GitLab provider not implemented yet")


class BitbucketProvider(GitProviderBase):
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        raise HTTPException(status_code=501, detail="Bitbucket provider not implemented yet")

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        raise HTTPException(status_code=501, detail="Bitbucket provider not implemented yet")


class GiteaProvider(GitProviderBase):
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        raise HTTPException(status_code=501, detail="Gitea provider not implemented yet")

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        raise HTTPException(status_code=501, detail="Gitea provider not implemented yet")


class AzureDevOpsProvider(GitProviderBase):
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        raise HTTPException(status_code=501, detail="Azure DevOps provider not implemented yet")

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        raise HTTPException(status_code=501, detail="Azure DevOps provider not implemented yet")


def get_git_provider(provider_key: str) -> GitProviderBase:
    key = (provider_key or "github").lower()
    if key == "github":
        return GitHubProvider()
    if key == "gitlab":
        return GitLabProvider()
    if key == "bitbucket":
        return BitbucketProvider()
    if key == "gitea":
        return GiteaProvider()
    if key in {"azure", "azure_devops", "azure-devops"}:
        return AzureDevOpsProvider()
    # default
    return GitHubProvider()


class I18nDetectResponse(BaseModel):
    country_code: str
    lang: str


@api_router.get("/i18n/detect", response_model=I18nDetectResponse)
async def detect_i18n(request: Request):
    """Detect user locale from IP address via ipapi.co.

    - Uses X-Forwarded-For if present (first IP), otherwise falls back to request.client.host.
    - Maps country code to a language code.
    - Always returns French (fr) for France (FR).
    """
    # Extract client IP
    x_forwarded_for = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "0.0.0.0"

    # Local/dev IPs: just default to English
    if ip.startswith("127.") or ip == "::1":
        return I18nDetectResponse(country_code="US", lang="en")

    country_code = ""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client_http:
            res = await client_http.get(f"https://ipapi.co/{ip}/json/")
            res.raise_for_status()
            data = res.json()
            country_code = (data.get("country") or data.get("country_code") or "").upper()
    except Exception as exc:  # noqa: BLE001
        logger.error("IP geolocation failed for %s: %s", ip, exc)
        return I18nDetectResponse(country_code="US", lang="en")

    if not country_code:
        return I18nDetectResponse(country_code="US", lang="en")

    # Map country to language
    # Always force FR -> fr as requested
    if country_code == "FR":
        lang = "fr"
    else:
        country_to_lang = {
            "DE": "de",
            "ES": "es",
            "IT": "it",
            "PT": "pt",
            "NL": "nl",
            "BE": "fr",
            "LU": "fr",
            "IE": "en",
            "DK": "da",
            "SE": "sv",
            "FI": "fi",
            "PL": "pl",
            "CZ": "cs",
            "SK": "sk",
            "HU": "hu",
            "SI": "sl",
            "HR": "hr",
            "RO": "ro",
            "BG": "bg",
            "GR": "el",
            "LT": "lt",
            "LV": "lv",
            "EE": "et",
            "CY": "el",
            "MT": "mt",
            "CN": "zh",
        }
        lang = country_to_lang.get(country_code, "en")

    return I18nDetectResponse(country_code=country_code, lang=lang)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.on_event("startup")
async def ensure_admin_user():
    """Ensure an admin user exists on startup (for demo / admin dashboard access)."""
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        admin_id = str(uuid.uuid4())
        doc = {
            "_id": admin_id,
            "email": ADMIN_EMAIL,
            "display_name": ADMIN_DISPLAY_NAME,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "provider_google_id": None,
            "provider_github_id": None,
            "github_access_token": None,
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        logger.info("Admin user created with email %s", ADMIN_EMAIL)
    else:
        if not existing.get("is_admin"):
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {"is_admin": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
            )
            logger.info("Existing user %s upgraded to admin", ADMIN_EMAIL)


# Dependency: current user
async def get_current_user(authorization: str = Depends(lambda authorization=Depends(lambda: None): authorization)):
    """Very small helper that expects Authorization: Bearer <token> header.
    FastAPI trick: we manually read from environ since we don't have Request in this dependency signature.
    We'll instead pass token via header in routes to keep it explicit and simple for MVP.
    """
    # This will be overridden per-route; keep simple placeholder.
    return None


# Helper to fetch user from token inside routes
async def get_user_from_token(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload["sub"]
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user




class AdminStatus(BaseModel):
    is_admin: bool


@api_router.get("/auth/admin-status", response_model=AdminStatus)
async def admin_status(authorization: Optional[str] = Header(default=None)):
    """Return whether the current user is admin.

    Used by frontend to gate access to admin dashboard.
    """
    user = await get_user_from_token(authorization)
    return AdminStatus(is_admin=bool(user.get("is_admin")))

# ---------- AUTH ROUTES ----------


@api_router.post("/auth/register", response_model=UserPublic)
async def register(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    doc = {
        "_id": user_id,
        "email": payload.email,
        "display_name": payload.display_name or payload.email.split("@")[0],
        "password_hash": hash_password(payload.password),
        "provider_google_id": None,
        "provider_github_id": None,
        "github_access_token": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)

    return UserPublic(id=user_id, email=doc["email"], display_name=doc["display_name"])


@api_router.post("/auth/demo", response_model=TokenResponse)
async def demo_login():
    """Return a JWT for a demo user, creating it if necessary.

    This is a simple helper to log into the dashboard quickly without signup.
    """
    email = "demo@pushin.app"
    password = "Demo1234!"
    display_name = "Demo User"

    user = await db.users.find_one({"email": email})
    if not user:
        user_id = str(uuid.uuid4())
        doc = {
            "_id": user_id,
            "email": email,
            "display_name": display_name,
            "password_hash": hash_password(password),
            "provider_google_id": None,
            "provider_github_id": None,
            "github_access_token": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        user = doc

    token = create_access_token({"sub": user["_id"]})
    return TokenResponse(access_token=token)


@api_router.patch("/users/me", response_model=UserPublic)
async def update_profile(payload: UserUpdateProfile, authorization: Optional[str] = Header(default=None)):
    """Update current user's profile (self-service)."""
    user = await get_user_from_token(authorization)
    updates: Dict[str, Any] = {}
    if payload.display_name is not None:
        updates["display_name"] = payload.display_name
    if not updates:
        return UserPublic(id=user["_id"], email=user["email"], display_name=user.get("display_name"))

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
    refreshed = await db.users.find_one({"_id": user["_id"]})
    return UserPublic(id=refreshed["_id"], email=refreshed["email"], display_name=refreshed.get("display_name"))


@api_router.post("/users/me/change-password")
async def change_password(payload: ChangePasswordRequest, authorization: Optional[str] = Header(default=None)):
    """Allow current user to change password (self-service)."""
    user = await get_user_from_token(authorization)
    if not user.get("password_hash"):
        raise HTTPException(status_code=400, detail="Password-based login not enabled for this account")

    if not verify_password(payload.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_hash = hash_password(payload.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": new_hash,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"status": "ok"}


@api_router.delete("/users/me")
async def delete_me(authorization: Optional[str] = Header(default=None)):
    """Soft-delete current user account and associated projects/jobs/uploads (MVP)."""
    user = await get_user_from_token(authorization)

    # Soft-delete: we mark a flag and optionally anonymize email
    anonymized_email = f"deleted+{user['_id']}@pushin.app"
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "email": anonymized_email,
                "display_name": "Deleted User",
                "password_hash": None,
                "status": "deleted",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    # Optionnel: marquer les projets et jobs comme appartenant à un user supprimé
    await db.projects.update_many(
        {"user_id": user["_id"]},
        {"$set": {"user_deleted": True}},
    )
    await db.jobs.update_many(
        {"user_id": user["_id"]},
        {"$set": {"user_deleted": True}},
    )

    return {"status": "deleted"}

    token = create_access_token({"sub": user["_id"]})
    return TokenResponse(access_token=token)



@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["_id"]})
    return TokenResponse(access_token=token)


@api_router.get("/auth/me", response_model=UserPublic)
async def me(authorization: Optional[str] = Header(default=None)):

    user = await get_user_from_token(authorization)
    return UserPublic(id=user["_id"], email=user["email"], display_name=user.get("display_name"))


# ---------- GOOGLE OAUTH ----------


@api_router.get("/auth/oauth/google/url")
async def google_oauth_url():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    scope = "openid email profile"
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code&scope={scope}&access_type=online&include_granted_scopes=true"
    )
    return {"url": url}


@api_router.get("/auth/oauth/google/callback", response_model=TokenResponse)
async def google_callback(code: str):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    async with httpx.AsyncClient() as client_http:
        token_res = await client_http.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=20,
        )
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code")
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        userinfo_res = await client_http.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=20,
        )
        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google profile")
        profile = userinfo_res.json()

    email = profile.get("email")
    google_id = profile.get("id")
    name = profile.get("name") or email.split("@")[0]

    user = await db.users.find_one({"email": email})
    if user:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"provider_google_id": google_id, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "email": email,
            "display_name": name,
            "password_hash": None,
            "provider_google_id": google_id,
            "provider_github_id": None,
            "github_access_token": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)

    token = create_access_token({"sub": user["_id"]})
    return TokenResponse(access_token=token)


# ---------- GITHUB OAUTH ----------


@api_router.get("/auth/oauth/github/url")
async def github_oauth_url():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    scope = "repo"
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}&redirect_uri={GITHUB_REDIRECT_URI}&scope={scope}"
    )
    return {"url": url}


@api_router.get("/auth/oauth/github/callback")
async def github_callback(code: str, authorization: Optional[str] = Header(default=None)):
    """Callback called after user granted repo access. We link the GitHub token to the current logged-in user."""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")

    # For simplicity: frontend should call this endpoint with an existing Bearer (user logged in already)
    user = await get_user_from_token(authorization)

    async with httpx.AsyncClient() as client_http:
        token_res = await client_http.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
            timeout=20,
        )
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange GitHub code")
        token_data = token_res.json()
        gh_token = token_data.get("access_token")
        if not gh_token:
            raise HTTPException(status_code=400, detail="No GitHub token returned")

        # Fetch GitHub user id
        user_res = await client_http.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {gh_token}"},
            timeout=20,
        )
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub profile")
        gh_profile = user_res.json()
        gh_id = str(gh_profile.get("id"))

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "provider_github_id": gh_id,
                "github_access_token": gh_token,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    return {"status": "linked"}


# ---------- LLM HELPERS ----------


async def call_llm(prompt: str, language: str = "en") -> str:
    """Call Emergent LLM (OpenAI GPT under the hood) to generate text."""
    if not EMERGENT_LLM_KEY:
        # For environments without key, return a mocked response
        return f"[LLM MOCKED RESPONSE] {prompt[:200]}..."

    async with httpx.AsyncClient() as client_http:
        try:
            res = await client_http.post(
                f"{EMERGENT_API_URL}/v1/chat/completions",
                headers={
                    "x-api-key": EMERGENT_LLM_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are an assistant that helps structure software projects, "
                                "generate README files and logical git commit messages. "
                                "Respond in French if language=fr, otherwise English."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"language={language}\n{prompt}",
                        },
                    ],
                    "temperature": 0.6,
                },
                timeout=40,
            )
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"]
        except Exception as exc:  # noqa: BLE001
            logger.error("LLM call failed: %s", exc)
            return f"[LLM ERROR] {prompt[:200]}..."


async def generate_readme(file_list: List[Dict], language: str, project_name: str, description: Optional[str]) -> str:
    summary_lines = []
    for f in file_list[:20]:
        summary_lines.append(f"- {f['path']} ({f['mime_type']}, {f['size']} bytes)")
    files_text = "\n".join(summary_lines)

    prompt = f"""
Tu es une IA qui génère des README.md de haute qualité pour des projets.

Projet: {project_name}
Description utilisateur: {description}
Fichiers fournis:
{files_text}

Génère un README complet (Markdown) avec sections: Overview, Features, Structure, Getting Started, Usage.
"""
    if language == "en":
        prompt = prompt.replace("Génère", "Generate").replace("Fichiers fournis", "Files")

    return await call_llm(prompt, language=language)


async def generate_commit_messages(operations: List[str], language: str) -> List[str]:
    joined = "\n".join(f"- {op}" for op in operations)
    prompt = f"""
Voici une liste d'opérations sur des fichiers dans un dépôt Git:
{joined}

Propose une courte liste (3 à 5) de messages de commit logiques (style Conventional Commits).
Réponds uniquement avec une liste à puces.
"""
    if language == "en":
        prompt = f"""
Here is a list of file operations in a git repository:
{joined}

Propose a short list (3 to 5) of logical commit messages following Conventional Commits.
Respond with bullet list only.
"""
    text = await call_llm(prompt, language=language)
    lines = [line.strip("-* ") for line in text.splitlines() if line.strip()]
    return lines[:5]


# ---------- GENERIC GIT PROVIDER HELPERS ----------


async def create_repo_for_provider(provider: str, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
    git_provider = get_git_provider(provider)
    return await git_provider.create_repo(token, name, description)


async def put_file_for_provider(
    provider: str,
    token: str,
    repo: GitRepoInfo,
    path: str,
    content_bytes: bytes,
    message: str,
):
    git_provider = get_git_provider(provider)
    return await git_provider.put_file(token, repo, path, content_bytes, message)


# ---------- WORKFLOWS: PROJECTS & UPLOADS ----------


UPLOAD_ROOT = ROOT_DIR / "uploads"
UPLOAD_ROOT.mkdir(exist_ok=True)


@api_router.post("/workflows/projects", response_model=ProjectPublic)
async def create_project(payload: ProjectCreate, authorization: Optional[str] = Header(default=None)):
    user = await get_user_from_token(authorization)
    project_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    name = payload.name or f"auto-repo-{project_id[:8]}"

    doc = {
        "_id": project_id,
        "user_id": user["_id"],
        "name": name,
        "description": payload.description,
        "language": payload.language,
        "status": "pending",
        "github_repo_url": None,
        "github_repo_name": None,
        "readme_md": None,
        "commit_messages": [],
        "created_at": now,
        "updated_at": now,
    }
    await db.projects.insert_one(doc)

    return ProjectPublic(
        id=project_id,
        name=name,
        status="pending",
        github_repo_url=None,
        created_at=datetime.fromisoformat(now),
    )


@api_router.get("/workflows/projects", response_model=List[ProjectPublic])
async def list_projects(authorization: Optional[str] = Header(default=None)):
    user = await get_user_from_token(authorization)
    cur = db.projects.find({"user_id": user["_id"]}).sort("created_at", -1)
    items: List[ProjectPublic] = []
    async for doc in cur:
        items.append(
            ProjectPublic(
                id=doc["_id"],
                name=doc["name"],
                status=doc.get("status", "pending"),
                github_repo_url=doc.get("github_repo_url"),
                created_at=datetime.fromisoformat(doc["created_at"]),
            )
        )
    return items


@api_router.get("/workflows/projects/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, authorization: Optional[str] = Header(default=None)):
    user = await get_user_from_token(authorization)
    doc = await db.projects.find_one({"_id": project_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectDetail(
        id=doc["_id"],
        name=doc["name"],
        status=doc.get("status", "pending"),
        github_repo_url=doc.get("github_repo_url"),
        created_at=datetime.fromisoformat(doc["created_at"]),
        description=doc.get("description"),
        readme_md=doc.get("readme_md"),
        commit_messages=doc.get("commit_messages", []),
    )


@api_router.post("/workflows/projects/{project_id}/upload")
async def upload_files(
    project_id: str,
    authorization: Optional[str] = Header(default=None),
    files: List[UploadFile] = File(...),
):
    user = await get_user_from_token(authorization)
    project = await db.projects.find_one({"_id": project_id, "user_id": user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = UPLOAD_ROOT / user["_id"] / project_id
    project_dir.mkdir(parents=True, exist_ok=True)

    uploads_meta = []
    for f in files:
        dest = project_dir / f.filename
        content = await f.read()
        dest.write_bytes(content)
        meta = {
            "_id": str(uuid.uuid4()),
            "project_id": project_id,
            "user_id": user["_id"],
            "original_filename": f.filename,
            "stored_path": str(dest),
            "mime_type": f.content_type,
            "size": len(content),
        }
        uploads_meta.append(meta)

    if uploads_meta:
        await db.uploads.insert_many(uploads_meta)

    await db.projects.update_one(
        {"_id": project_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {"uploaded": len(uploads_meta)}


# ---------- JOBS (WORKFLOW ORCHESTRATION) ----------


async def run_project_pipeline(user: Dict, project: Dict, uploads: List[Dict]) -> Dict:
    """Core pipeline: IA -> README -> commits -> Git repo -> push files.

    Extrait de /process pour pouvoir être réutilisé par les jobs.
    """
    if not user.get("github_access_token"):
        # Pour l'instant, nous utilisons encore le token GitHub comme jeton unique.
        # Plus tard, on pourra stocker un token par provider.
        raise HTTPException(status_code=400, detail="Git provider token not linked for this user")

    if not uploads:
        raise HTTPException(status_code=400, detail="No files uploaded for this project")

    file_list = [
        {"path": os.path.basename(u["stored_path"]), "mime_type": u["mime_type"], "size": u["size"]}
        for u in uploads
    ]

    language = project.get("language", "en")
    provider = project.get("provider", "github")

    # 1) Generate README
    readme_md = await generate_readme(
        file_list=file_list,
        language=language,
        project_name=project["name"],
        description=project.get("description"),
    )

    # 2) Generate commit messages
    operations = [f"add {f['path']}" for f in file_list] + ["add README.md"]
    commit_messages = await generate_commit_messages(operations, language=language)
    main_commit = commit_messages[0] if commit_messages else "chore: initial import"

    # 3) Create Git repo for selected provider
    gh_token = user["github_access_token"]  # TODO: provider-specific tokens
    repo_info = await create_repo_for_provider(provider, gh_token, project["name"], project.get("description"))
    repo_url = repo_info.url

    # 4) Upload files via provider contents API
    for upload in uploads:
        path = os.path.basename(upload["stored_path"])
        content_bytes = Path(upload["stored_path"]).read_bytes()
        await put_file_for_provider(provider, gh_token, repo_info, path, content_bytes, main_commit)

    # Upload README.md
    await put_file_for_provider(provider, gh_token, repo_info, "README.md", readme_md.encode("utf-8"), main_commit)

    now = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one(
        {"_id": project["_id"]},
        {
            "$set": {
                "status": "done",
                "github_repo_url": repo_url,
                "github_repo_name": repo_info.full_name,
                "readme_md": readme_md,
                "commit_messages": commit_messages,
                "updated_at": now,
            }
        },
    )

    updated = await db.projects.find_one({"_id": project["_id"]})
    return updated


async def run_job(job_id: str) -> Dict:
    """Exécute le pipeline pour un job donné (MVP: en ligne, pas de vraie queue)."""
    job = await db.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.jobs.update_one(
        {"_id": job_id},
        {"$set": {"status": "running", "updated_at": datetime.now(timezone.utc).isoformat(), "error": None}},
    )

    user = await db.users.find_one({"_id": job["user_id"]})
    project = await db.projects.find_one({"_id": job["project_id"], "user_id": job["user_id"]})
    if not project:
        await db.jobs.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "error": "Project not found",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
        raise HTTPException(status_code=404, detail="Project not found")

    uploads = await db.uploads.find({"project_id": job["project_id"], "user_id": job["user_id"]}).to_list(1000)

    try:
        updated_project = await run_project_pipeline(user, project, uploads)
        await db.jobs.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "completed",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
        return updated_project
    except Exception as exc:  # noqa: BLE001
        logger.error("Job %s failed: %s", job_id, exc)
        await db.jobs.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(exc),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
        )
        raise


@api_router.post("/jobs", response_model=JobPublic)
async def create_job(payload: JobCreate, authorization: Optional[str] = Header(default=None)):
    """Crée un job de workflow pour un projet et exécute le pipeline (MVP: synchrone)."""
    user = await get_user_from_token(authorization)
    project = await db.projects.find_one({"_id": payload.project_id, "user_id": user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    job_doc = {
        "_id": job_id,
        "user_id": user["_id"],
        "project_id": payload.project_id,
        "status": "pending",
        "error": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.jobs.insert_one(job_doc)

    # Exécution synchrone du job pour MVP
    await run_job(job_id)

    job = await db.jobs.find_one({"_id": job_id})
    return JobPublic(
        id=job["_id"],
        project_id=job["project_id"],
        status=job["status"],
        error=job.get("error"),
        created_at=datetime.fromisoformat(job["created_at"]),
        updated_at=datetime.fromisoformat(job["updated_at"]),
    )


@api_router.get("/jobs", response_model=List[JobPublic])
async def list_jobs(authorization: Optional[str] = Header(default=None)):
    """Liste les jobs de l'utilisateur courant."""
    user = await get_user_from_token(authorization)
    cur = db.jobs.find({"user_id": user["_id"]}).sort("created_at", -1)
    items: List[JobPublic] = []
    async for job in cur:
        items.append(
            JobPublic(
                id=job["_id"],
                project_id=job["project_id"],
                status=job["status"],
                error=job.get("error"),
                created_at=datetime.fromisoformat(job["created_at"]),
                updated_at=datetime.fromisoformat(job["updated_at"]),
            )
        )
    return items


@api_router.get("/jobs/{job_id}", response_model=JobPublic)
async def get_job(job_id: str, authorization: Optional[str] = Header(default=None)):
    """Récupère le détail d'un job."""
    user = await get_user_from_token(authorization)
    job = await db.jobs.find_one({"_id": job_id, "user_id": user["_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobPublic(
        id=job["_id"],
        project_id=job["project_id"],
        status=job["status"],
        error=job.get("error"),
        created_at=datetime.fromisoformat(job["created_at"]),
        updated_at=datetime.fromisoformat(job["updated_at"]),
    )


@api_router.post("/workflows/projects/{project_id}/process", response_model=ProjectDetail)
async def process_project(project_id: str, authorization: Optional[str] = Header(default=None)):
    """Endpoint historique: exécute le pipeline pour un projet et renvoie le projet mis à jour.

    Il crée également un job interne afin de s'aligner avec la nouvelle architecture jobs.
    """
    user = await get_user_from_token(authorization)
    project = await db.projects.find_one({"_id": project_id, "user_id": user["_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    uploads = await db.uploads.find({"project_id": project_id, "user_id": user["_id"]}).to_list(1000)

    # Crée un job pour garder un historique
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    job_doc = {
        "_id": job_id,
        "user_id": user["_id"],
        "project_id": project_id,
        "status": "pending",
        "error": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.jobs.insert_one(job_doc)

    # Exécute le pipeline de manière synchrone (comme avant)
    updated_project = await run_project_pipeline(user, project, uploads)

    # Marque le job comme terminé
    await db.jobs.update_one(
        {"_id": job_id},
        {
            "$set": {
                "status": "completed",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    return ProjectDetail(
        id=updated_project["_id"],
        name=updated_project["name"],
        status=updated_project.get("status", "done"),
        github_repo_url=updated_project.get("github_repo_url"),
        created_at=datetime.fromisoformat(updated_project["created_at"]),
        description=updated_project.get("description"),
        readme_md=updated_project.get("readme_md"),
        commit_messages=updated_project.get("commit_messages", []),
    )


# ---------- BASIC ROOT & HEALTH ----------


@api_router.get("/")
async def root():
    return {"message": "GitPusher API"}


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)
