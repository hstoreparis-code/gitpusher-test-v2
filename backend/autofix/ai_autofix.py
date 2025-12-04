import json
import os
from datetime import datetime

from autofix.seo_aeo_autofix import autofix_seo_aeo

AI_INDEXERS_REQUIRED = [
    "openai","anthropic","google","perplexity","groq","mistral",
    "meta","xai","inflection","cohere","reka","aws"
]

DISCOVERY_PATH = "backend/data/ai_discovery.json"
INDEXERS_PATH = "frontend/public/ai/indexers/ai-indexers.json"
KNOWLEDGE_DIR = "frontend/public/ai/knowledge"

REQUIRED_KNOWLEDGE = [
    "intent-map.json",
    "usecases.json",
    "autocomplete.json",
    "triggers.json",
    "hints.json"
]


def load_json(path):
  if not os.path.exists(path):
      return None
  try:
      with open(path, "r", encoding="utf-8") as f:
          return json.load(f)
  except Exception:
      return None


def save_json(path, data):
  os.makedirs(os.path.dirname(path), exist_ok=True)
  with open(path, "w", encoding="utf-8") as f:
      json.dump(data, f, indent=2, ensure_ascii=False)


def autofix_ai_discovery():
  """Ensure ai_discovery.json exists, is valid and contains required keys."""
  data = load_json(DISCOVERY_PATH)
  changed = False

  if data is None or not isinstance(data, dict):
      data = {"indexers": {}, "last_events": []}
      changed = True

  if "indexers" not in data:
      data["indexers"] = {}
      changed = True

  for idx in AI_INDEXERS_REQUIRED:
      if idx not in data["indexers"]:
          data["indexers"][idx] = {
              "name": idx,
              "hits": 0,
              "last_seen": None,
          }
          changed = True

  if "last_events" not in data or not isinstance(data["last_events"], list):
      data["last_events"] = []
      changed = True

  if changed:
      save_json(DISCOVERY_PATH, data)

  return changed


def autofix_ai_indexers_json():
  """Ensure ai-indexers.json exists and contains the required 12 indexers."""
  data = load_json(INDEXERS_PATH)
  changed = False

  if data is None or "indexers" not in data:
      data = {"indexers": []}
      changed = True

  existing = {x.get("id"): x for x in data["indexers"]}

  for idx in AI_INDEXERS_REQUIRED:
      if idx not in existing:
          data["indexers"].append({
              "id": idx,
              "name": idx,
              "status": "allowed",
          })
          changed = True

  if changed:
      save_json(INDEXERS_PATH, data)

  return changed


def autofix_knowledge_files():
  """Ensure all knowledge JSON files exist."""
  changed = False

  for filename in REQUIRED_KNOWLEDGE:
      path = os.path.join(KNOWLEDGE_DIR, filename)
      if not os.path.exists(path):
          save_json(path, {"status": "placeholder", "autofixed_at": datetime.utcnow().isoformat() + "Z"})
          changed = True

  return changed


def run_autofix():
  fixes = {
      "ai_discovery_fixed": autofix_ai_discovery(),
      "ai_indexers_fixed": autofix_ai_indexers_json(),
      "knowledge_fixed": autofix_knowledge_files(),
      "seo_aeo_fixed": autofix_seo_aeo(),
  }
  return fixes
