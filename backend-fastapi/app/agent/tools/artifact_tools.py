from typing import Any
from app.models.artifact import Artifact, ArtifactCreate, ArtifactType
from app.services import artifact_service, session_service


async def create_artifact(
    session_id: str, step_id: str, type: ArtifactType, name: str, payload: dict[str, Any]
) -> Artifact:
    """
    Persist an artifact and register it on the session.
    Must call session_service.append_artifact_id after inserting.
    """
    raise NotImplementedError


async def read_artifact(artifact_id: str) -> Artifact:
    """Fetch a previously created artifact by id."""
    return await artifact_service.get_artifact(artifact_id)


async def update_artifact(artifact_id: str, payload: dict[str, Any]) -> Artifact:
    """Update an existing artifact's payload (e.g. chart data refresh)."""
    raise NotImplementedError
