from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field
from app.models.common import BaseDocument, PyObjectId, utcnow


class CleaningEntryCreate(BaseModel):
    session_id: PyObjectId
    step_id: PyObjectId
    transformation: str
    params: dict[str, Any] = {}
    approved_by: str = "user"


class CleaningEntry(BaseDocument):
    """Immutable — entries are inserted only, never updated or deleted."""
    session_id: PyObjectId
    step_id: PyObjectId
    transformation: str
    params: dict[str, Any] = {}
    approved_by: str = "user"
    applied_at: datetime = Field(default_factory=utcnow)
