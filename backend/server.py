from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, Request
from fastapi.responses import JSONResponse, RedirectResponse
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

# GitLab OAuth
GITLAB_CLIENT_ID = os.environ.get("GITLAB_CLIENT_ID", "")
GITLAB_CLIENT_SECRET = os.environ.get("GITLAB_CLIENT_SECRET", "")
GITLAB_REDIRECT_URI = os.environ.get("GITLAB_REDIRECT_URI", "")

# Bitbucket OAuth
BITBUCKET_CLIENT_ID = os.environ.get("BITBUCKET_CLIENT_ID", "")
BITBUCKET_CLIENT_SECRET = os.environ.get("BITBUCKET_CLIENT_SECRET", "")
BITBUCKET_REDIRECT_URI = os.environ.get("BITBUCKET_REDIRECT_URI", "")

# Frontend URL for OAuth redirects
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

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
    credits: Optional[int] = None
    plan: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProjectCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: str = "en"  # "fr" | "en"
    provider: str = "github"  # github | gitlab | bitbucket | gitea | azure_devops


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    provider: Optional[str] = None  # github | gitlab | bitbucket


class ProjectPublic(BaseModel):
    id: str
    name: str
    status: str
    provider: Optional[str] = "github"
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

class PushRequest(BaseModel):
    source: str  # "url" or "base64"
    provider: str  # "github", "gitlab", etc.
    repo_name: Optional[str] = None
    content: Dict[str, Any]  # {"url": "..."} or {"data": "base64...", "filename": "..."}
    api_key: Optional[str] = None  # User API key for authentication
    auto_prompts: Optional[Dict[str, Any]] = None  # AI generation options


api_router = APIRouter(prefix="/api")

@api_router.get("/openapi.yaml")
async def api_openapi():
    """Serve the static OpenAPI YAML for AI agents."""
    from fastapi.responses import PlainTextResponse
    yaml_path = ROOT_DIR / "api" / "openapi.yaml"
    content = yaml_path.read_text(encoding="utf-8")
    return PlainTextResponse(content, media_type="application/yaml")

@app.get("/openapi.yaml")
async def public_openapi():
    """Redirect to /api/openapi.yaml"""
    from fastapi.responses import PlainTextResponse
    yaml_path = ROOT_DIR / "api" / "openapi.yaml"
    content = yaml_path.read_text(encoding="utf-8")
    return PlainTextResponse(content, media_type="application/yaml")

@app.get("/providers")
async def public_providers():
    return {"providers": ["github", "gitlab", "bitbucket", "gitea", "codeberg", "gitee", "azure_devops", "aws_codecommit", "google_cloud_source", "alibaba_cloud", "tencent_cloud"]}

@app.get("/status")
async def public_status():
    return {"status": "ok", "service": "gitpusher", "time": datetime.now(timezone.utc).isoformat()}


@api_router.post("/push")
async def public_push(req: PushRequest, x_api_key: Optional[str] = Header(None)):
    """
    Public push endpoint for AI agents and external integrations.
    
    This endpoint allows AI agents to push code/files to Git repositories.
    Requires authentication via API key (header or body).
    Uses the robust JobManager for credit management.
    
    Flow:
    1. Verify API key and get user
    2. Create job with JobManager (checks credits, doesn't consume)
    3. Process content (download from URL or decode base64)
    4. Generate AI files (README, .gitignore, etc.)
    5. Create repo and push files
    6. Complete job (consumes credits only on success)
    """
    # Get API key from header or body
    api_key = x_api_key or req.api_key
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required. Provide via X-API-Key header or api_key field."
        )
    
    # Verify API key and get user
    # For MVP: we'll use the API key as a user token
    # In production: implement proper API key management
    try:
        user = await get_user_from_token(api_key)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Validate provider token
    provider_token_field = f"{req.provider}_access_token"
    if not user.get(provider_token_field):
        raise HTTPException(
            status_code=400,
            detail=f"{req.provider.title()} token not linked. Connect via OAuth first."
        )
    
    # Generate repo name if not provided
    repo_name = req.repo_name or f"ai-generated-{uuid.uuid4().hex[:8]}"
    
    # Create job using JobManager
    try:
        job = await job_manager.create_job(
            user_id=user["_id"],
            job_type="ai_push",
            job_data={
                "provider": req.provider,
                "repo_name": repo_name,
                "source": req.source,
                "auto_prompts": req.auto_prompts or {}
            },
            required_credits=1
        )
        job_id = job["_id"]
    except ValueError as e:
        raise HTTPException(status_code=402, detail=str(e))
    
    try:
        # Start job
        await job_manager.start_job(job_id)
        await job_manager.add_log(job_id, f"Processing {req.source} source...")
        
        # Process content based on source type
        if req.source == "url":
            # Download from URL
            file_url = req.content.get("url")
            if not file_url:
                raise ValueError("URL source requires 'url' field in content")
            
            await job_manager.add_log(job_id, f"Downloading from: {file_url}")
            
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.get(file_url)
                if response.status_code != 200:
                    raise ValueError(f"Failed to download: HTTP {response.status_code}")
                content = response.content
                filename = file_url.split("/")[-1] or "download.zip"
        
        elif req.source == "base64":
            # Decode base64 content
            b64_data = req.content.get("data")
            filename = req.content.get("filename", "upload.zip")
            
            if not b64_data:
                raise ValueError("Base64 source requires 'data' field in content")
            
            await job_manager.add_log(job_id, f"Decoding base64 content: {filename}")
            content = base64.b64decode(b64_data)
        
        else:
            raise ValueError(f"Unsupported source type: {req.source}")
        
        file_size = len(content)
        await job_manager.add_log(job_id, f"Content received: {file_size} bytes")
        
        # Save and extract files
        upload_id = uuid.uuid4().hex
        result = await storage_service.save_upload(upload_id, content, filename)
        extracted_files = await storage_service.extract_files(upload_id, filename)
        
        await job_manager.add_log(job_id, f"Extracted {len(extracted_files)} files")
        
        # Generate AI files
        file_list = [{"path": f, "mime_type": "text/plain", "size": 0} for f in extracted_files]
        
        await job_manager.add_log(job_id, "Generating README with AI...")
        readme_md = await generate_readme(
            file_list=file_list,
            language="en",
            project_name=repo_name,
            description=None
        )
        
        await job_manager.add_log(job_id, "Generating .gitignore...")
        gitignore_content = await generate_gitignore(file_list=file_list, language="en")
        
        await job_manager.add_log(job_id, "Generating LICENSE...")
        license_content = await generate_license("MIT", user.get("display_name", "Contributor"))
        
        await job_manager.add_log(job_id, "Generating CHANGELOG...")
        changelog_content = await generate_changelog(repo_name)
        
        # Create repo
        await job_manager.add_log(job_id, f"Creating repository on {req.provider}...")
        
        repo_info = await git_service.create_repo(
            token=user[provider_token_field],
            name=repo_name,
            description=f"Created via GitPusher AI",
            private=False,
            provider=req.provider
        )
        
        await job_manager.add_log(job_id, f"Repository created: {repo_info.url}")
        
        # Upload files
        commit_msg = "feat: initial commit via GitPusher AI"
        upload_path = storage_service.get_upload_path(upload_id)
        
        if filename.endswith('.zip'):
            extract_dir = upload_path / "extracted"
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = Path(root) / f
                    rel_path = file_path.relative_to(extract_dir)
                    content_bytes = file_path.read_bytes()
                    
                    await git_service.put_file(
                        token=user[provider_token_field],
                        repo_full_name=repo_info.full_name,
                        path=str(rel_path),
                        content_bytes=content_bytes,
                        message=commit_msg,
                        provider=req.provider
                    )
                    
                    await job_manager.add_log(job_id, f"Uploaded: {rel_path}")
        else:
            # Single file
            file_path = upload_path / filename
            content_bytes = file_path.read_bytes()
            
            await git_service.put_file(
                token=user[provider_token_field],
                repo_full_name=repo_info.full_name,
                path=filename,
                content_bytes=content_bytes,
                message=commit_msg,
                provider=req.provider
            )
        
        # Upload generated files
        await git_service.put_file(
            user[provider_token_field],
            repo_info.full_name,
            "README.md",
            readme_md.encode("utf-8"),
            commit_msg,
            req.provider
        )
        
        await git_service.put_file(
            user[provider_token_field],
            repo_info.full_name,
            ".gitignore",
            gitignore_content.encode("utf-8"),
            commit_msg,
            req.provider
        )
        
        await git_service.put_file(
            user[provider_token_field],
            repo_info.full_name,
            "LICENSE",
            license_content.encode("utf-8"),
            commit_msg,
            req.provider
        )
        
        await git_service.put_file(
            user[provider_token_field],
            repo_info.full_name,
            "CHANGELOG.md",
            changelog_content.encode("utf-8"),
            commit_msg,
            req.provider
        )
        
        await job_manager.add_log(job_id, "All files uploaded successfully!")
        
        # Store repo in DB
        repo_id = str(uuid.uuid4())
        await db.repos_v1.insert_one({
            "_id": repo_id,
            "user_id": user["_id"],
            "job_id": job_id,
            "name": repo_name,
            "url": repo_info.url,
            "provider": req.provider,
            "private": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source": "ai_agent"
        })
        
        # Complete job successfully (CRITICAL: Credits consumed here)
        await job_manager.complete_job(
            job_id=job_id,
            success=True,
            result_data={"repo_url": repo_info.url}
        )
        
        # Cleanup
        await storage_service.cleanup_upload(upload_id)
        
        return {
            "status": "success",
            "job_id": job_id,
            "repo_url": repo_info.url,
            "repo_name": repo_name,
            "provider": req.provider,
            "files_uploaded": len(extracted_files) + 4,  # +4 for generated files
            "next_actions": ["open_repo", "clone_repo", "share_repo"]
        }
        
    except Exception as e:
        # Complete job with failure (CRITICAL: Credits NOT consumed)
        await job_manager.complete_job(
            job_id=job_id,
            success=False,
            error=str(e)
        )
        
        raise HTTPException(status_code=500, detail=str(e))


# Import services after DB is initialized
import sys
sys.path.insert(0, str(ROOT_DIR))

from services.credits_service import CreditsService
from services.storage_service import StorageService  
from services.git_service import GitService
from jobs import JobManager
from models.schemas import (
    GitHubTokenRequest, GitHubTokenResponse,
    UploadInitRequest, UploadInitResponse, UploadStatus, UploadCompleteRequest,
    JobCreateRequest, JobCreateResponse, JobStatus,
    RepoCreateRequest, RepoCreateResponse,
    BillingCreditsResponse, BillingPurchaseRequest, BillingPurchaseResponse,
    AutopushSettings, AutopushTriggerRequest,
    PartnerRepoCreateRequest, WebhookJobCompleted
)
# from routes.admin_credit_safety import admin_dashboard_router  # Commented out to fix circular import

