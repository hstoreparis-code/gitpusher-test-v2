from fastapi import Request
from datetime import datetime, timezone
import uuid

AI_USER_AGENTS = {
    "ChatGPT": ["ChatGPT", "OpenAI"],
    "Claude": ["Claude", "Anthropic"],
    "Gemini": ["Gemini", "Google-Extended"],
    "Perplexity": ["PerplexityBot"],
    "Mistral": ["MistralBot"],
    "Meta": ["Meta-ExternalAgent", "Llama"],
    "Microsoft": ["BingBot", "Copilot"],
    "xAI": ["Grok"]
}

def detect_ai_source(user_agent: str) -> Optional[str]:
    if not user_agent:
        return None
    for ai_name, patterns in AI_USER_AGENTS.items():
        if any(p.lower() in user_agent.lower() for p in patterns):
            return ai_name
    return None

async def log_ai_event(db, source: str, event_type: str, endpoint: str, metadata: dict = None):
    event = {
        "_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "event_type": event_type,
        "endpoint": endpoint,
        "metadata": metadata or {}
    }
    await db.ai_events.insert_one(event)
    return event
