from fastapi import APIRouter, status
from app.models.cleaning_ledger import CleaningEntry, CleaningEntryCreate
from app.services import cleaning_ledger_service

router = APIRouter(prefix="/sessions/{session_id}/cleaning-ledger", tags=["cleaning-ledger"])


@router.post("", response_model=CleaningEntry, status_code=status.HTTP_201_CREATED)
async def append_entry(session_id: str, data: CleaningEntryCreate):
    data.session_id = session_id  # type: ignore[assignment]
    return await cleaning_ledger_service.append_entry(data)


@router.get("", response_model=list[CleaningEntry])
async def list_entries(session_id: str):
    return await cleaning_ledger_service.list_entries(session_id)


@router.get("/{entry_id}", response_model=CleaningEntry)
async def get_entry(session_id: str, entry_id: str):
    return await cleaning_ledger_service.get_entry(entry_id)
