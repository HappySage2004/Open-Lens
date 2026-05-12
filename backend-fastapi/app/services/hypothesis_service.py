from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import hypotheses_col
from app.models.hypothesis import Hypothesis, HypothesisCreate, HypothesisUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_hypothesis(data: HypothesisCreate) -> Hypothesis:
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "evidence_artifact_ids": [], "created_at": now, "updated_at": now}
    result = await hypotheses_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return Hypothesis(**_serialize(doc))


async def get_hypothesis(hypothesis_id: str) -> Hypothesis:
    if not ObjectId.is_valid(hypothesis_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid hypothesis id")
    doc = await hypotheses_col().find_one({"_id": ObjectId(hypothesis_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hypothesis not found")
    return Hypothesis(**_serialize(doc))


async def list_hypotheses(session_id: str) -> list[Hypothesis]:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    cursor = hypotheses_col().find({"session_id": session_id}).sort("created_at", 1)
    return [Hypothesis(**_serialize(doc)) async for doc in cursor]


async def update_hypothesis(hypothesis_id: str, data: HypothesisUpdate) -> Hypothesis:
    if not ObjectId.is_valid(hypothesis_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid hypothesis id")
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        return await get_hypothesis(hypothesis_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await hypotheses_col().find_one_and_update(
        {"_id": ObjectId(hypothesis_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hypothesis not found")
    return Hypothesis(**_serialize(result))


async def delete_hypothesis(hypothesis_id: str) -> None:
    if not ObjectId.is_valid(hypothesis_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid hypothesis id")
    result = await hypotheses_col().delete_one({"_id": ObjectId(hypothesis_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hypothesis not found")
