from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import sessions_col
from app.models.session import Session, SessionCreate, SessionUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_session(data: SessionCreate) -> Session:
    now = datetime.now(timezone.utc)
    doc = {
        **data.model_dump(),
        "step_ids": [],
        "artifact_ids": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await sessions_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return Session(**_serialize(doc))


async def get_session(session_id: str) -> Session:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    doc = await sessions_col().find_one({"_id": ObjectId(session_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return Session(**_serialize(doc))


async def list_sessions(project_id: str, skip: int = 0, limit: int = 50) -> list[Session]:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid project id")
    cursor = (
        sessions_col()
        .find({"project_id": project_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    return [Session(**_serialize(doc)) async for doc in cursor]


async def update_session(session_id: str, data: SessionUpdate) -> Session:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        return await get_session(session_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await sessions_col().find_one_and_update(
        {"_id": ObjectId(session_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return Session(**_serialize(result))


async def delete_session(session_id: str) -> None:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    result = await sessions_col().delete_one({"_id": ObjectId(session_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")


async def append_step_id(session_id: str, step_id: str) -> None:
    await sessions_col().update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"step_ids": step_id}, "$set": {"updated_at": datetime.now(timezone.utc)}},
    )


async def append_artifact_id(session_id: str, artifact_id: str) -> None:
    await sessions_col().update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"artifact_ids": artifact_id}, "$set": {"updated_at": datetime.now(timezone.utc)}},
    )
