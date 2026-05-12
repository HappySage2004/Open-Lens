from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import steps_col
from app.models.step import Step, StepCreate, StepUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_step(data: StepCreate) -> Step:
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "created_at": now, "updated_at": now}
    result = await steps_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return Step(**_serialize(doc))


async def get_step(step_id: str) -> Step:
    if not ObjectId.is_valid(step_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid step id")
    doc = await steps_col().find_one({"_id": ObjectId(step_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Step not found")
    return Step(**_serialize(doc))


async def list_steps(session_id: str) -> list[Step]:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    cursor = steps_col().find({"session_id": session_id}).sort("sequence_number", 1)
    return [Step(**_serialize(doc)) async for doc in cursor]


async def finalize_step(step_id: str, data: StepUpdate) -> Step:
    """Called by the agent runner after a step completes — atomically writes all step outputs."""
    if not ObjectId.is_valid(step_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid step id")
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await steps_col().find_one_and_update(
        {"_id": ObjectId(step_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Step not found")
    return Step(**_serialize(result))


async def delete_step(step_id: str) -> None:
    if not ObjectId.is_valid(step_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid step id")
    result = await steps_col().delete_one({"_id": ObjectId(step_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Step not found")
