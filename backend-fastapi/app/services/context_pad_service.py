from datetime import datetime, timezone
from typing import Literal
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import context_pad_col
from app.models.context_pad import ContextPadEntry, ContextPadEntryCreate, ContextPadEntryUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_entry(data: ContextPadEntryCreate) -> ContextPadEntry:
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "created_at": now, "updated_at": now}
    result = await context_pad_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return ContextPadEntry(**_serialize(doc))


async def get_entry(entry_id: str) -> ContextPadEntry:
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid entry id")
    doc = await context_pad_col().find_one({"_id": ObjectId(entry_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Context pad entry not found")
    return ContextPadEntry(**_serialize(doc))


async def list_entries(
    scope: Literal["session", "project"], scope_id: str
) -> list[ContextPadEntry]:
    if not ObjectId.is_valid(scope_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid scope id")
    cursor = (
        context_pad_col()
        .find({"scope": scope, "scope_id": scope_id})
        .sort("priority", -1)
    )
    return [ContextPadEntry(**_serialize(doc)) async for doc in cursor]


async def merge_for_prompt(session_id: str, project_id: str) -> list[ContextPadEntry]:
    """
    Returns context pad entries merged for agent prompt construction.
    Session-scoped entries take precedence (returned first); project-scoped follow.
    The agent layer calls this — never include personal_scratch_pad here.
    """
    session_entries = await list_entries("session", session_id)
    project_entries = await list_entries("project", project_id)
    return session_entries + project_entries


async def update_entry(entry_id: str, data: ContextPadEntryUpdate) -> ContextPadEntry:
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid entry id")
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        return await get_entry(entry_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await context_pad_col().find_one_and_update(
        {"_id": ObjectId(entry_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Context pad entry not found")
    return ContextPadEntry(**_serialize(result))


async def delete_entry(entry_id: str) -> None:
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid entry id")
    result = await context_pad_col().delete_one({"_id": ObjectId(entry_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Context pad entry not found")
