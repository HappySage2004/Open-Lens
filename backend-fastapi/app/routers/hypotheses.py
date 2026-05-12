from fastapi import APIRouter, status
from app.models.hypothesis import Hypothesis, HypothesisCreate, HypothesisUpdate
from app.services import hypothesis_service

router = APIRouter(prefix="/sessions/{session_id}/hypotheses", tags=["hypotheses"])


@router.post("", response_model=Hypothesis, status_code=status.HTTP_201_CREATED)
async def create_hypothesis(session_id: str, data: HypothesisCreate):
    data.session_id = session_id  # type: ignore[assignment]
    return await hypothesis_service.create_hypothesis(data)


@router.get("", response_model=list[Hypothesis])
async def list_hypotheses(session_id: str):
    return await hypothesis_service.list_hypotheses(session_id)


@router.get("/{hypothesis_id}", response_model=Hypothesis)
async def get_hypothesis(session_id: str, hypothesis_id: str):
    return await hypothesis_service.get_hypothesis(hypothesis_id)


@router.patch("/{hypothesis_id}", response_model=Hypothesis)
async def update_hypothesis(session_id: str, hypothesis_id: str, data: HypothesisUpdate):
    return await hypothesis_service.update_hypothesis(hypothesis_id, data)


@router.delete("/{hypothesis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hypothesis(session_id: str, hypothesis_id: str):
    await hypothesis_service.delete_hypothesis(hypothesis_id)
