import httpx
from typing import Optional
from dataclasses import dataclass

@dataclass
class GitRepoInfo:
    url: str
    full_name: str
    owner: str
    name: str


class GitService:
    async def create_repo(self, token: str, name: str, description: Optional[str] = None, private: bool = False) -> GitRepoInfo:
        """Create a GitHub repository."""
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                json={
                    "name": name,
                    "description": description or f"Repository {name}",
                    "private": private,
                    "auto_init": False
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                raise Exception(f"GitHub API error: {res.status_code} - {res.text}")
            
            data = res.json()
            return GitRepoInfo(
                url=data["html_url"],
                full_name=data["full_name"],
                owner=data["owner"]["login"],
                name=data["name"]
            )
    
    async def put_file(self, token: str, repo_full_name: str, path: str, content_bytes: bytes, message: str):
        """Upload a file to GitHub repo."""
        import base64
        
        content_b64 = base64.b64encode(content_bytes).decode("utf-8")
        
        async with httpx.AsyncClient() as client:
            res = await client.put(
                f"https://api.github.com/repos/{repo_full_name}/contents/{path}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                json={
                    "message": message,
                    "content": content_b64
                },
                timeout=30
            )
            
            if res.status_code not in [200, 201]:
                raise Exception(f"GitHub file upload error: {res.status_code} - {res.text}")
            
            return res.json()
