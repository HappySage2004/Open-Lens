from app.models.cleaning_ledger import CleaningEntry, CleaningEntryCreate
from app.services import cleaning_ledger_service


async def propose_cleaning(session_id: str, transformations: list[dict]) -> list[dict]:
    """
    Return proposed transformations for user review — nothing is persisted at this stage.
    The frontend presents these to the user; approved ones are passed to apply_cleaning.
    """
    raise NotImplementedError


async def apply_cleaning(
    session_id: str, step_id: str, approved_transformations: list[dict]
) -> list[CleaningEntry]:
    """
    Persist each approved transformation as an immutable CleaningEntry.
    After this call the ledger cannot be altered — only new entries can be appended.
    """
    raise NotImplementedError
