from fastapi import APIRouter
import json, os

router = APIRouter()


@router.get("/api/backlinks/targets")
def list_targets():
    """Renvoie la liste des sources IA à poster."""
    path = os.path.join("app", "backend", "backlinks", "superboost_targets.json")
    return json.load(open(path))


@router.get("/api/backlinks/templates")
def list_templates():
    path = os.path.join("app", "backend", "backlinks", "templates.json")
    return json.load(open(path))


@router.get("/api/backlinks/test")
def backlink_test():
    return {"status": "ok", "message": "Backlink service operational"}


@router.get("/api/backlinks/score")
def ai_visibility_score():
    score = 65  # valeur par défaut (peut évoluer)
    return {
      "score": score,
      "label": "IA Visibility Score",
      "note": "Based on sitemap, metadata, and AEO presence."
    }
