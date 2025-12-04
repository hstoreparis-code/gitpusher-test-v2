from datetime import datetime, timedelta
import uuid
from typing import Optional

from pydantic import BaseModel


class Session(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    expires_at: datetime

    @staticmethod
    def new(user_id: str, ttl_minutes: int = 60) -> "Session":
        now = datetime.utcnow()
        return Session(
            id=str(uuid.uuid4()),
            user_id=user_id,
            created_at=now,
            expires_at=now + timedelta(minutes=ttl_minutes),
        )


# For now, we keep an in-memory dict; can be replaced by DB/Redis later.
SESSION_STORE: dict[str, Session] = {}


def store_session(session: Session) -> None:
    SESSION_STORE[session.id] = session


def get_session(session_id: str) -> Optional[Session]:
    s = SESSION_STORE.get(session_id)
    if not s:
        return None
    if s.expires_at < datetime.utcnow():
        SESSION_STORE.pop(session_id, None)
        return None
    return s


def revoke_session(session_id: str) -> None:
    SESSION_STORE.pop(session_id, None)
