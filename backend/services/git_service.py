import httpx
from typing import Optional
from providers.provider_factory import ProviderFactory
from providers.base_provider import RepoInfo

class GitService:
    def __init__(self):
        self.factory = ProviderFactory()
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False, provider: str = "github") -> RepoInfo:
        """Create a repository using specified provider."""
        git_provider = self.factory.get_provider(provider)
        return await git_provider.create_repo(token, name, description, private)
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str, provider: str = "github") -> dict:
        """Upload file using specified provider."""
        git_provider = self.factory.get_provider(provider)
        return await git_provider.put_file(token, repo_full_name, path, content_bytes, message)
    
    async def get_user_info(self, token: str, provider: str = "github") -> dict:
        """Get user info from provider."""
        git_provider = self.factory.get_provider(provider)
        return await git_provider.get_user_info(token)
    
    async def list_repos(self, token: str, provider: str = "github", limit: int = 100) -> list:
        """List repos from provider."""
        git_provider = self.factory.get_provider(provider)
        return await git_provider.list_repos(token, limit)
    
    def get_all_providers(self) -> list:
        """Get all supported providers."""
        return self.factory.get_all_providers()

