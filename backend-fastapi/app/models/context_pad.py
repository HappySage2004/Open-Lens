from typing import Literal
from pydantic import BaseModel
from app.models.common import BaseDocument, PyObjectId


class ContextPadEntryCreate(BaseModel):
    scope: Literal["session", "project"]
    scope_id: PyObjectId
    content_type: Literal["text", "table", "image", "instruction"] = "text"
    content: str
    priority: int = 0


class ContextPadEntryUpdate(BaseModel):
    content: str | None = None
    content_type: Literal["text", "table", "image", "instruction"] | None = None
    priority: int | None = None


class ContextPadEntry(BaseDocument):
    scope: Literal["session", "project"]
    scope_id: PyObjectId
    content_type: Literal["text", "table", "image", "instruction"] = "text"
    content: str
    priority: int = 0
