from fastapi import APIRouter

from tiktok.monitor import get_tiktok_seo_overview

router = APIRouter()


@router.get("/tiktok/seo-monitor")
async def tiktok_seo_monitor():
    """Lightweight TikTok SEO monitor endpoint.

    Structure similaire à Google Search SEO Monitor, mais pour TikTok.
    Pour l'instant, renvoie des valeurs neutres en attendant l'intégration
    réelle avec l'API TikTok.
    """
    from server import db  # import local pour éviter les cycles

    return await get_tiktok_seo_overview(db)
