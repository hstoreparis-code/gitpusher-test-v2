from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header

router = APIRouter(prefix="/admin/ai-indexing", tags=["admin-ai-indexing"])


async def require_admin_auth(authorization: Optional[str] = Header(None)):
  from server import require_admin

  return await require_admin(authorization)


@router.get("")
async def get_admin_ai_indexing(authorization: Optional[str] = Header(None)):
  """Mocked AI indexing coverage used by admin dashboards.

  This endpoint feeds:
  - /admin/ai-indexing (vue détaillée)
  - /admin/mega (section AI Indexing)
  """
  await require_admin_auth(authorization)

  now = datetime.now(timezone.utc)

  return {
    "score": 78,
    "autofix": "Quelques optimisations possibles sur la documentation publique et les fichiers V3/V4.",
    # LLMs principaux
    "chatgpt": True,
    "claude": True,
    "gemini": True,
    "mistral": True,
    "perplexity": True,
    # Écosystème Asie / autres agents
    "qwen": False,
    "kimi": False,
    "ernie": False,
    "spark": False,
    "huggingface": True,
    "cursor": True,
    "replit": True,
    "copilot": True,
    "bing": True,
    "ddg": False,
    "arxiv": False,
    "updated_at": now.isoformat(),
  }
