from fastapi import APIRouter, status
from app.models.step import Step, StepCreate, StepUpdate
from app.services import step_service

router = APIRouter(prefix="/sessions/{session_id}/steps", tags=["steps"])


@router.post("", response_model=Step, status_code=status.HTTP_201_CREATED)
async def create_step(session_id: str, data: StepCreate):
    data.session_id = session_id  # type: ignore[assignment]
    return await step_service.create_step(data)


@router.get("", response_model=list[Step])
async def list_steps(session_id: str):
    return await step_service.list_steps(session_id)


@router.get("/{step_id}", response_model=Step)
async def get_step(session_id: str, step_id: str):
    return await step_service.get_step(step_id)


@router.patch("/{step_id}", response_model=Step)
async def update_step(session_id: str, step_id: str, data: StepUpdate):
    return await step_service.finalize_step(step_id, data)


@router.delete("/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_step(session_id: str, step_id: str):
    await step_service.delete_step(step_id)
