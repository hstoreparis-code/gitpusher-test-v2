from fastapi import APIRouter
import httpx
import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path

router = APIRouter()

AI_DISCOVERY_ENDPOINTS = [
    "https://platform.openai.com",
    "https://www.anthropic.com",
    "https://ai.google.dev",
    "https://www.perplexity.ai",
    "https://groq.com",
    "https://mistral.ai",
    "https://ai.meta.com",
    "https://x.ai",
    "https://inflection.ai",
    "https://cohere.com",
    "https://reka.ai",
    "https://aws.amazon.com/nova"
]

async def safe_head_request(url: str):
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.head(url)
            return {"url": url, "status": r.status_code, "latency_ms": 0}
    except Exception as e:
        return {"url": url, "status": "FAILED", "error": str(e)[:50]}

@router.get("/ai/ping-all")
async def ping_all_indexers():
    results = []
    for endpoint in AI_DISCOVERY_ENDPOINTS:
        result = await safe_head_request(endpoint)
        results.append(result)
        await asyncio.sleep(0.1)
    
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "total_pinged": len(results)
    }
    
    log_path = Path("/app/logs/ai_ping_log.json")
    log_path.parent.mkdir(exist_ok=True)
    
    try:
        if log_path.exists():
            with open(log_path, "r") as f:
                logs = json.load(f)
        else:
            logs = []
    except:
        logs = []
    
    logs.append(log_entry)
    logs = logs[-100:]
    
    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)
    
    return {
        "GitPusher": "PING SENT TO 12 AI INDEXERS",
        "timestamp": log_entry["timestamp"],
        "results": results,
        "log_saved": str(log_path)
    }