# Routers modulaires (admin, AI, SEO, etc.)
from routes import (
    admin_credit_safety,
    admin_pages,
    admin_users,
    ai_autofix,
    ai_catalog,
    ai_health,
    ai_indexers_extended,
    ai_knowledge,
    backlinks,
    email_routes,
    features_health,
    ping_ai,
    seo_monitor,
    smtp_config,
    stripe_stats,
    tiktok_monitor,
    traffic_routes,
    admin_performance,
    admin_ai_indexing,
    admin_push_analytics,
    v1_auth,
    v1_autopush,
    v1_billing,
    v1_jobs,
    v1_partner,
    v1_repos,
    v1_uploads,
    v1_webhooks,
)


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
    """GitLab provider implementation."""
    
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        """Create a GitLab project."""
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://gitlab.com/api/v4/projects",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "name": name,
                    "description": description or f"Repository {name}",
                    "visibility": "public",
                    "initialize_with_readme": False
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                logger.error(f"GitLab create repo failed: {res.text}")
                raise HTTPException(status_code=400, detail=f"Failed to create GitLab repo: {res.text}")
            
            data = res.json()
            return GitRepoInfo(
                url=data["web_url"],
                full_name=data["path_with_namespace"],
                owner=data["namespace"]["path"],
                name=data["name"],
                clone_url=data["http_url_to_repo"],
                default_branch=data.get("default_branch", "main")
            )

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        """Upload a file to GitLab project."""
        import base64
        content_b64 = base64.b64encode(content_bytes).decode("utf-8")
        project_id = repo.full_name.replace("/", "%2F")
        file_path = path.lstrip("/")
        
        async with httpx.AsyncClient() as client:
            # Try to create file first
            res = await client.post(
                f"https://gitlab.com/api/v4/projects/{project_id}/repository/files/{file_path.replace('/', '%2F')}",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "branch": repo.default_branch or "main",
                    "content": content_b64,
                    "encoding": "base64",
                    "commit_message": message
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                logger.error(f"GitLab put file {path} failed: {res.text}")
                raise HTTPException(status_code=400, detail=f"Failed to upload file {path} to GitLab")


class BitbucketProvider(GitProviderBase):
    """Bitbucket provider implementation."""
    
    async def create_repo(self, token: str, name: str, description: Optional[str]) -> GitRepoInfo:
        """Create a Bitbucket repository."""
        async with httpx.AsyncClient() as client:
            # First get the current user to know the workspace
            user_res = await client.get(
                "https://api.bitbucket.org/2.0/user",
                headers={"Authorization": f"Bearer {token}"},
                timeout=20
            )
            if user_res.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get Bitbucket user info")
            
            username = user_res.json().get("username") or user_res.json().get("nickname")
            
            # Create repo
            res = await client.post(
                f"https://api.bitbucket.org/2.0/repositories/{username}/{name}",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "scm": "git",
                    "is_private": False,
                    "description": description or f"Repository {name}"
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                logger.error(f"Bitbucket create repo failed: {res.text}")
                raise HTTPException(status_code=400, detail=f"Failed to create Bitbucket repo: {res.text}")
            
            data = res.json()
            clone_url = next(
                (link["href"] for link in data.get("links", {}).get("clone", []) if link.get("name") == "https"),
                data.get("links", {}).get("html", {}).get("href", "")
            )
            
            return GitRepoInfo(
                url=data["links"]["html"]["href"],
                full_name=data["full_name"],
                owner=username,
                name=data["name"],
                clone_url=clone_url,
                default_branch=data.get("mainbranch", {}).get("name", "main")
            )

    async def put_file(self, token: str, repo: GitRepoInfo, path: str, content_bytes: bytes, message: str):
        """Upload a file to Bitbucket repository using the src endpoint."""
        import io
        
        async with httpx.AsyncClient() as client:
            # Bitbucket uses multipart form data for file uploads
            files = {
                path.lstrip("/"): content_bytes
            }
            
            res = await client.post(
                f"https://api.bitbucket.org/2.0/repositories/{repo.full_name}/src",
                headers={"Authorization": f"Bearer {token}"},
                data={
                    "message": message,
                    "branch": repo.default_branch or "main"
                },
                files={path.lstrip("/"): (path.lstrip("/"), io.BytesIO(content_bytes))},
                timeout=30
            )
            
            if res.status_code not in [200, 201, 204]:
                logger.error(f"Bitbucket put file {path} failed: {res.text}")
                raise HTTPException(status_code=400, detail=f"Failed to upload file {path} to Bitbucket")


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


# ---------- MIDDLEWARES ----------

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
from autofix.ai_autofix import run_autofix


class SEOAEOAutoFixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # If SEO or AEO route returns 404 → regenerate
        path = request.url.path
        if (path.startswith("/seo/") or path.startswith("/aeo/")) and response.status_code == 404:
            run_autofix()
        if path == "/sitemap.xml" and response.status_code == 404:
            run_autofix()

        return response


app.add_middleware(SEOAEOAutoFixMiddleware)

# Traffic monitoring middleware
@app.middleware("http")
async def traffic_logging_middleware(request: Request, call_next):
    import time
    from ai_monitor.middleware import detect_ai_source
    
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    
    # Log to MongoDB for persistence
    try:
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        ai_source = detect_ai_source(user_agent)
        
        await db.traffic_logs.insert_one({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
            "ip": client_ip,
            "user_agent": user_agent[:100],
            "is_ai": ai_source is not None,
            "ai_source": ai_source
        })
    except:
        pass
    
    return response



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
    
    # Create welcome email template if not exists
    from services.email_service import EmailService
    email_service = EmailService(db)
    existing_template = await email_service.get_template("welcome_email")
    if not existing_template:
        await email_service.create_or_update_template({
            "key": "welcome_email",
            "name": "Welcome Email",
            "subject": "Bienvenue sur GitPusher.AI, {{name}} ! 🚀",
            "body_html": "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f172a;color:#fff'><h1 style='color:#06b6d4'>Bienvenue {{name}} ! 🎉</h1><p>Merci de rejoindre GitPusher.AI !</p><p>Vous avez <strong>5 crédits gratuits</strong> pour commencer.</p><a href='https://gitpusher.ai/dashboard' style='display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(90deg,#06b6d4,#8b5cf6);color:#000;text-decoration:none;border-radius:8px;font-weight:bold'>Accéder au Dashboard</a></div>",
            "body_text": "Bienvenue {{name}} ! Merci de rejoindre GitPusher.AI. Vous avez 5 crédits gratuits."
        }, "system")
        logger.info("Welcome email template created")


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
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


async def get_initial_credits() -> int:
    """Get initial credits for new users from admin settings"""
    credit_settings = await db.admin_settings.find_one({"_id": "credit_settings"})
    return credit_settings.get("initial_credits_free", 5) if credit_settings else 5


async def require_admin(authorization: Optional[str]) -> dict:
    """Ensure the current user is an admin. Raises 403 otherwise."""
    user = await get_user_from_token(authorization)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user



@api_router.post("/billing/plan")
async def set_plan(payload: PlanUpdate, authorization: Optional[str] = Header(default=None)):
    """Simule la mise à jour du plan (freemium, premium, business) pour l'utilisateur courant.

    Pour l'instant, on stocke simplement le champ "plan" dans le document user.
    """
    user = await get_user_from_token(authorization)
    plan = payload.plan.lower()
    if plan not in {"freemium", "premium", "business"}:
        raise HTTPException(status_code=400, detail="Invalid plan")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"plan": plan, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {"status": "ok", "plan": plan}

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




class AdminUserSummary(BaseModel):
    id: str
    email: str  # Use plain str to allow GitHub-provided pseudo emails like *.local
    display_name: Optional[str] = None
    plan: Optional[str] = None
    credits: Optional[int] = None
    created_at: Optional[datetime] = None


class AdminJobSummary(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    status: str
    error: Optional[str] = None
    created_at: datetime


class AdminUserPlanUpdate(BaseModel):
    plan: Optional[str] = None
    credits: Optional[int] = None


class AdminTransactionSummary(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    amount: float
    currency: str = "EUR"
    plan: Optional[str] = None
    credits: Optional[int] = None
    status: str  # succeeded, pending, failed
    payment_method: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    created_at: datetime


class AdminFinancialStats(BaseModel):
    total_revenue: float
    monthly_revenue: float
    total_transactions: int
    successful_transactions: int
    pending_transactions: int
    failed_transactions: int
    average_transaction: float
    revenue_by_plan: Dict[str, float]
    transactions_by_day: List[Dict[str, Any]]


class SupportMessage(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    message: str
    is_admin: bool = False
    created_at: datetime


class SupportConversation(BaseModel):
    user_id: str
    user_email: str
    user_name: Optional[str] = None
    messages: List[SupportMessage]
    unread_count: int = 0
    last_message_at: datetime


class SendMessageRequest(BaseModel):
    message: str
    user_id: Optional[str] = None  # Only for admin sending to specific user


@api_router.get("/admin/users", response_model=List[AdminUserSummary])
async def admin_list_users(authorization: Optional[str] = Header(default=None)):
    admin = await require_admin(authorization)
    _ = admin
    cur = db.users.find({}, {"_id": 1, "email": 1, "display_name": 1, "plan": 1, "credits": 1, "created_at": 1}).limit(100)
    users: List[AdminUserSummary] = []
    async for u in cur:
        users.append(
            AdminUserSummary(
                id=str(u["_id"]),
                email=u["email"],
                display_name=u.get("display_name"),
                plan=u.get("plan"),
                credits=int(u.get("credits", 0)) if u.get("credits") is not None else None,
                created_at=datetime.fromisoformat(u["created_at"]) if u.get("created_at") else None,
            )
        )
    return users


@api_router.get("/admin/jobs", response_model=List[AdminJobSummary])
async def admin_list_jobs(authorization: Optional[str] = Header(default=None)):
    admin = await require_admin(authorization)
    _ = admin
    cur = db.jobs.find({}, {"_id": 1, "user_id": 1, "project_id": 1, "status": 1, "error": 1, "created_at": 1}).sort(
        "created_at", -1
    ).limit(100)
    jobs: List[AdminJobSummary] = []
    async for j in cur:
        jobs.append(
            AdminJobSummary(
                id=str(j["_id"]),
                user_id=str(j.get("user_id")),
                project_id=str(j.get("project_id")) if j.get("project_id") else None,
                status=j.get("status", "unknown"),
                error=j.get("error"),
                created_at=datetime.fromisoformat(j["created_at"]) if j.get("created_at") else datetime.now(timezone.utc),
            )
        )
    return jobs


@api_router.patch("/admin/users/{user_id}/plan-credits")
async def admin_update_user_plan_credits(
    user_id: str,
    payload: AdminUserPlanUpdate,
    authorization: Optional[str] = Header(default=None),
):
    admin = await require_admin(authorization)
    _ = admin
    updates: Dict[str, Any] = {}
    if payload.plan is not None:
        updates["plan"] = payload.plan.lower()
    if payload.credits is not None:
        updates["credits"] = int(payload.credits)

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.users.update_one({"_id": user_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@api_router.post("/admin/users/{user_id}/add-credits")
async def admin_add_credits_to_user(
    user_id: str,
    payload: dict,
    authorization: Optional[str] = Header(default=None),
):
    """Admin endpoint to manually add credits to a specific user"""
    admin = await require_admin(authorization)
    _ = admin
    
    credits_to_add = payload.get("credits", 0)
    if credits_to_add <= 0:
        raise HTTPException(status_code=400, detail="Credits must be positive")
    
    # Get current user
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_credits = user.get("credits", 0)
    new_credits = current_credits + credits_to_add
    
    # Update user credits
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"credits": new_credits, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"ok": True, "new_credits": new_credits, "added": credits_to_add}


@api_router.get("/admin/credit-settings")
async def admin_get_credit_settings(
    authorization: Optional[str] = Header(default=None),
):
    """Get credit settings (initial credits for new users and packs)"""
    admin = await require_admin(authorization)
    _ = admin
    
    settings = await db.admin_settings.find_one({"_id": "credit_settings"})
    if not settings:
        # Default values
        settings = {
            "initial_credits_free": 5,
            "initial_credits_business_pack": 200
        }
    
    return settings


@api_router.patch("/admin/credit-settings")
async def admin_update_credit_settings(
    payload: dict,
    authorization: Optional[str] = Header(default=None),
):
    """Update credit settings"""
    admin = await require_admin(authorization)
    _ = admin
    
    updates = {}
    if "initial_credits_free" in payload:
        updates["initial_credits_free"] = int(payload["initial_credits_free"])
    if "initial_credits_business_pack" in payload:
        updates["initial_credits_business_pack"] = int(payload["initial_credits_business_pack"])
    
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.admin_settings.update_one(
        {"_id": "credit_settings"},
        {"$set": updates},
        upsert=True
    )
    
    return {"ok": True, "settings": updates}


@api_router.get("/admin/transactions", response_model=List[AdminTransactionSummary])
async def admin_list_transactions(authorization: Optional[str] = Header(default=None)):
    """List all financial transactions (real + mock data for demo)"""
    admin = await require_admin(authorization)
    _ = admin
    
    # For now, generate mock data
    # TODO: Replace with real Stripe webhook data from transactions collection
    transactions = []
    
    # Check if we have a transactions collection
    try:
        cur = db.transactions.find({}).sort("created_at", -1).limit(100)
        async for t in cur:
            transactions.append(
                AdminTransactionSummary(
                    id=str(t["_id"]),
                    user_id=str(t.get("user_id", "")),
                    user_email=t.get("user_email"),
                    amount=float(t.get("amount", 0)),
                    currency=t.get("currency", "EUR"),
                    plan=t.get("plan"),
                    credits=t.get("credits"),
                    status=t.get("status", "succeeded"),
                    payment_method=t.get("payment_method"),
                    stripe_payment_id=t.get("stripe_payment_id"),
                    created_at=datetime.fromisoformat(t["created_at"]) if t.get("created_at") else datetime.now(timezone.utc),
                )
            )
    except Exception:
        pass
    
    # Generate mock data if empty (for demo)
    if len(transactions) == 0:
        import random
        plans = ["starter", "pro", "premium", "business"]
        users = await db.users.find({}, {"_id": 1, "email": 1}).limit(10).to_list(10)
        
        for i in range(30):
            days_ago = random.randint(0, 30)
            date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            plan = random.choice(plans)
            amount = {"starter": 9.99, "pro": 29.99, "premium": 99.99, "business": 299.99}[plan]
            status_choice = random.choices(["succeeded", "pending", "failed"], weights=[85, 10, 5])[0]
            
            user = random.choice(users) if users else {"_id": f"user{i}", "email": f"user{i}@example.com"}
            
            transactions.append(
                AdminTransactionSummary(
                    id=f"txn_{i}_{date.strftime('%Y%m%d')}",
                    user_id=str(user["_id"]),
                    user_email=user.get("email", "unknown@example.com"),
                    amount=amount,
                    currency="EUR",
                    plan=plan,
                    credits=None,
                    status=status_choice,
                    payment_method="card",
                    stripe_payment_id=f"pi_mock_{i}" if status_choice == "succeeded" else None,
                    created_at=date,
                )
            )
        
        # Sort by date descending
        transactions.sort(key=lambda x: x.created_at, reverse=True)
    
    return transactions


@api_router.get("/admin/financial-stats", response_model=AdminFinancialStats)
async def admin_financial_stats(authorization: Optional[str] = Header(default=None)):
    """Get financial statistics"""
    admin = await require_admin(authorization)
    _ = admin
    
    # Get all transactions
    transactions = await admin_list_transactions(authorization=authorization)
    
    # Calculate stats
    total_revenue = sum(t.amount for t in transactions if t.status == "succeeded")
    
    # Monthly revenue (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    monthly_revenue = sum(
        t.amount for t in transactions 
        if t.status == "succeeded" and t.created_at >= thirty_days_ago
    )
    
    total_transactions = len(transactions)
    successful_transactions = sum(1 for t in transactions if t.status == "succeeded")
    pending_transactions = sum(1 for t in transactions if t.status == "pending")
    failed_transactions = sum(1 for t in transactions if t.status == "failed")
    
    average_transaction = total_revenue / successful_transactions if successful_transactions > 0 else 0
    
    # Revenue by plan
    revenue_by_plan = {}
    for t in transactions:
        if t.status == "succeeded" and t.plan:
            revenue_by_plan[t.plan] = revenue_by_plan.get(t.plan, 0) + t.amount
    
    # Transactions by day (last 30 days)
    transactions_by_day = []
    for i in range(30):
        day = datetime.now(timezone.utc) - timedelta(days=29-i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_transactions = [
            t for t in transactions 
            if day_start <= t.created_at < day_end
        ]
        
        day_revenue = sum(t.amount for t in day_transactions if t.status == "succeeded")
        day_count = len([t for t in day_transactions if t.status == "succeeded"])
        
        transactions_by_day.append({
            "date": day.strftime("%Y-%m-%d"),
            "label": day.strftime("%d %b"),
            "revenue": round(day_revenue, 2),
            "count": day_count
        })
    
    return AdminFinancialStats(
        total_revenue=round(total_revenue, 2),
        monthly_revenue=round(monthly_revenue, 2),
        total_transactions=total_transactions,
        successful_transactions=successful_transactions,
        pending_transactions=pending_transactions,
        failed_transactions=failed_transactions,
        average_transaction=round(average_transaction, 2),
        revenue_by_plan={k: round(v, 2) for k, v in revenue_by_plan.items()},
        transactions_by_day=transactions_by_day
    )


# ---------- SUPPORT CHAT ENDPOINTS ----------

@api_router.post("/support/messages")
async def send_support_message(payload: SendMessageRequest, authorization: Optional[str] = Header(default=None)):
    """User or admin sends a support message"""
    user = await get_user_from_token(authorization)
    
    # Check if user is admin
    is_admin = user.get("is_admin", False)
    
    message_id = str(uuid.uuid4())
    message_doc = {
        "_id": message_id,
        "user_id": payload.user_id if is_admin and payload.user_id else user["_id"],
        "sender_id": user["_id"],
        "message": payload.message,
        "is_admin": is_admin,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.support_messages.insert_one(message_doc)
    
    return {"ok": True, "message_id": message_id}


@api_router.get("/support/conversations", response_model=List[SupportConversation])
async def get_support_conversations(authorization: Optional[str] = Header(default=None)):
    """Admin: Get all support conversations"""
    admin = await require_admin(authorization)
    _ = admin
    
    # Get all unique users who sent messages
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "last_message_at": {"$max": "$created_at"}
        }},
        {"$sort": {"last_message_at": -1}}
    ]
    
    user_ids = []
    async for doc in db.support_messages.aggregate(pipeline):
        user_ids.append(doc["_id"])
    
    conversations = []
    for uid in user_ids:
        # Get user info
        user = await db.users.find_one({"_id": uid}, {"_id": 0, "email": 1, "display_name": 1})
        if not user:
            continue
        
        # Get messages for this user
        messages_cursor = db.support_messages.find({"user_id": uid}).sort("created_at", 1).limit(100)
        messages = []
        unread = 0
        async for msg in messages_cursor:
            messages.append(SupportMessage(
                id=str(msg["_id"]),
                user_id=str(msg.get("user_id")),
                user_email=user.get("email"),
                user_name=user.get("display_name"),
                message=msg.get("message", ""),
                is_admin=msg.get("is_admin", False),
                created_at=datetime.fromisoformat(msg["created_at"])
            ))
            if not msg.get("is_admin") and not msg.get("read"):
                unread += 1
        
        if messages:
            conversations.append(SupportConversation(
                user_id=uid,
                user_email=user.get("email", ""),
                user_name=user.get("display_name"),
                messages=messages,
                unread_count=unread,
                last_message_at=messages[-1].created_at
            ))
    
    return conversations


@api_router.get("/support/my-messages", response_model=List[SupportMessage])
async def get_my_support_messages(authorization: Optional[str] = Header(default=None)):
    """User: Get my support messages"""
    user = await get_user_from_token(authorization)
    
    messages_cursor = db.support_messages.find({"user_id": user["_id"]}).sort("created_at", 1)
    messages = []
    async for msg in messages_cursor:
        messages.append(SupportMessage(
            id=str(msg["_id"]),
            user_id=str(msg.get("user_id")),
            user_email=user.get("email"),
            user_name=user.get("display_name"),
            message=msg.get("message", ""),
            is_admin=msg.get("is_admin", False),
            created_at=datetime.fromisoformat(msg["created_at"])
        ))
    
    return messages


@api_router.get("/support/unread-count")
async def get_unread_support_messages(authorization: Optional[str] = Header(default=None)):
    """Admin: Get count of unread support messages"""
    admin = await require_admin(authorization)
    _ = admin
    
    # Count messages from users that haven't been read
    count = await db.support_messages.count_documents({
        "is_admin": False,
        "read": {"$ne": True}
    })
    
    return {"unread_count": count}


@api_router.post("/support/mark-read/{user_id}")
async def mark_messages_read(user_id: str, authorization: Optional[str] = Header(default=None)):
    """Admin: Mark all messages from a user as read"""
    admin = await require_admin(authorization)
    _ = admin
    
    await db.support_messages.update_many(
        {"user_id": user_id, "is_admin": False},
        {"$set": {"read": True}}
    )
    
    return {"ok": True}


@api_router.patch("/support/admin-status")
async def update_admin_status(payload: dict, authorization: Optional[str] = Header(default=None)):
    """Admin: Update online/offline status"""
    admin = await require_admin(authorization)
    
    # Store admin status in database
    await db.admin_settings.update_one(
        {"_id": "support_status"},
        {"$set": {
            "admin_id": admin["_id"],
            "online": payload.get("online", True),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"ok": True, "online": payload.get("online", True)}


@api_router.get("/support/admin-online")
async def check_admin_online():
    """Check if an admin is currently online"""
    # Check database for admin status
    status = await db.admin_settings.find_one({"_id": "support_status"})
    
    if status and status.get("online"):
        # Check if status was updated recently (within last 5 minutes)
        if status.get("updated_at"):
            updated = datetime.fromisoformat(status["updated_at"])
            five_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
            if updated > five_mins_ago:
                return {"online": True, "admin_name": "Support Team"}
    
    return {"online": False, "admin_name": "Support Team"}

    # TODO: Implement real presence detection with WebSocket or Redis


# ---------- AUTOFIX INCIDENTS (ADMIN) ----------


class AutofixIncident(BaseModel):
    id: str
    alert_name: str
    severity: str
    status: str
    description: str
    suggested_actions: List[str] = []
    executed_actions: List[str] = []
    diagnosis: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


class AutofixSettings(BaseModel):
    auto_mode: bool = False
    webhook_secret: Optional[str] = None


async def _seed_mock_autofix_incidents() -> List[AutofixIncident]:
    """Seed a few mock incidents in DB if none exist yet.

    This keeps the existing demo behaviour (mock data) but moves it server-side
    so the AdminAutofixPanel can always call the same real endpoint.
    """
    existing = await db.autofix_incidents.find_one({})
    if existing:
        return []

    now = datetime.now(timezone.utc)
    docs = [
        {
            "_id": "inc_001",
            "alert_name": "High CPU Usage - Frontend",
            "severity": "warning",
            "status": "resolved",
            "description": "CPU usage exceeded 85% on frontend pod",
            "suggested_actions": [
                "Restart frontend pod",
                "Scale to 2 replicas",
            ],
            "executed_actions": ["Restarted frontend pod"],
            "created_at": (now - timedelta(hours=1)).isoformat(),
            "resolved_at": (now - timedelta(minutes=50)).isoformat(),
        },
        {
            "_id": "inc_002",
            "alert_name": "Database Connection Pool Exhausted",
            "severity": "critical",
            "status": "pending_approval",
            "description": "MongoDB connection pool reached maximum capacity",
            "suggested_actions": [
                "Increase connection pool size",
                "Restart backend service",
            ],
            "executed_actions": [],
            "created_at": (now - timedelta(minutes=30)).isoformat(),
            "resolved_at": None,
        },
        {
            "_id": "inc_003",
            "alert_name": "Memory Leak - Backend",
            "severity": "warning",
            "status": "investigating",
            "description": "Backend memory usage growing steadily over 24h",
            "suggested_actions": [
                "Analyze heap dump",
                "Restart backend pod",
                "Review recent deployments",
            ],
            "executed_actions": [],
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "resolved_at": None,
        },
    ]
    if docs:
        await db.autofix_incidents.insert_many(docs)
    return []


def _serialize_incident(doc: dict) -> AutofixIncident:
    return AutofixIncident(
        id=str(doc.get("_id")),
        alert_name=doc.get("alert_name", "Unknown alert"),
        severity=doc.get("severity", "info"),
        status=doc.get("status", "investigating"),
        description=doc.get("description", ""),
        suggested_actions=list(doc.get("suggested_actions", [])),
        executed_actions=list(doc.get("executed_actions", [])),
        diagnosis=doc.get("diagnosis"),
        created_at=datetime.fromisoformat(doc["created_at"]) if doc.get("created_at") else datetime.now(timezone.utc),
        resolved_at=datetime.fromisoformat(doc["resolved_at"]) if doc.get("resolved_at") else None,
    )


@api_router.get("/admin/autofix/incidents", response_model=List[AutofixIncident])
async def admin_autofix_list_incidents(authorization: Optional[str] = Header(default=None)):
    """List Autofix incidents for the admin dashboard.

    - Seeds a few demo incidents server-side if collection is empty (MVP).
    - Returns a stable schema consumed by AdminAutofixPanel.
    """
    await require_admin(authorization)

    # Seed demo incidents once
    await _seed_mock_autofix_incidents()

    incidents: List[AutofixIncident] = []
    cursor = db.autofix_incidents.find({}, {"_id": 1, "alert_name": 1, "severity": 1, "status": 1, "description": 1, "suggested_actions": 1, "executed_actions": 1, "created_at": 1, "resolved_at": 1}).sort("created_at", -1).limit(100)
    async for doc in cursor:
        incidents.append(_serialize_incident(doc))
    return incidents


@api_router.post("/admin/autofix/incidents/{incident_id}/approve")
async def admin_autofix_approve_incident(incident_id: str, authorization: Optional[str] = Header(default=None)):
    """Mark an incident as approved and resolved.

    For now this simply updates status/executed_actions to keep behaviour
    close to the original mock UI. Later we can plug real AutoFix actions
    and LLM decisions here.
    """
    await require_admin(authorization)

    doc = await db.autofix_incidents.find_one({"_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident not found")

    executed = list(doc.get("executed_actions", []))
    if "Actions approuvées manuellement" not in executed:
        executed.append("Actions approuvées manuellement")

    await db.autofix_incidents.update_one(
        {"_id": incident_id},
        {
            "$set": {
                "status": "resolved",
                "executed_actions": executed,
                "resolved_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"ok": True}


@api_router.post("/admin/autofix/incidents/{incident_id}/reject")
async def admin_autofix_reject_incident(incident_id: str, authorization: Optional[str] = Header(default=None)):
    await require_admin(authorization)
    res = await db.autofix_incidents.update_one(
        {"_id": incident_id},
        {
            "$set": {
                "status": "failed",
                "resolved_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"ok": True}


@api_router.patch("/admin/autofix/settings", response_model=AutofixSettings)
async def admin_autofix_update_settings(payload: AutofixSettings, authorization: Optional[str] = Header(default=None)):
    await require_admin(authorization)

    await db.admin_settings.update_one(
        {"_id": "autofix_settings"},
        {
            "$set": {
                "auto_mode": payload.auto_mode,
                "webhook_secret": payload.webhook_secret,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )

    return payload


@api_router.get("/admin/autofix/settings", response_model=AutofixSettings)
async def admin_autofix_get_settings(authorization: Optional[str] = Header(default=None)):
    """Return current Autofix settings for the admin UI."""
    await require_admin(authorization)
    return await _get_autofix_settings()


class AutofixIncidentCreate(BaseModel):
    alert_name: str
    severity: str = "info"
    description: str
    alert_payload: Optional[Dict[str, Any]] = None


async def _get_autofix_settings() -> AutofixSettings:
    doc = await db.admin_settings.find_one({"_id": "autofix_settings"})
    if not doc:
        return AutofixSettings(auto_mode=False, webhook_secret=None)
    return AutofixSettings(
        auto_mode=bool(doc.get("auto_mode", False)),
        webhook_secret=doc.get("webhook_secret"),
    )


async def _run_autofix_llm(incident: AutofixIncidentCreate) -> Dict[str, Any]:
    """Call LLM to get diagnosis and remediation actions for an incident.

    Expected JSON output:
    {
      "diagnosis": "...",
      "requires_human_approval": true/false,
      "actions": [
        {"action_type": "restart_pod|scale_replicas|clear_cache|rotate_token",
         "risk": "low|medium|high",
         "description": "..."}
      ]
    }
    """
    # Build prompt inspired by diagnostic_prompt.txt from the standalone module
    alert_block = {
        "alert_name": incident.alert_name,
        "severity": incident.severity,
        "description": incident.description,
        "payload": incident.alert_payload or {},
    }

    prompt = (
        "SYSTEM: You are an operations assistant specialized in diagnosing "
        "infrastructure incidents.\n\n"
        "USER: You receive the following alert as JSON. "
        "You must return a JSON object with the fields: diagnosis (string), "
        "requires_human_approval (bool), actions (array of {action_type, risk, description}).\n"
        "Use ONLY action_type values from: restart_pod, scale_replicas, clear_cache, rotate_token.\n"
        "Alert JSON: " + json.dumps(alert_block)
    )

    raw = await call_llm(prompt, language="en")
    try:
        data = json.loads(raw)
        if not isinstance(data, dict):
            raise ValueError("LLM did not return a JSON object")
        return data
    except Exception:  # noqa: BLE001
        # Fallback safe structure
        return {
            "diagnosis": raw[:500],
            "requires_human_approval": True,
            "actions": [],
        }


@api_router.post("/admin/autofix/incidents", response_model=AutofixIncident)
async def admin_autofix_create_incident(payload: AutofixIncidentCreate, authorization: Optional[str] = Header(default=None)):
    """Create a new Autofix incident and immediately run LLM analysis.

    - Always stores the incident in MongoDB.
    - If auto_mode is enabled and all actions are low risk, marks as resolved
      and simulates execution.
    - Otherwise marks as pending_approval with suggested_actions only.
    """
    admin = await require_admin(authorization)
    _ = admin  # unused for now

    settings = await _get_autofix_settings()

    # Call LLM for diagnosis and actions
    llm_result = await _run_autofix_llm(payload)
    diagnosis = llm_result.get("diagnosis") or ""
    actions = llm_result.get("actions") or []
    requires_human = bool(llm_result.get("requires_human_approval", False))

    # Derive suggested_actions as human readable strings
    suggested_texts: List[str] = []
    low_risk_only = True
    for a in actions:
        atype = a.get("action_type", "action")
        risk = (a.get("risk") or "low").lower()
        desc = a.get("description") or ""
        suggested_texts.append(f"[{risk.upper()}] {atype}: {desc}")
        if risk != "low":
            low_risk_only = False

    now = datetime.now(timezone.utc)

    # Decide status based on auto_mode + risk + requires_human
    executed_actions: List[str] = []
    status = "investigating"
    resolved_at: Optional[str] = None

    if not actions:
        # Nothing concrete to do: keep investigating
        status = "investigating"
    elif requires_human or not settings.auto_mode or not low_risk_only:
        status = "pending_approval"
    else:
        status = "resolved"
        executed_actions = [
            "Auto-exécution des actions approuvées par la policy (low risk)",
        ]
        resolved_at = now.isoformat()

    incident_id = str(uuid.uuid4())
    doc = {
        "_id": incident_id,
        "alert_name": payload.alert_name,
        "severity": payload.severity,
        "status": status,
        "description": payload.description,
        "suggested_actions": suggested_texts,
        "executed_actions": executed_actions,
        "diagnosis": diagnosis,
        "alert_payload": payload.alert_payload or {},
        "created_at": now.isoformat(),
        "resolved_at": resolved_at,
    }
    await db.autofix_incidents.insert_one(doc)

    return _serialize_incident(doc)


@api_router.post("/autofix/webhook/alert", response_model=AutofixIncident)
async def autofix_webhook_alert(request: Request):
    """Public webhook endpoint used by external alerting systems.

    Security:
    - If a webhook_secret is configured in Autofix settings, the caller must
      send it in the `X-Autofix-Secret` header. If it does not match, we
      return 401.
    - If no secret is configured, the endpoint is open (for demo only).
    """
    settings = await _get_autofix_settings()
    configured_secret = settings.webhook_secret

    if configured_secret:
        provided = request.headers.get("X-Autofix-Secret") or request.headers.get("x-autofix-secret")
        if not provided or provided != configured_secret:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    try:
        payload = await request.json()
    except Exception as exc:  # noqa: BLE001
        logger.error("Invalid JSON body for autofix webhook: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    alert_name = payload.get("alert_name") or payload.get("alertname") or payload.get("title") or "External Alert"
    severity = payload.get("severity") or payload.get("level") or "info"
    description = payload.get("description") or payload.get("message") or ""

    incident_create = AutofixIncidentCreate(
        alert_name=alert_name,
        severity=severity,
        description=description,
        alert_payload=payload,
    )

    # Re-use the same pipeline as admin-created incidents. We don't call the
    # admin route directly because it expects an authenticated admin; instead
    # we share the same helper functions.
    settings = await _get_autofix_settings()
    llm_result = await _run_autofix_llm(incident_create)
    diagnosis = llm_result.get("diagnosis") or ""
    actions = llm_result.get("actions") or []
    requires_human = bool(llm_result.get("requires_human_approval", False))

    suggested_texts: List[str] = []
    low_risk_only = True
    for a in actions:
        atype = a.get("action_type", "action")
        risk = (a.get("risk") or "low").lower()
        desc = a.get("description") or ""
        suggested_texts.append(f"[{risk.upper()}] {atype}: {desc}")
        if risk != "low":
            low_risk_only = False

    now = datetime.now(timezone.utc)
    executed_actions: List[str] = []
    status = "investigating"
    resolved_at: Optional[str] = None

    if not actions:
        status = "investigating"
    elif requires_human or not settings.auto_mode or not low_risk_only:
        status = "pending_approval"
    else:
        status = "resolved"
        executed_actions = [
            "Auto-exécution des actions approuvées par la policy (low risk)",
        ]
        resolved_at = now.isoformat()

    incident_id = str(uuid.uuid4())
    doc = {
        "_id": incident_id,
        "alert_name": incident_create.alert_name,
        "severity": incident_create.severity,
        "status": status,
        "description": incident_create.description,
        "suggested_actions": suggested_texts,
        "executed_actions": executed_actions,
        "diagnosis": diagnosis,
        "alert_payload": incident_create.alert_payload or {},
        "created_at": now.isoformat(),
        "resolved_at": resolved_at,
    }
    await db.autofix_incidents.insert_one(doc)

    return _serialize_incident(doc)


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

    initial_credits = await get_initial_credits()

    user_id = str(uuid.uuid4())
    doc = {
        "_id": user_id,
        "email": payload.email,
        "display_name": payload.display_name or payload.email.split("@")[0],
        "password_hash": hash_password(payload.password),
        "provider_google_id": None,
        "provider_github_id": None,
        "github_access_token": None,
        "credits": initial_credits,
        "plan": "freemium",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    
    # Send welcome email (async, non-blocking)
    try:
        from services.email_service import EmailService
        email_service = EmailService(db)
        await email_service.send_from_template(
            "welcome_email",
            doc["email"],
            {"name": doc.get("display_name", doc["email"].split("@")[0])}
        )
        logger.info(f"Welcome email sent to {doc['email']}")
    except Exception as e:
        logger.warning(f"Welcome email failed for {doc['email']}: {str(e)}")

    return UserPublic(id=user_id, email=doc["email"], display_name=doc["display_name"], credits=doc["credits"], plan=doc["plan"])


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
            "credits": 2,  # Demo user gets 2 credits
            "plan": "freemium",  # Freemium plan
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
    return UserPublic(
        id=user["_id"], 
        email=user["email"], 
        display_name=user.get("display_name"),
        credits=user.get("credits"),
        plan=user.get("plan")
    )


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


@api_router.get("/auth/oauth/google/callback")
async def google_callback(code: str):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_not_configured")

    try:
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
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_token_exchange")
            token_data = token_res.json()
            access_token = token_data.get("access_token")

            userinfo_res = await client_http.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=20,
            )
            if userinfo_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_profile_fetch")
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
            initial_credits = await get_initial_credits()
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "email": email,
                "display_name": name,
                "password_hash": None,
                "provider_google_id": google_id,
                "provider_github_id": None,
                "github_access_token": None,
                "credits": initial_credits,
                "plan": "freemium",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(user)
            
            # Send welcome email (async, non-blocking)
            try:
                from services.email_service import EmailService
                email_service = EmailService(db)
                await email_service.send_from_template(
                    "welcome_email",
                    user["email"],
                    {"name": user.get("display_name", user["email"].split("@")[0])}
                )
                logger.info(f"Welcome email sent to {user['email']}")
            except Exception as e:
                logger.warning(f"Welcome email failed for {user['email']}: {str(e)}")

        token = create_access_token({"sub": user["_id"]})
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={token}")
    
    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_failed")


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
async def github_callback(code: str):
    """
    GitHub OAuth callback - can be used for:
    1. Initial login/signup (creates or finds user, returns JWT)
    2. Linking GitHub to existing account (would need user to be logged in)
    For now, we support case 1 (login/signup)
    """
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_not_configured")

    try:
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
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_token_exchange")
            token_data = token_res.json()
            gh_token = token_data.get("access_token")
            if not gh_token:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=no_github_token")

            # Fetch GitHub user profile
            user_res = await client_http.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {gh_token}"},
                timeout=20,
            )
            if user_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_profile_fetch")
            gh_profile = user_res.json()
            gh_id = str(gh_profile.get("id"))
            gh_email = gh_profile.get("email")
            gh_login = gh_profile.get("login")
            gh_name = gh_profile.get("name") or gh_login

            # If no public email, try to fetch from emails endpoint
            if not gh_email:
                emails_res = await client_http.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {gh_token}"},
                    timeout=20,
                )
                if emails_res.status_code == 200:
                    emails = emails_res.json()
                    primary = next((e for e in emails if e.get("primary")), None)
                    gh_email = primary["email"] if primary else emails[0]["email"] if emails else None
            
            # Fallback email if still none (must be a syntactically valid domain for EmailStr)
            if not gh_email:
                # Use a non-reserved, fake but valid-looking domain to satisfy email validation
                gh_email = f"{gh_login}@github.pushify.app"

        # Find or create user
        user = await db.users.find_one({"email": gh_email})
        if user:
            # Update existing user with GitHub info
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
        else:
            # Create new user
            initial_credits = await get_initial_credits()
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "email": gh_email,
                "display_name": gh_name,
                "password_hash": None,
                "provider_google_id": None,
                "provider_github_id": gh_id,
                "github_access_token": gh_token,
                "credits": initial_credits,
                "plan": "freemium",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(user)
            
            # Send welcome email (async, non-blocking)
            try:
                from services.email_service import EmailService
                email_service = EmailService(db)
                await email_service.send_from_template(
                    "welcome_email",
                    user["email"],
                    {"name": user.get("display_name", user["email"].split("@")[0])}
                )
                logger.info(f"Welcome email sent to {user['email']}")
            except Exception as e:
                logger.warning(f"Welcome email failed for {user['email']}: {str(e)}")

        # Create JWT token for the user
        token = create_access_token({"sub": user["_id"]})
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={token}")

    except Exception as e:
        logger.error(f"GitHub OAuth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_failed")


# =============================================
# GitLab OAuth Endpoints
# =============================================

@api_router.get("/auth/oauth/gitlab/url")
async def gitlab_oauth_url():
    """Get GitLab OAuth authorization URL."""
    if not GITLAB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitLab OAuth not configured")
    scope = "read_user+read_api+write_repository"
    url = (
        "https://gitlab.com/oauth/authorize"
        f"?client_id={GITLAB_CLIENT_ID}"
        f"&redirect_uri={GITLAB_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
    )
    return {"url": url}


@api_router.get("/auth/oauth/gitlab/callback")
async def gitlab_callback(code: str):
    """GitLab OAuth callback - login/signup with GitLab."""
    if not GITLAB_CLIENT_ID or not GITLAB_CLIENT_SECRET:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_not_configured")

    try:
        async with httpx.AsyncClient() as client_http:
            # Exchange code for access token
            token_res = await client_http.post(
                "https://gitlab.com/oauth/token",
                data={
                    "client_id": GITLAB_CLIENT_ID,
                    "client_secret": GITLAB_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": GITLAB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"},
                timeout=20,
            )
            if token_res.status_code != 200:
                logger.error(f"GitLab token exchange failed: {token_res.text}")
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_token_exchange")
            
            token_data = token_res.json()
            gl_token = token_data.get("access_token")
            if not gl_token:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=no_gitlab_token")

            # Fetch GitLab user profile
            user_res = await client_http.get(
                "https://gitlab.com/api/v4/user",
                headers={"Authorization": f"Bearer {gl_token}"},
                timeout=20,
            )
            if user_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_profile_fetch")
            
            gl_profile = user_res.json()
            gl_id = str(gl_profile.get("id"))
            gl_email = gl_profile.get("email")
            gl_username = gl_profile.get("username")
            gl_name = gl_profile.get("name") or gl_username

            # Fallback email
            if not gl_email:
                gl_email = f"{gl_username}@gitlab.pushify.app"

        # Find or create user
        user = await db.users.find_one({"email": gl_email})
        if user:
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "provider_gitlab_id": gl_id,
                        "gitlab_access_token": gl_token,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
            )
        else:
            initial_credits = await get_initial_credits()
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "email": gl_email,
                "display_name": gl_name,
                "password_hash": None,
                "provider_gitlab_id": gl_id,
                "gitlab_access_token": gl_token,
                "credits": initial_credits,
                "plan": "freemium",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(user)
            
            # Send welcome email (async, non-blocking)
            try:
                from services.email_service import EmailService
                email_service = EmailService(db)
                await email_service.send_from_template(
                    "welcome_email",
                    user["email"],
                    {"name": user.get("display_name", user["email"].split("@")[0])}
                )
                logger.info(f"Welcome email sent to {user['email']}")
            except Exception as e:
                logger.warning(f"Welcome email failed for {user['email']}: {str(e)}")

        token = create_access_token({"sub": user["_id"]})
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={token}")

    except Exception as e:
        logger.error(f"GitLab OAuth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_failed")


# =============================================
# Bitbucket OAuth Endpoints
# =============================================

@api_router.get("/auth/oauth/bitbucket/url")
async def bitbucket_oauth_url():
    """Get Bitbucket OAuth authorization URL."""
    if not BITBUCKET_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Bitbucket OAuth not configured")
    url = (
        "https://bitbucket.org/site/oauth2/authorize"
        f"?client_id={BITBUCKET_CLIENT_ID}"
        f"&redirect_uri={BITBUCKET_REDIRECT_URI}"
        f"&response_type=code"
    )
    return {"url": url}


@api_router.get("/auth/oauth/bitbucket/callback")
async def bitbucket_callback(code: str):
    """Bitbucket OAuth callback - login/signup with Bitbucket."""
    if not BITBUCKET_CLIENT_ID or not BITBUCKET_CLIENT_SECRET:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_not_configured")

    try:
        async with httpx.AsyncClient() as client_http:
            # Exchange code for access token (Bitbucket uses Basic Auth)
            import base64
            auth_header = base64.b64encode(f"{BITBUCKET_CLIENT_ID}:{BITBUCKET_CLIENT_SECRET}".encode()).decode()
            
            token_res = await client_http.post(
                "https://bitbucket.org/site/oauth2/access_token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": BITBUCKET_REDIRECT_URI,
                },
                headers={
                    "Authorization": f"Basic {auth_header}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=20,
            )
            if token_res.status_code != 200:
                logger.error(f"Bitbucket token exchange failed: {token_res.text}")
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_token_exchange")
            
            token_data = token_res.json()
            bb_token = token_data.get("access_token")
            if not bb_token:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=no_bitbucket_token")

            # Fetch Bitbucket user profile
            user_res = await client_http.get(
                "https://api.bitbucket.org/2.0/user",
                headers={"Authorization": f"Bearer {bb_token}"},
                timeout=20,
            )
            if user_res.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=failed_profile_fetch")
            
            bb_profile = user_res.json()
            bb_id = bb_profile.get("account_id") or bb_profile.get("uuid")
            bb_username = bb_profile.get("username") or bb_profile.get("nickname")
            bb_name = bb_profile.get("display_name") or bb_username

            # Fetch email from emails endpoint
            emails_res = await client_http.get(
                "https://api.bitbucket.org/2.0/user/emails",
                headers={"Authorization": f"Bearer {bb_token}"},
                timeout=20,
            )
            bb_email = None
            if emails_res.status_code == 200:
                emails_data = emails_res.json()
                emails = emails_data.get("values", [])
                primary = next((e for e in emails if e.get("is_primary")), None)
                bb_email = primary["email"] if primary else (emails[0]["email"] if emails else None)
            
            if not bb_email:
                bb_email = f"{bb_username}@bitbucket.pushify.app"

        # Find or create user
        user = await db.users.find_one({"email": bb_email})
        if user:
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "provider_bitbucket_id": bb_id,
                        "bitbucket_access_token": bb_token,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
            )
        else:
            initial_credits = await get_initial_credits()
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "email": bb_email,
                "display_name": bb_name,
                "password_hash": None,
                "provider_bitbucket_id": bb_id,
                "bitbucket_access_token": bb_token,
                "credits": initial_credits,
                "plan": "freemium",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(user)
            
            # Send welcome email (async, non-blocking)
            try:
                from services.email_service import EmailService
                email_service = EmailService(db)
                await email_service.send_from_template(
                    "welcome_email",
                    user["email"],
                    {"name": user.get("display_name", user["email"].split("@")[0])}
                )
                logger.info(f"Welcome email sent to {user['email']}")
            except Exception as e:
                logger.warning(f"Welcome email failed for {user['email']}: {str(e)}")

        token = create_access_token({"sub": user["_id"]})
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={token}")

    except Exception as e:
        logger.error(f"Bitbucket OAuth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?error=oauth_failed")


# ---------- LLM HELPERS ----------


async def call_llm(prompt: str, language: str = "en") -> str:
    """Call Emergent LLM (OpenAI GPT under the hood) to generate text using emergentintegrations."""
    if not EMERGENT_LLM_KEY:
        # For environments without key, return a mocked response
        return f"[LLM MOCKED RESPONSE] {prompt[:200]}..."

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        system_message = (
            "You are an assistant that helps structure software projects, "
            "generate README files and logical git commit messages. "
            f"Respond in {'French' if language == 'fr' else 'English'}."
        )
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gitpusher-{uuid.uuid4().hex[:8]}",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
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


async def generate_gitignore(file_list: List[Dict], language: str) -> str:
    """Generate a .gitignore file based on project files."""
    # Detect languages/frameworks from files
    extensions = set()
    frameworks = []
    
    for f in file_list:
        path = f.get('path', '')
        ext = path.split('.')[-1] if '.' in path else ''
        extensions.add(ext)
        
        # Detect frameworks/tools
        if 'package.json' in path:
            frameworks.append('Node.js')
        if 'requirements.txt' in path or 'setup.py' in path:
            frameworks.append('Python')
        if 'pom.xml' in path or 'build.gradle' in path:
            frameworks.append('Java')
        if 'Gemfile' in path:
            frameworks.append('Ruby')
        if 'go.mod' in path:
            frameworks.append('Go')
    
    frameworks_text = ", ".join(set(frameworks)) if frameworks else "Generic"
    
    prompt = f"""
Generate a comprehensive .gitignore file for a project using: {frameworks_text}

File extensions detected: {', '.join(list(extensions)[:10])}

Include common ignores for:
- IDE files (VSCode, IntelliJ, etc.)
- OS files (macOS, Windows, Linux)
- Build artifacts
- Dependencies folders
- Environment files
- Logs and temporary files

Respond ONLY with the .gitignore content, no explanations.
"""
    
    return await call_llm(prompt, language="en")


async def generate_license(license_type: str = "MIT", author_name: str = "Project Contributors") -> str:
    """Generate a LICENSE file."""
    current_year = datetime.now(timezone.utc).year
    
    if license_type.upper() == "MIT":
        return f"""MIT License

Copyright (c) {current_year} {author_name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
    
    # For other licenses, use LLM
    prompt = f"""
Generate a complete {license_type} license text for year {current_year} and author "{author_name}".
Respond ONLY with the license text, no explanations.
"""
    return await call_llm(prompt, language="en")


async def generate_changelog(project_name: str, initial_version: str = "1.0.0") -> str:
    """Generate an initial CHANGELOG.md file."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    return f"""# Changelog

All notable changes to {project_name} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [{initial_version}] - {today}

### Added
- Initial project setup
- Core functionality implementation
- Basic documentation

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

[Unreleased]: https://github.com/username/{project_name}/compare/v{initial_version}...HEAD
[{initial_version}]: https://github.com/username/{project_name}/releases/tag/v{initial_version}
"""


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



async def update_remote_repo_metadata(
    provider: str,
    token: str,
    repo_full_name: str,
    new_name: Optional[str] = None,
    new_description: Optional[str] = None,
) -> Dict[str, str]:
    """Update remote repository metadata (name/description) on supported providers.

    Best-effort: if provider is not supported or no changes, this is a no-op.
    Returns a dict with optional updated "full_name" and "url" keys.
    """
    if not token or not repo_full_name or not (new_name or new_description):
        return {}

    # Normalise provider name
    provider = (provider or "github").lower()

    try:
        async with httpx.AsyncClient() as client:
            if provider == "github":
                payload: Dict[str, Any] = {}
                if new_name:
                    payload["name"] = new_name
                if new_description is not None:
                    payload["description"] = new_description
                if not payload:
                    return {}

                res = await client.patch(
                    f"https://api.github.com/repos/{repo_full_name}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/vnd.github.v3+json",
                    },
                    json=payload,
                    timeout=30,
                )
                if res.status_code not in (200, 201):
                    logger.error("GitHub rename API error %s: %s", res.status_code, res.text)
                    return {}
                data = res.json()
                return {
                    "full_name": data.get("full_name", repo_full_name),
                    "url": data.get("html_url"),
                }

            if provider == "gitlab":
                payload = {}
                if new_name:
                    payload["name"] = new_name
                if new_description is not None:
                    payload["description"] = new_description
                if not payload:
                    return {}

                project_id = repo_full_name.replace("/", "%2F")
                res = await client.put(
                    f"https://gitlab.com/api/v4/projects/{project_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    json=payload,
                    timeout=30,
                )
                if res.status_code not in (200, 201):
                    logger.error("GitLab rename API error %s: %s", res.status_code, res.text)
                    return {}
                data = res.json()
                return {
                    "full_name": data.get("path_with_namespace", repo_full_name),
                    "url": data.get("web_url"),
                }
    except Exception as exc:  # noqa: BLE001
        logger.error("Remote repo metadata update failed for %s: %s", provider, exc)

    return {}


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
        "provider": (payload.provider or "github").lower(),
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
                provider=doc.get("provider", "github"),
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
        provider=doc.get("provider", "github"),
        github_repo_url=doc.get("github_repo_url"),
        created_at=datetime.fromisoformat(doc["created_at"]),
        description=doc.get("description"),
        readme_md=doc.get("readme_md"),
        commit_messages=doc.get("commit_messages", []),
    )


@api_router.patch("/workflows/projects/{project_id}", response_model=ProjectDetail)
async def update_project(project_id: str, payload: ProjectUpdate, authorization: Optional[str] = Header(default=None)):
    """Met à jour les métadonnées du projet (nom du repo, description, langue).

    En plus de mettre à jour le document projet dans MongoDB, cette route tente
    aussi de renommer le dépôt distant (GitHub/GitLab) si possible.
    """
    user = await get_user_from_token(authorization)
    doc = await db.projects.find_one({"_id": project_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")

    updates: Dict[str, Any] = {}
    new_name = payload.name if payload.name is not None else None
    new_description = payload.description if payload.description is not None else None

    # D'abord, tenter la mise à jour côté provider si le repo a déjà été créé
    provider = (doc.get("provider") or "github").lower()
    remote_full_name = doc.get("github_repo_name") or doc.get("remote_repo_full_name")

    if remote_full_name and (new_name or new_description):
        # Choisir le bon token suivant le provider
        git_token = None
        if provider == "github":
            git_token = user.get("github_access_token")
        elif provider == "gitlab":
            git_token = user.get("gitlab_access_token")
        elif provider == "bitbucket":
            git_token = user.get("bitbucket_access_token")

        remote_updates = await update_remote_repo_metadata(
            provider=provider,
            token=git_token,
            repo_full_name=remote_full_name,
            new_name=new_name,
            new_description=new_description,
        )
        # Si le full_name a changé côté provider (cas rename GitHub/GitLab), on le stocke
        if remote_updates.get("full_name") and remote_updates["full_name"] != remote_full_name:
            updates["github_repo_name"] = remote_updates["full_name"]
        if remote_updates.get("url") and not doc.get("github_repo_url"):
            updates["github_repo_url"] = remote_updates["url"]

    # Ensuite, mettre à jour les champs locaux
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.description is not None:
        updates["description"] = payload.description
    if payload.language is not None:
        updates["language"] = payload.language
    if payload.provider is not None:
        updates["provider"] = payload.provider.lower()

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.projects.update_one({"_id": project_id}, {"$set": updates})
        doc = await db.projects.find_one({"_id": project_id, "user_id": user["_id"]})

    return ProjectDetail(
        id=doc["_id"],
        name=doc["name"],
        status=doc.get("status", "pending"),
        provider=doc.get("provider", "github"),
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
    # Get the provider and corresponding token
    provider = project.get("provider", "github").lower()
    
    # Get the appropriate token based on provider
    git_token = None
    if provider == "github":
        git_token = user.get("github_access_token")
    elif provider == "gitlab":
        git_token = user.get("gitlab_access_token")
    elif provider == "bitbucket":
        git_token = user.get("bitbucket_access_token")
    else:
        # Default to GitHub token for other providers
        git_token = user.get("github_access_token")
    
    if not git_token:
        raise HTTPException(status_code=400, detail=f"Git provider token not linked for this user (provider: {provider})")

    if not uploads:
        raise HTTPException(status_code=400, detail="No files uploaded for this project")

    file_list = [
        {"path": os.path.basename(u["stored_path"]), "mime_type": u["mime_type"], "size": u["size"]}
        for u in uploads
    ]

    language = project.get("language", "en")
    auto_prompts = project.get("auto_prompts", {
        "readme": True,
        "gitignore": True,
        "license": True,
        "changelog": True
    })

    # 1) Generate README
    readme_md = None
    if auto_prompts.get("readme", True):
        readme_md = await generate_readme(
            file_list=file_list,
            language=language,
            project_name=project["name"],
            description=project.get("description"),
        )

    # 2) Generate .gitignore
    gitignore_content = None
    if auto_prompts.get("gitignore", True):
        gitignore_content = await generate_gitignore(file_list=file_list, language=language)

    # 3) Generate LICENSE
    license_content = None
    if auto_prompts.get("license", True):
        author_name = user.get("display_name", "Project Contributors")
        license_content = await generate_license(license_type="MIT", author_name=author_name)

    # 4) Generate CHANGELOG
    changelog_content = None
    if auto_prompts.get("changelog", True):
        changelog_content = await generate_changelog(project_name=project["name"])

    # 5) Generate commit messages
    operations = [f"add {f['path']}" for f in file_list]
    if readme_md:
        operations.append("add README.md")
    if gitignore_content:
        operations.append("add .gitignore")
    if license_content:
        operations.append("add LICENSE")
    if changelog_content:
        operations.append("add CHANGELOG.md")
    
    commit_messages = await generate_commit_messages(operations, language=language)
    main_commit = commit_messages[0] if commit_messages else "chore: initial import"

    # 6) Create Git repo for selected provider
    repo_info = await create_repo_for_provider(provider, git_token, project["name"], project.get("description"))
    repo_url = repo_info.url

    # 7) Upload user files via provider contents API
    for upload in uploads:
        path = os.path.basename(upload["stored_path"])
        content_bytes = Path(upload["stored_path"]).read_bytes()
        await put_file_for_provider(provider, git_token, repo_info, path, content_bytes, main_commit)

    # 8) Upload generated files
    if readme_md:
        await put_file_for_provider(provider, git_token, repo_info, "README.md", readme_md.encode("utf-8"), main_commit)
    
    if gitignore_content:
        await put_file_for_provider(provider, git_token, repo_info, ".gitignore", gitignore_content.encode("utf-8"), main_commit)
    
    if license_content:
        await put_file_for_provider(provider, git_token, repo_info, "LICENSE", license_content.encode("utf-8"), main_commit)
    
    if changelog_content:
        await put_file_for_provider(provider, git_token, repo_info, "CHANGELOG.md", changelog_content.encode("utf-8"), main_commit)

    now = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one(
        {"_id": project["_id"]},
        {
            "$set": {
                "status": "done",
                "provider": provider,
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



# ---------- V1 API INITIALIZATION ----------

# Initialize services after DB
credits_service = CreditsService(db)
storage_service = StorageService()
git_service = GitService()
job_manager = JobManager(db, credits_service)

# V1 Router
v1_router = APIRouter(prefix="/v1")


# ---------- V1 AUTH ENDPOINTS ----------

@v1_router.post("/auth/github", response_model=GitHubTokenResponse)
async def v1_connect_github(payload: GitHubTokenRequest):
    """Connect GitHub via Personal Access Token."""
    github_token = payload.githubToken
    
    # Validate token
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {github_token}"},
            timeout=20
        )
        
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid GitHub token")
        
        gh_profile = user_res.json()
        gh_id = str(gh_profile.get("id"))
        gh_email = gh_profile.get("email") or f"{gh_profile.get('login')}@github.local"
        gh_name = gh_profile.get("name") or gh_profile.get("login")
        
        scopes_header = user_res.headers.get("X-OAuth-Scopes", "")
        scopes = [s.strip() for s in scopes_header.split(",")] if scopes_header else []
    
    # Find or create user
    user = await db.users.find_one({"email": gh_email})
    if user:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "provider_github_id": gh_id,
                "github_access_token": github_token,
                "github_scopes": scopes,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        user_id = user["_id"]
    else:
        user_id = str(uuid.uuid4())
        await db.users.insert_one({
            "_id": user_id,
            "email": gh_email,
            "display_name": gh_name,
            "provider_github_id": gh_id,
            "github_access_token": github_token,
            "github_scopes": scopes,
            "credits": 10,
            "plan": "free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    return GitHubTokenResponse(userId=user_id, githubScopes=scopes)


# ---------- V1 UPLOADS ENDPOINTS ----------

@v1_router.post("/uploads/init", response_model=UploadInitResponse)
async def v1_init_upload(payload: UploadInitRequest, authorization: str = Header(None)):
    """Initialize upload and get presigned URL."""
    user = await get_user_from_token(authorization)
    
    upload_id, presigned_url = await storage_service.init_upload(payload.filename, payload.contentType)
    
    await db.uploads_v1.insert_one({
        "_id": upload_id,
        "user_id": user["_id"],
        "filename": payload.filename,
        "content_type": payload.contentType,
        "status": "initialized",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return UploadInitResponse(uploadId=upload_id, presignedUrl=presigned_url, expiresIn=3600)


@v1_router.post("/uploads", response_model=UploadStatus)
async def v1_upload_direct(file: UploadFile = File(...), authorization: str = Header(None)):
    """Direct upload (fallback)."""
    user = await get_user_from_token(authorization)
    
    upload_id = uuid.uuid4().hex
    content = await file.read()
    
    result = await storage_service.save_upload(upload_id, content, file.filename)
    extracted_files = await storage_service.extract_files(upload_id, file.filename)
    
    await db.uploads_v1.insert_one({
        "_id": upload_id,
        "user_id": user["_id"],
        "filename": file.filename,
        "status": "processed",
        "size": result["size"],
        "mime_type": result["mime_type"],
        "extracted_files": extracted_files,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return UploadStatus(uploadId=upload_id, status="processed", extractedFiles=extracted_files, size=result["size"])


@v1_router.get("/uploads/{upload_id}", response_model=UploadStatus)
async def v1_get_upload_status(upload_id: str):
    """Get upload status."""
    upload = await db.uploads_v1.find_one({"_id": upload_id})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return UploadStatus(
        uploadId=upload_id,
        status=upload.get("status", "unknown"),
        extractedFiles=upload.get("extracted_files", []),
        size=upload.get("size", 0)
    )


@v1_router.post("/uploads/complete")



# ---------- V1 PROVIDERS ENDPOINT ----------

@v1_router.get("/providers")
async def v1_list_providers():
    """List all supported Git providers."""



# ---------- SIMPLIFIED UPLOAD ENDPOINT (All-in-One) ----------

@v1_router.post("/upload")
async def v1_upload_and_push(
    provider: str = Form(...),
    repoName: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    """
    Simplified endpoint: Upload file and push to Git provider in one call.
    This combines upload + job creation + processing into a single endpoint.
    """
    user = await get_user_from_token(authorization)
    
    # Check GitHub token
    if not user.get("github_access_token"):
        raise HTTPException(status_code=400, detail="GitHub token not linked. Please connect via OAuth first.")
    
    # Create job using JobManager (checks credits but doesn't consume yet)
    try:
        job = await job_manager.create_job(
            user_id=user["_id"],
            job_type="upload",
            job_data={
                "provider": provider,
                "repo_name": repoName
            },
            required_credits=1
        )
        job_id = job["_id"]
    except ValueError as e:
        raise HTTPException(status_code=402, detail=str(e))
    
    try:
        # Start job
        await job_manager.start_job(job_id)
        await job_manager.add_log(job_id, "Processing upload...")
        
        # Read file
        content = await file.read()
        file_size = len(content)
        
        await job_manager.add_log(job_id, f"File received: {file.filename} ({file_size} bytes)")
        
        # Extract if ZIP
        upload_id = uuid.uuid4().hex
        result = await storage_service.save_upload(upload_id, content, file.filename)
        extracted_files = await storage_service.extract_files(upload_id, file.filename)
        
        await job_manager.add_log(job_id, f"Extracted {len(extracted_files)} files")
        
        # Generate AI files
        file_list = [{"path": f, "mime_type": "text/plain", "size": 0} for f in extracted_files]
        
        await job_manager.add_log(job_id, "Generating README with AI...")
        
        readme_md = await generate_readme(
            file_list=file_list,
            language="en",
            project_name=repoName,
            description=None
        )
        
        await job_manager.add_log(job_id, "Generating .gitignore...")
        
        gitignore_content = await generate_gitignore(file_list=file_list, language="en")
        
        await job_manager.add_log(job_id, "Generating LICENSE...")
        
        license_content = await generate_license("MIT", user.get("display_name", "Contributor"))
        
        await job_manager.add_log(job_id, "Generating CHANGELOG...")
        
        changelog_content = await generate_changelog(repoName)
        
        # Create repo on selected provider
        await job_manager.add_log(job_id, f"Creating repository on {provider}...")
        
        repo_info = await git_service.create_repo(
            token=user["github_access_token"],
            name=repoName,
            description=f"Created via GitPusher",
            private=False,
            provider=provider
        )
        
        await job_manager.add_log(job_id, f"Repository created: {repo_info.url}")
        
        # Upload all files
        commit_msg = "feat: initial commit via GitPusher"
        
        # Upload user files
        upload_path = storage_service.get_upload_path(upload_id)
        if file.filename.endswith('.zip'):
            extract_dir = upload_path / "extracted"
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = Path(root) / f
                    rel_path = file_path.relative_to(extract_dir)
                    content_bytes = file_path.read_bytes()
                    
                    await git_service.put_file(
                        token=user["github_access_token"],
                        repo_full_name=repo_info.full_name,
                        path=str(rel_path),
                        content_bytes=content_bytes,
                        message=commit_msg,
                        provider=provider
                    )
                    
                    await job_manager.add_log(job_id, f"Uploaded: {rel_path}")
        else:
            # Single file
            file_path = upload_path / file.filename
            content_bytes = file_path.read_bytes()
            
            await git_service.put_file(
                token=user["github_access_token"],
                repo_full_name=repo_info.full_name,
                path=file.filename,
                content_bytes=content_bytes,
                message=commit_msg,
                provider=provider
            )
        
        # Upload generated files
        await git_service.put_file(
            user["github_access_token"],
            repo_info.full_name,
            "README.md",
            readme_md.encode("utf-8"),
            commit_msg,
            provider
        )
        
        await git_service.put_file(
            user["github_access_token"],
            repo_info.full_name,
            ".gitignore",
            gitignore_content.encode("utf-8"),
            commit_msg,
            provider
        )
        
        await git_service.put_file(
            user["github_access_token"],
            repo_info.full_name,
            "LICENSE",
            license_content.encode("utf-8"),
            commit_msg,
            provider
        )
        
        await git_service.put_file(
            user["github_access_token"],
            repo_info.full_name,
            "CHANGELOG.md",
            changelog_content.encode("utf-8"),
            commit_msg,
            provider
        )
        
        await job_manager.add_log(job_id, "All files uploaded successfully!")
        
        # Store repo in DB
        repo_id = str(uuid.uuid4())
        await db.repos_v1.insert_one({
            "_id": repo_id,
            "user_id": user["_id"],
            "job_id": job_id,
            "name": repoName,
            "url": repo_info.url,
            "provider": provider,
            "private": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Complete job successfully (CRITICAL: Credits consumed here)
        await job_manager.complete_job(
            job_id=job_id,
            success=True,
            result_data={"repo_url": repo_info.url}
        )
        
        # Cleanup
        await storage_service.cleanup_upload(upload_id)
        
        return {
            "jobId": job_id,
            "status": "success",
            "repoUrl": repo_info.url,
            "message": "Repository created and files pushed successfully!"
        }
        
    except Exception as e:
        # Complete job with failure (CRITICAL: Credits NOT consumed)
        await job_manager.complete_job(
            job_id=job_id,
            success=False,
            error=str(e)
        )
        
        raise HTTPException(status_code=500, detail=str(e))


# Update /repos endpoint to support provider filter
@v1_router.get("/repos/by-provider")
async def v1_list_repos_by_provider(provider: Optional[str] = None, authorization: str = Header(None)):
    """List repos filtered by provider."""
    user = await get_user_from_token(authorization)
    
    query = {"user_id": user["_id"]}
    if provider:
        query["provider"] = provider
    
    repos = await db.repos_v1.find(query, {"_id": 0}).to_list(100)
    return {"repos": repos, "provider": provider}

    return {"providers": git_service.get_all_providers()}

async def v1_complete_upload(payload: UploadCompleteRequest, authorization: str = Header(None)):
    """Complete upload and create job."""
    user = await get_user_from_token(authorization)
    
    upload = await db.uploads_v1.find_one({"_id": payload.uploadId, "user_id": user["_id"]})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    await db.uploads_v1.update_one(
        {"_id": payload.uploadId},
        {"$set": {"status": "processed"}}
    )
    
    job_id = str(uuid.uuid4())
    await db.jobs_v1.insert_one({
        "_id": job_id,
        "user_id": user["_id"],
        "upload_id": payload.uploadId,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"jobId": job_id}


# ---------- V1 JOBS ENDPOINTS ----------

@v1_router.post("/jobs", response_model=JobCreateResponse)
async def v1_create_job(payload: JobCreateRequest, authorization: str = Header(None)):
    """Create job to process upload and create repo."""
    user = await get_user_from_token(authorization)
    
    upload = await db.uploads_v1.find_one({"_id": payload.uploadId, "user_id": user["_id"]})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Create job using JobManager (checks credits but doesn't consume yet)
    try:
        job = await job_manager.create_job(
            user_id=user["_id"],
            job_type="upload",
            job_data={
                "upload_id": payload.uploadId,
                "repo_name": payload.repoName,
                "visibility": payload.visibility,
                "auto_prompts": payload.autoPrompts.dict() if payload.autoPrompts else {}
            },
            required_credits=1
        )
    except ValueError as e:
        raise HTTPException(status_code=402, detail=str(e))
    
    return JobCreateResponse(jobId=job["_id"], startedAt=job["created_at"])


@v1_router.get("/jobs/{job_id}", response_model=JobStatus)
async def v1_get_job_status(job_id: str, authorization: str = Header(None)):
    """Get job status."""
    user = await get_user_from_token(authorization)
    
    job = await db.jobs_v1.find_one({"_id": job_id, "user_id": user["_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatus(
        jobId=job_id,
        status=job.get("status", "unknown"),
        logs=job.get("logs", []),
        repoUrl=job.get("repo_url"),
        errors=job.get("errors", [])
    )


# ---------- V1 REPOS ENDPOINTS ----------

@v1_router.get("/repos")
async def v1_list_repos(authorization: str = Header(None)):
    """List all repos created via GitPusher."""
    user = await get_user_from_token(authorization)
    
    repos = await db.repos_v1.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return {"repos": repos}


@v1_router.post("/repos/create", response_model=RepoCreateResponse)
async def v1_create_repo(payload: RepoCreateRequest, authorization: str = Header(None)):
    """Create an empty GitHub repo."""
    user = await get_user_from_token(authorization)
    
    if not user.get("github_access_token"):
        raise HTTPException(status_code=400, detail="GitHub token not linked")
    
    repo_info = await git_service.create_repo(
        user["github_access_token"],
        payload.repoName,
        None,
        payload.private
    )
    
    repo_id = str(uuid.uuid4())
    await db.repos_v1.insert_one({
        "_id": repo_id,
        "user_id": user["_id"],
        "name": payload.repoName,
        "url": repo_info.url,
        "private": payload.private,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return RepoCreateResponse(repoUrl=repo_info.url, repoId=repo_id)


# ---------- V1 BILLING ENDPOINTS ----------

@v1_router.get("/billing/credits", response_model=BillingCreditsResponse)
async def v1_get_credits(authorization: str = Header(None)):
    """Get user's credit balance."""
    user = await get_user_from_token(authorization)
    credits = await credits_service.get_user_credits(user["_id"])
    return BillingCreditsResponse(credits=credits, currency="EUR")


@v1_router.post("/billing/purchase", response_model=BillingPurchaseResponse)
async def v1_purchase_credits(payload: BillingPurchaseRequest, authorization: str = Header(None)):
    """Create checkout session (mocked)."""
    user = await get_user_from_token(authorization)
    
    try:
        result = await credits_service.create_checkout_session(user["_id"], payload.packId)
        return BillingPurchaseResponse(
            checkoutUrl=result["checkoutUrl"],
            sessionId=result["sessionId"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@v1_router.get("/billing/history")
async def v1_billing_history(authorization: str = Header(None)):
    """Get billing transaction history."""
    user = await get_user_from_token(authorization)
    transactions = await credits_service.get_transactions(user["_id"], limit=50)
    return {"transactions": transactions}


@v1_router.post("/billing/webhook")
async def stripe_webhook(request: Request):
    """Stripe webhook handler for payment events."""
    import stripe
    import os
    
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            event = json.loads(payload)
        
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            session_id = session["id"]
            
            await credits_service.complete_checkout(session_id)
            logger.info(f"Payment completed: {session_id}")
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ---------- V1 AUTOPUSH ENDPOINTS ----------

@v1_router.get("/autopush/settings", response_model=AutopushSettings)
async def v1_get_autopush_settings(authorization: str = Header(None)):
    """Get autopush settings."""
    user = await get_user_from_token(authorization)
    settings = user.get("autopush_settings", {})
    return AutopushSettings(**settings) if settings else AutopushSettings()


@v1_router.post("/autopush/settings", response_model=AutopushSettings)
async def v1_update_autopush_settings(payload: AutopushSettings, authorization: str = Header(None)):
    """Update autopush settings."""
    user = await get_user_from_token(authorization)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "autopush_settings": payload.dict(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return payload


@v1_router.get("/autopush/logs")
async def v1_autopush_logs(limit: int = 50, authorization: str = Header(None)):
    """Get autopush logs."""
    user = await get_user_from_token(authorization)
    
    logs = await db.autopush_logs.find(
        {"user_id": user["_id"]}
    ).sort("triggered_at", -1).limit(limit).to_list(limit)
    
    return {"logs": logs}


@v1_router.post("/autopush/trigger")
async def v1_trigger_autopush(payload: AutopushTriggerRequest, authorization: str = Header(None)):
    """Manually trigger autopush."""
    user = await get_user_from_token(authorization)
    
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    await db.jobs_v1.insert_one({
        "_id": job_id,
        "user_id": user["_id"],
        "upload_id": payload.uploadId,
        "repo_name": payload.repoName,
        "type": "autopush",
        "status": "queued",
        "created_at": now
    })
    
    await db.autopush_logs.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "repo_name": payload.repoName,
        "status": "triggered",
        "triggered_at": now,
        "job_id": job_id
    })
    
    return {"jobId": job_id, "startedAt": now}


# ---------- V1 PARTNER ENDPOINTS ----------

async def verify_partner_key(api_key: str) -> Optional[dict]:
    """Verify partner API key."""
    partner = await db.partner_keys.find_one({"api_key": api_key, "active": True})
    return partner


@v1_router.post("/partner/v1/repos/create")
async def v1_partner_create_repo(payload: PartnerRepoCreateRequest, x_api_key: Optional[str] = Header(None)):
    """Partner endpoint to create repo."""
    api_key = payload.partnerApiKey or x_api_key
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    partner = await verify_partner_key(api_key)
    if not partner:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    await db.jobs_v1.insert_one({
        "_id": job_id,
        "partner_id": partner["_id"],
        "user_identifier": payload.userIdentifier,
        "s3_artifact_url": payload.s3ArtifactUrl,
        "repo_name": payload.repoName,
        "visibility": payload.visibility,
        "status": "queued",
        "type": "partner",
        "created_at": now
    })
    
    return {"jobId": job_id}


# ---------- V1 WEBHOOKS ENDPOINTS ----------

@v1_router.post("/webhooks/job.completed")
async def v1_job_completed_webhook(payload: WebhookJobCompleted):
    """Webhook for job completion."""
    await db.webhook_events.insert_one({
        "type": "job.completed",
        "job_id": payload.jobId,
        "status": payload.status,
        "repo_url": payload.repoUrl,
        "summary": payload.summary,
        "received_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"ok": True}


# Mount v1 router
api_router.include_router(v1_router)

# Mount admin dashboard router
from routes.admin_credit_safety import admin_dashboard_router
api_router.include_router(admin_dashboard_router, prefix="/admin")

# Mount AI monitor router
from ai_monitor.routes import router as ai_monitor_router
api_router.include_router(ai_monitor_router)

# Mount Traffic monitor router
from routes.traffic_routes import router as traffic_router
api_router.include_router(traffic_router)

# Mount Email templates router
from routes.email_routes import router as email_router
api_router.include_router(email_router)

# Mount AI Ping router
from routes.ping_ai import router as ping_ai_router
app.include_router(ping_ai_router)

# Mount Stripe Stats router
from routes.stripe_stats import router as stripe_stats_router
api_router.include_router(stripe_stats_router)

# Mount Admin Users router
from routes.admin_users import router as admin_users_router
api_router.include_router(admin_users_router)

# Mount Features Health router
from routes.features_health import router as features_health_router
api_router.include_router(features_health_router)

# Mount SMTP Config router
from routes.smtp_config import router as smtp_config_router
api_router.include_router(smtp_config_router)

# Mount Admin Pages router
from routes.admin_pages import router as admin_pages_router
api_router.include_router(admin_pages_router)

# Mount AI Knowledge router
from routes.ai_knowledge import router as ai_knowledge_router
api_router.include_router(ai_knowledge_router)

# Mount AI Autofix router
from routes.ai_autofix import router as ai_autofix_router
api_router.include_router(ai_autofix_router)

from routes import backlinks
api_router.include_router(backlinks.router)

# Mount AI Indexers Extended router
from routes import ai_indexers_extended
api_router.include_router(ai_indexers_extended.router)
from routes.seo_monitor import router as seo_monitor_router
app.include_router(seo_monitor_router)

from routes.ai_catalog import router as ai_catalog_router
app.include_router(ai_catalog_router)
from routes.tiktok_monitor import router as tiktok_monitor_router
app.include_router(tiktok_monitor_router)


# Mount AI Score / Health / Autofix router
from routes.ai_health import router as ai_health_router
api_router.include_router(ai_health_router)



# ---------- BASIC ROOT & HEALTH ----------


# =============================================
# AI Discovery & Integration Endpoints
# =============================================

@api_router.get("/ai/discovery")
async def ai_discovery():
    """
    AI Discovery endpoint - Returns service capabilities and integration info.
    This endpoint is designed for AI assistants to discover GitPusher's capabilities.
    """
    return {
        "name": "GitPusher",
        "version": "1.0.0",
        "type": "git-deployment-service",
        "description": "AI-optimized universal Git deployment service",
        "openapi_url": f"{FRONTEND_URL}/api/ai/openapi.yaml",
        "manifest_url": f"{FRONTEND_URL}/api/ai/gitpusher.json",
        "docs_url": f"{FRONTEND_URL}/for-ai-assistants",
        "capabilities": [
            "push_repos",
            "multi_provider",
            "zip_uploads",
            "ai_generated_code",
            "semantic_commits",
            "file_analysis",
            "auto_readme",
            "auto_gitignore",
            "auto_license",
            "auto_changelog"
        ],
        "supported_providers": [
            "github",
            "gitlab",
            "bitbucket",
            "gitea",
            "codeberg"
        ],
        "auth": {
            "type": "bearer_token",
            "demo_endpoint": "/api/auth/demo"
        },
        "endpoints": {
            "create_project": "POST /api/workflows/projects",
            "upload_files": "POST /api/workflows/projects/{project_id}/upload",
            "process_project": "POST /api/workflows/projects/{project_id}/process",
            "list_projects": "GET /api/workflows/projects",
            "get_jobs": "GET /api/jobs"
        }
    }


@api_router.get("/ai/gitpusher.json")
async def ai_gitpusher_manifest():
    """AI Actions / Tool manifest tailored for ChatGPT and similar assistants.

    This is the canonical URL to configure in ChatGPT:
    https://gitpusher.ai/api/ai/gitpusher.json
    """
    return {
        "schema_version": "v1",
        "name_for_human": "GitPusher",
        "name_for_model": "gitpusher",
        "description_for_human": "Turn user code, ZIPs or AI-generated projects into real Git repositories (GitHub, GitLab, Bitbucket, Gitea, Codeberg).",
        "description_for_model": (
            "Use GitPusher to create repositories and push code for users. "
            "When a user asks to 'push this to GitHub', 'turn this into a repo', "
            "or 'upload this ZIP to GitLab', call the push_repository action."
        ),
        "auth": {
            "type": "user_http_bearer",
            "authorization_url": f"{FRONTEND_URL}/auth",  # front auth entry
            "instructions": "Obtain a JWT via the /api/auth/demo endpoint or the UI login flow, then pass it as Bearer token."
        },
        "api": {
            "type": "openapi",
            "url": f"{FRONTEND_URL}/api/ai/openapi.yaml"
        },
        "contact_email": "support@gitpusher.ai",
        "legal_info_url": "https://gitpusher.ai/legal",
        "capabilities": [
            "automatic_repo_creation",
            "zip_to_repo",
            "multi_provider_git",
            "ai_generated_readme",
            "auto_gitignore",
            "auto_license",
            "auto_changelog"
        ],
        "functions": [
            {
                "name": "push_repository",
                "description": (
                    "Upload a ZIP or project files, generate README/.gitignore/LICENSE/CHANGELOG, "
                    "and push everything to a new Git repository on GitHub/GitLab/Bitbucket/etc."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "provider": {
                            "type": "string",
                            "description": "Git provider to use",
                            "enum": ["github", "gitlab", "bitbucket", "gitea", "codeberg"]
                        },
                        "repo_name": {
                            "type": "string",
                            "description": "Name of the repository to create"
                        },
                        "upload_url": {
                            "type": "string",
                            "description": (
                                "URL where the ZIP or project archive is accessible (e.g. from a previous upload step). "
                                "If not available, the assistant should instead call the raw HTTP endpoints described in the OpenAPI spec."
                            )
                        },
                        "readme_language": {
                            "type": "string",
                            "description": "Language code for the generated README (e.g. en, fr)",
                            "default": "en"
                        }
                    },
                    "required": ["provider", "repo_name"]
                }
            }
        ]
    }

@api_router.get("/ai/schema.json")
async def ai_schema():
    """
    Returns JSON Schema for GitPusher's main data models.
    """
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "GitPusher API Schema",
        "description": "JSON Schema for GitPusher API data models",
        "definitions": {
            "Project": {
                "type": "object",
                "properties": {
                    "id": {"type": "string", "description": "Unique project ID"},
                    "name": {"type": "string", "description": "Repository name"},
                    "description": {"type": "string", "description": "Project description"},
                    "language": {"type": "string", "description": "README language code", "default": "en"},
                    "status": {"type": "string", "enum": ["pending", "processing", "done", "error"]},
                    "github_repo_url": {"type": "string", "description": "URL of created repository"}
                },
                "required": ["name"]
            },
            "CreateProjectRequest": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Repository name (auto-generated if null)"},
                    "description": {"type": "string", "description": "Project description"},
                    "language": {"type": "string", "default": "en"}
                }
            },
            "Job": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "project_id": {"type": "string"},
                    "status": {"type": "string", "enum": ["pending", "processing", "done", "error"]},
                    "result_url": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            }
        }
    }

@api_router.get("/ai/openapi.yaml")
async def ai_openapi():
    """
    Returns OpenAPI specification for GitPusher API.
    Content-Type: text/yaml
    """
    from fastapi.responses import Response
    
    openapi_yaml = """openapi: 3.0.3
info:
  title: GitPusher API
  description: |
    GitPusher is an AI-optimized service that enables assistants and agents to 
    programmatically create and push repositories to all Git platforms.
    
    ## Quick Start
    1. Get a token via POST /api/auth/demo
    2. Create a project via POST /api/workflows/projects
    3. Upload files via POST /api/workflows/projects/{id}/upload
    4. Process & push via POST /api/workflows/projects/{id}/process
  version: 1.0.0
  contact:
    name: GitPusher Support
    url: https://gitpusher.com
servers:
  - url: {frontend_url}/api
    description: Production server

paths:
  /auth/demo:
    post:
      summary: Get demo access token
      description: Returns a demo access token for testing the API
      operationId: getDemoToken
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  token_type:
                    type: string
                    default: bearer

  /workflows/projects:
    post:
      summary: Create a new project
      description: Creates a new project/repository
      operationId: createProject
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: Repository name (auto-generated if null)
                description:
                  type: string
                language:
                  type: string
                  default: en
      responses:
        '200':
          description: Project created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'

    get:
      summary: List all projects
      operationId: listProjects
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'

  /workflows/projects/{{project_id}}/upload:
    post:
      summary: Upload files to project
      description: Upload ZIP, PDF, or code files to a project
      operationId: uploadFiles
      security:
        - bearerAuth: []
      parameters:
        - name: project_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                files:
                  type: array
                  items:
                    type: string
                    format: binary
      responses:
        '200':
          description: Files uploaded

  /workflows/projects/{{project_id}}/process:
    post:
      summary: Process and push to Git
      description: Processes uploaded files and pushes to the configured Git provider
      operationId: processProject
      security:
        - bearerAuth: []
      parameters:
        - name: project_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Project processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'

  /jobs:
    get:
      summary: List all jobs
      operationId: listJobs
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of jobs
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Job'

  /ai/discovery:
    get:
      summary: AI Discovery endpoint
      description: Returns service capabilities for AI assistants
      operationId: aiDiscovery
      responses:
        '200':
          description: Service capabilities
          content:
            application/json:
              schema:
                type: object
                properties:
                  name:
                    type: string
                  version:
                    type: string
                  capabilities:
                    type: array
                    items:
                      type: string

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        language:
          type: string
        status:
          type: string
          enum: [pending, processing, done, error]
        github_repo_url:
          type: string
        created_at:
          type: string
          format: date-time

    Job:
      type: object
      properties:
        id:
          type: string
        project_id:
          type: string
        status:
          type: string
          enum: [pending, processing, done, error]
        result_url:
          type: string
        created_at:
          type: string
          format: date-time
""".replace("{frontend_url}", FRONTEND_URL)
    
    return Response(content=openapi_yaml, media_type="text/yaml")

@api_router.get("/")
async def root():
    return {"message": "GitPusher API"}


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)
