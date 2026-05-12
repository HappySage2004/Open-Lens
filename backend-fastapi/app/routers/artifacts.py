from fastapi import APIRouter, status
from app.models.artifact import Artifact, ArtifactCreate, ArtifactUpdate
from app.services import artifact_service

router = APIRouter(prefix="/sessions/{session_id}/artifacts", tags=["artifacts"])


@router.post("", response_model=Artifact, status_code=status.HTTP_201_CREATED)
async def create_artifact(session_id: str, data: ArtifactCreate):
    data.session_id = session_id  # type: ignore[assignment]
    return await artifact_service.create_artifact(data)


@router.get("", response_model=list[Artifact])
async def list_artifacts(session_id: str, type: str | None = None):
    return await artifact_service.list_artifacts(session_id, type)


@router.get("/{artifact_id}", response_model=Artifact)
async def get_artifact(session_id: str, artifact_id: str):
    return await artifact_service.get_artifact(artifact_id)


@router.patch("/{artifact_id}", response_model=Artifact)
async def update_artifact(session_id: str, artifact_id: str, data: ArtifactUpdate):
    return await artifact_service.update_artifact(artifact_id, data)


@router.delete("/{artifact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_artifact(session_id: str, artifact_id: str):
    await artifact_service.delete_artifact(artifact_id)
