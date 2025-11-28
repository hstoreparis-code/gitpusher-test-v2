from typing import Optional
from .base_provider import BaseGitProvider, RepoInfo
import httpx
import base64

class AzureDevOpsProvider(BaseGitProvider):
    """Azure DevOps (Azure Repos) provider."""
    
    def __init__(self, organization: str = "myorg"):
        self.organization = organization
        self.BASE_URL = f"https://dev.azure.com/{organization}"
    
    @property
    def provider_name(self) -> str:
        return "azure"
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> RepoInfo:
        """Create Azure DevOps repository."""
        # Note: Azure DevOps requires project context
        async with httpx.AsyncClient() as client:
            # For MVP, return mock - full implementation needs project setup
            raise NotImplementedError("Azure DevOps requires project configuration")
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str) -> dict:
        """Upload file to Azure DevOps."""
        raise NotImplementedError("Azure DevOps file upload - requires push API")
    
    async def get_user_info(self, token: str) -> dict:
        """Get Azure DevOps user info."""
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://app.vssps.visualstudio.com/_apis/profile/profiles/me",
                headers={"Authorization": f"Bearer {token}"},
                params={"api-version": "6.0"},
                timeout=20
            )
            return res.json() if res.status_code == 200 else {}
    
    async def list_repos(self, token: str, limit: int = 100) -> list:
        """List Azure DevOps repositories."""
        return []
