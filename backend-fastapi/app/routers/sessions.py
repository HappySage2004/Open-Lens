from fastapi import APIRouter, status
from app.models.session import Session, SessionCreate, SessionUpdate
from app.services import session_service

router = APIRouter(prefix="/projects/{project_id}/sessions", tags=["sessions"])


@router.post("", response_model=Session, status_code=status.HTTP_201_CREATED)
async def create_session(project_id: str, data: SessionCreate):
    data.project_id = project_id  # type: ignore[assignment]
    return await session_service.create_session(data)


@router.get("", response_model=list[Session])
async def list_sessions(project_id: str, skip: int = 0, limit: int = 50):
    return await session_service.list_sessions(project_id, skip, limit)


@router.get("/{session_id}", response_model=Session)
async def get_session(project_id: str, session_id: str):
    return await session_service.get_session(session_id)


@router.patch("/{session_id}", response_model=Session)
async def update_session(project_id: str, session_id: str, data: SessionUpdate):
    return await session_service.update_session(session_id, data)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(project_id: str, session_id: str):
    await session_service.delete_session(session_id)
