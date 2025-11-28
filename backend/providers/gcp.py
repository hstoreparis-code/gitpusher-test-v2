from typing import Optional
from .base_provider import BaseGitProvider, RepoInfo

class GCPSourceRepoProvider(BaseGitProvider):
    """Google Cloud Source Repositories provider."""
    
    @property
    def provider_name(self) -> str:
        return "gcp"
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> RepoInfo:
        """Create GCP Source Repository."""
        raise NotImplementedError("GCP Source Repos requires Google Cloud SDK")
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str) -> dict:
        raise NotImplementedError("GCP - use git push")
    
    async def get_user_info(self, token: str) -> dict:
        return {"provider": "gcp", "note": "Requires GCP credentials"}
    
    async def list_repos(self, token: str, limit: int = 100) -> list:
        return []
