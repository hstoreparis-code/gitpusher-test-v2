from typing import Optional
from .base_provider import BaseGitProvider, RepoInfo
import httpx
import base64

class CodebergProvider(BaseGitProvider):
    """Codeberg provider (Gitea-based, European alternative)."""
    
    BASE_URL = "https://codeberg.org/api/v1"
    
    @property
    def provider_name(self) -> str:
        return "codeberg"
    
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> RepoInfo:
        """Create a Codeberg repository."""
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.BASE_URL}/user/repos",
                headers={"Authorization": f"token {token}"},
                json={
                    "name": name,
                    "description": description or f"Repository {name}",
                    "private": private
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                raise Exception(f"Codeberg API error: {res.status_code}")
            
            data = res.json()
            return RepoInfo(
                url=data["html_url"],
                full_name=data["full_name"],
                owner=data["owner"]["login"],
                name=data["name"],
                clone_url=data["clone_url"],
                provider="codeberg"
            )
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str) -> dict:
        """Upload file to Codeberg."""
        content_b64 = base64.b64encode(content_bytes).decode("utf-8")
        
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.BASE_URL}/repos/{repo_full_name}/contents/{path}",
                headers={"Authorization": f"token {token}"},
                json={"content": content_b64, "message": message},
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                raise Exception(f"Codeberg upload error: {res.status_code}")
            
            return res.json()
    
    async def get_user_info(self, token: str) -> dict:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/user",
                headers={"Authorization": f"token {token}"},
                timeout=20
            )
            return res.json() if res.status_code == 200 else {}
    
    async def list_repos(self, token: str, limit: int = 100) -> list:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.BASE_URL}/user/repos",
                headers={"Authorization": f"token {token}"},
                params={"limit": limit},
                timeout=20
            )
            return res.json() if res.status_code == 200 else []
