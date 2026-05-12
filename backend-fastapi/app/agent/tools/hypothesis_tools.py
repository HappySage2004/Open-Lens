from app.models.hypothesis import Hypothesis, HypothesisCreate, HypothesisStatus, HypothesisUpdate
from app.services import hypothesis_service


async def add_hypothesis(session_id: str, statement: str) -> Hypothesis:
    """Create a new hypothesis in Active status."""
    raise NotImplementedError


async def update_hypothesis(
    hypothesis_id: str,
    status: HypothesisStatus,
    evidence_artifact_ids: list[str] | None = None,
) -> Hypothesis:
    """Update hypothesis status and attach supporting artifact evidence."""
    raise NotImplementedError
