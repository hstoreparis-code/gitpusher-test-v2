from fastapi import APIRouter, HTTPException
from models.schemas import Repo, RepoCreateRequest, RepoCreateResponse
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", response_model=dict)
async def list_repos(db=None, user_id: str = None):
    """
    List all repos created by user via GitPusher.
    """
    repos = await db.repos_v1.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    return {"repos": repos}


@router.post("/create", response_model=RepoCreateResponse)
async def create_empty_repo(payload: RepoCreateRequest, db=None, user_id: str = None, git_service=None):
    """
    Create an empty GitHub repo.
    """
    # Get user's GitHub token
    user = await db.users.find_one({"_id": user_id})
    if not user or not user.get("github_access_token"):
        raise HTTPException(status_code=400, detail="GitHub token not linked")
    
    gh_token = user["github_access_token"]
    
    # Create repo via GitHub API
    repo_info = await git_service.create_repo(gh_token, payload.repoName, None, payload.private)
    
    # Store in DB
    repo_id = str(uuid.uuid4())
    await db.repos_v1.insert_one({
        "_id": repo_id,
        "user_id": user_id,
        "name": payload.repoName,
        "url": repo_info.url,
        "private": payload.private,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return RepoCreateResponse(
        repoUrl=repo_info.url,
        repoId=repo_id
    )
