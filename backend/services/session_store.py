from datetime import datetime, timedelta, timezone
from typing import Optional

from pydantic import BaseModel

from models.session import Session


async def get_db():
    """Late import to avoid circular dependency with server.py."""
    from server import db  # type: ignore

    return db


class SessionInDB(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    expires_at: datetime

    @classmethod
    def from_session(cls, session: Session) -> "SessionInDB":
        return cls(
            id=session.id,
            user_id=session.user_id,
            created_at=session.created_at,
            expires_at=session.expires_at,
        )

    def to_session(self) -> Session:
        return Session(
            id=self.id,
            user_id=self.user_id,
            created_at=self.created_at,
            expires_at=self.expires_at,
        )


async def create_session(user_id: str, ttl_minutes: int = 60 * 24 * 7) -> Session:
    """Create and persist a new session for the given user.

    Default TTL: 7 days.
    """
    session = Session.new(user_id=user_id, ttl_minutes=ttl_minutes)
    db = await get_db()
    await db.sessions.update_one(
        {"id": session.id},
        {
            "$set": {
                "id": session.id,
                "user_id": session.user_id,
                "created_at": session.created_at,
                "expires_at": session.expires_at,
            }
        },
        upsert=True,
    )
    return session


async def get_session(session_id: str) -> Optional[Session]:
    db = await get_db()
    doc = await db.sessions.find_one({"id": session_id})
    if not doc:
        return None

    created_at = doc.get("created_at")
    expires_at = doc.get("expires_at")

    # Normalize to datetime
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)

    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        # Session expired: clean up and return None
        await db.sessions.delete_one({"id": session_id})
        return None

    return Session(id=doc["id"], user_id=doc["user_id"], created_at=created_at, expires_at=expires_at)


async def revoke_session(session_id: str) -> None:
    db = await get_db()
    await db.sessions.delete_one({"id": session_id})
