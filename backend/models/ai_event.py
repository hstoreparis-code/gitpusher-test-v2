from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class AIEvent(BaseModel):
    id: str
    timestamp: datetime
    source: str
    event_type: str
    endpoint: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AIEventCreate(BaseModel):
    source: str
    event_type: str
    endpoint: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
