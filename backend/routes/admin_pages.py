from fastapi import APIRouter, Depends, HTTPException
from fastapi import Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter(prefix="/admin/pages", tags=["admin-pages"])


class PageType(str):
    SEO = "seo"
    AEO = "aeo"


class PageDocument(BaseModel):
    id: str
    slug: str
    page_type: str
    title: str
    description: str
    body: str
    created_at: str
    updated_at: str


class PageUpsertPayload(BaseModel):
    slug: str
    page_type: str
    title: str
    description: str
    body: str


async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)


@router.get("", response_model=List[PageDocument])
async def list_pages(authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    docs = await db.pages.find({}, {"_id": 0}).to_list(1000)
    return docs


@router.get("/{slug}", response_model=PageDocument)
async def get_page(slug: str, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    doc = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Page not found")
    return doc


@router.post("", response_model=PageDocument)
async def upsert_page(payload: PageUpsertPayload, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    now = datetime.now(timezone.utc).isoformat()
    existing = await db.pages.find_one({"slug": payload.slug}, {"_id": 0})

    doc = {
        "id": existing.get("id") if existing else payload.slug,
        "slug": payload.slug,
        "page_type": payload.page_type,
        "title": payload.title,
        "description": payload.description,
        "body": payload.body,
        "created_at": existing.get("created_at") if existing else now,
        "updated_at": now,
    }

    await db.pages.update_one({"slug": payload.slug}, {"$set": doc}, upsert=True)
    return doc


@router.delete("/{slug}")
async def delete_page(slug: str, authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    result = await db.pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"ok": True}


@router.get("/export/json")
async def export_pages_json(authorization: Optional[str] = Header(None)):
    admin = await require_admin_auth(authorization)
    from server import db

    docs = await db.pages.find({}, {"_id": 0}).to_list(1000)
    return {"pages": docs}
