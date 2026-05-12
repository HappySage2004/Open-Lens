from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import projects_col
from app.models.project import Project, ProjectCreate, ProjectUpdate


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


async def create_project(data: ProjectCreate) -> Project:
    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(), "created_at": now, "updated_at": now}
    result = await projects_col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return Project(**_serialize(doc))


async def get_project(project_id: str) -> Project:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid project id")
    doc = await projects_col().find_one({"_id": ObjectId(project_id)})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return Project(**_serialize(doc))


async def list_projects(skip: int = 0, limit: int = 50) -> list[Project]:
    cursor = projects_col().find().sort("created_at", -1).skip(skip).limit(limit)
    return [Project(**_serialize(doc)) async for doc in cursor]


async def update_project(project_id: str, data: ProjectUpdate) -> Project:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid project id")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        return await get_project(project_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await projects_col().find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return Project(**_serialize(result))


async def delete_project(project_id: str) -> None:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid project id")
    result = await projects_col().delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
