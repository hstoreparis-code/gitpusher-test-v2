from typing import Optional

from fastapi import Depends, Header, HTTPException, Request

from server import get_db as _get_db, require_admin as _require_admin


async def get_db():  # pragma: no cover - thin wrapper
    return await _get_db()


async def require_admin(
    authorization: Optional[str] = Header(default=None), request: Optional[Request] = None
):  # pragma: no cover - thin wrapper
    return await _require_admin(authorization, request)
