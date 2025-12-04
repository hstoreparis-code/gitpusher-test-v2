from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


async def get_tiktok_seo_overview(db) -> Dict[str, Any]:
    """Return a lightweight TikTok SEO overview payload.

    Conçu sur le même modèle que le SEO Google : structure prête pour
    être branchée plus tard sur l'API analytics/SEO TikTok.
    Pour l'instant, renvoie des valeurs neutres mais un schéma stable
    pour alimenter le dashboard frontend.
    """
    now = datetime.now(timezone.utc)
    start_28d = (now - timedelta(days=28)).date().isoformat()
    today = now.date().isoformat()

    summary = {
        "start_date": start_28d,
        "end_date": today,
        "total_views_28d": 0,
        "total_clicks_28d": 0,
        "avg_watch_time_s": 0.0,
        "avg_engagement_rate": 0.0,
    }

    timeseries: List[Dict[str, Any]] = []
    for i in range(28):
        day = (now - timedelta(days=27 - i)).date().isoformat()
        timeseries.append({
            "date": day,
            "views": 0,
            "clicks": 0,
            "engagement_rate": 0.0,
        })

    by_video: List[Dict[str, Any]] = []
    by_country: List[Dict[str, Any]] = []

    return {
        "tiktok_connected": False,
        "summary": summary,
        "timeseries": timeseries,
        "by_video": by_video,
        "by_country": by_country,
    }
