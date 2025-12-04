import os, json


def ensure_backlinks_integrity():
    base = "app/backend/backlinks"
    required = ["superboost_targets.json", "templates.json"]
    for f in required:
        p = os.path.join(base, f)
        if not os.path.exists(p) or os.path.getsize(p) < 20:
            raise Exception(f"Backlinks file missing or corrupted: {f}")
    return True
