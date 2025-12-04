from fastapi import APIRouter

router = APIRouter()


@router.get("/ai/score")
async def get_ai_score():
    """Return a 0-100 AI visibility score for GitPusher.

    This is a lightweight, public endpoint that AI agents can call to quickly
    gauge how well GitPusher is exposed to AI crawlers (OpenAPI, manifests,
    indexers, sitemap, etc.).
    """
    from ai.visibility_score import compute_ai_visibility_score

    return compute_ai_visibility_score()


@router.get("/ai/health")
async def get_ai_health():
    """Return a detailed AI health report (files + DB + ping logs)."""
    from server import db  # Local import to avoid circular dependency
    from ai.health import compute_ai_health

    return await compute_ai_health(db)


@router.post("/ai/autofix")
async def post_ai_autofix():
    """Run AI AutoFix and return the list of fixes applied.

    This endpoint is intentionally public (no admin auth) so that AI agents or
    cron jobs can self-heal the AI discovery surface when something is broken.
    It internally leverages the existing autofix stack.
    """
    from server import db  # Local import to avoid circular dependency
    from ai.autofix import run_ai_autofix

    return await run_ai_autofix(db)
