from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import artifacts_col
from app.models.artifact import Artifact, ArtifactCreate, ArtifactUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_artifact(data: ArtifactCreate) -> Artifact:
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "created_at": now, "updated_at": now}
    result = await artifacts_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return Artifact(**_serialize(doc))


async def get_artifact(artifact_id: str) -> Artifact:
    if not ObjectId.is_valid(artifact_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid artifact id")
    doc = await artifacts_col().find_one({"_id": ObjectId(artifact_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artifact not found")
    return Artifact(**_serialize(doc))


async def list_artifacts(session_id: str, artifact_type: str | None = None) -> list[Artifact]:
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid session id")
    query: dict = {"session_id": session_id}
    if artifact_type:
        query["type"] = artifact_type
    cursor = artifacts_col().find(query).sort("created_at", 1)
    return [Artifact(**_serialize(doc)) async for doc in cursor]


async def update_artifact(artifact_id: str, data: ArtifactUpdate) -> Artifact:
    if not ObjectId.is_valid(artifact_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid artifact id")
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not updates:
        return await get_artifact(artifact_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await artifacts_col().find_one_and_update(
        {"_id": ObjectId(artifact_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artifact not found")
    return Artifact(**_serialize(result))


async def delete_artifact(artifact_id: str) -> None:
    if not ObjectId.is_valid(artifact_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid artifact id")
    result = await artifacts_col().delete_one({"_id": ObjectId(artifact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artifact not found")
