from pathlib import Path
from typing import Dict, Any
import json
import yaml


def _project_paths() -> Dict[str, Path]:
    """Return important base paths (backend, frontend/public, etc.)."""
    backend_dir = Path(__file__).resolve().parent.parent  # /app/backend
    project_root = backend_dir.parent  # /app
    frontend_public = project_root / "frontend" / "public"

    return {
        "backend": backend_dir,
        "frontend_public": frontend_public,
        "openapi": backend_dir / "api" / "openapi.yaml",
        "ai_actions": frontend_public / ".well-known" / "ai-actions.json",
        "ai_plugin": frontend_public / ".well-known" / "ai-plugin.json",
        "robots": frontend_public / "robots.txt",
        "sitemap": frontend_public / "sitemap.xml",
        "metadata": frontend_public / "ai-actions-metadata.json",
        "ai_80_indexers": frontend_public / "ai" / "indexers" / "ai-80-indexers.json",
        "knowledge_dir": frontend_public / "ai" / "knowledge",
    }


def _check_yaml_file(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"ok": False, "error": "missing", "path": str(path)}
    try:
        content = path.read_text(encoding="utf-8")
        data = yaml.safe_load(content)
        return {"ok": True, "error": None, "path": str(path), "keys": list(data.keys()) if isinstance(data, dict) else []}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"invalid_yaml: {exc}", "path": str(path)}


def _check_json_file(path: Path, required_keys=None) -> Dict[str, Any]:
    if not path.exists():
        return {"ok": False, "error": "missing", "path": str(path)}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"invalid_json: {exc}", "path": str(path)}

    if required_keys:
        missing = [k for k in required_keys if k not in data]
        if missing:
            return {
                "ok": False,
                "error": f"missing_keys: {', '.join(missing)}",
                "path": str(path),
            }

    return {"ok": True, "error": None, "path": str(path)}


def _check_knowledge_dir(path: Path) -> Dict[str, Any]:
    expected_files = {"intent-map.json", "usecases.json", "autocomplete.json", "triggers.json", "hints.json"}
    if not path.exists():
        return {"ok": False, "error": "missing_directory", "path": str(path), "missing_files": sorted(expected_files)}

    existing = {p.name for p in path.glob("*.json")}
    missing = sorted(expected_files - existing)
    if missing:
        return {
            "ok": False,
            "error": "missing_files",
            "path": str(path),
            "missing_files": missing,
        }

    return {"ok": True, "error": None, "path": str(path), "missing_files": []}


def compute_ai_visibility_score() -> Dict[str, Any]:
    """Compute a simple 0-100 AI visibility score based on critical files.

    This is intentionally rule-based and fast so it can be called very often
    (cron, health checks, admin dashboard, AI agents).
    """
    paths = _project_paths()

    # Individual checks
    checks: Dict[str, Dict[str, Any]] = {}

    checks["openapi"] = _check_yaml_file(paths["openapi"])
    checks["ai_actions"] = _check_json_file(paths["ai_actions"])
    checks["ai_plugin"] = _check_json_file(paths["ai_plugin"], required_keys=["schema_version", "api"])
    checks["robots"] = {"ok": paths["robots"].exists(), "error": None if paths["robots"].exists() else "missing", "path": str(paths["robots"])}
    checks["sitemap"] = {"ok": paths["sitemap"].exists(), "error": None if paths["sitemap"].exists() else "missing", "path": str(paths["sitemap"])}
    checks["metadata"] = _check_json_file(paths["metadata"], required_keys=["x-indexers"])
    checks["ai_80_indexers"] = _check_json_file(paths["ai_80_indexers"])
    checks["knowledge"] = _check_knowledge_dir(paths["knowledge_dir"])

    # Weights must add up to 100
    weights = {
        "openapi": 25,
        "ai_actions": 15,
        "ai_plugin": 15,
        "robots": 10,
        "sitemap": 10,
        "metadata": 10,
        "ai_80_indexers": 10,
        "knowledge": 5,
    }

    max_score = 100
    score = 0
    for key, meta in checks.items():
        w = weights.get(key, 0)
        if meta.get("ok"):
            score += w

    overall = "excellent" if score >= 90 else "good" if score >= 75 else "warning" if score >= 50 else "critical"

    return {
        "score": score,
        "max_score": max_score,
        "grade": overall,
        "components": {
            name: {"weight": weights.get(name, 0), **details} for name, details in checks.items()
        },
    }
