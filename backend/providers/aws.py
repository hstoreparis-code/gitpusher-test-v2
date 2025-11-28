from typing import Optional
from .base_provider import BaseGitProvider, RepoInfo

class AWSCodeCommitProvider(BaseGitProvider):
    """AWS CodeCommit provider."""
    
    @property
    def provider_name(self) -> str:
        return "aws"
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> RepoInfo:
        """Create AWS CodeCommit repository."""
        # Requires boto3 and AWS credentials
        raise NotImplementedError("AWS CodeCommit requires boto3 integration")
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str) -> dict:
        raise NotImplementedError("AWS CodeCommit - use boto3")
    
    async def get_user_info(self, token: str) -> dict:
        return {"provider": "aws", "note": "Requires IAM credentials"}
    
    async def list_repos(self, token: str, limit: int = 100) -> list:
        return []
