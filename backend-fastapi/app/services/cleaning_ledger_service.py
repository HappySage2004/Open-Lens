from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import cleaning_ledger_col
from app.models.cleaning_ledger import CleaningEntry, CleaningEntryCreate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def append_entry(data: CleaningEntryCreate) -> CleaningEntry:
    """Cleaning ledger is immutable — entries are only ever appended."""
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "applied_at": now, "created_at": now, "updated_at": now}
    result = await cleaning_ledger_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return CleaningEntry(**_serialize(doc))


async def list_entries(session_id: str) -> list[CleaningEntry]:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    cursor = cleaning_ledger_col().find({"session_id": session_id}).sort("applied_at", 1)
    return [CleaningEntry(**_serialize(doc)) async for doc in cursor]


async def get_entry(entry_id: str) -> CleaningEntry:
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid entry id")
    doc = await cleaning_ledger_col().find_one({"_id": ObjectId(entry_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cleaning ledger entry not found")
    return CleaningEntry(**_serialize(doc))
