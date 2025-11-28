from typing import Optional
from .base_provider import BaseGitProvider, RepoInfo

class SourceForgeProvider(BaseGitProvider):
    """SourceForge provider (legacy platform)."""
    
    @property
    def provider_name(self) -> str:
        return "sourceforge"
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> RepoInfo:
        """SourceForge uses different model - requires project setup."""
        raise NotImplementedError("SourceForge requires manual project setup")
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str) -> dict:
        raise NotImplementedError("SourceForge - use git push directly")
    
    async def get_user_info(self, token: str) -> dict:
        return {"provider": "sourceforge", "note": "API limited"}
    
    async def list_repos(self, token: str, limit: int = 100) -> list:
        return []
