from enum import Enum
from pydantic import BaseModel
from app.models.common import BaseDocument, PyObjectId


class HypothesisStatus(str, Enum):
    active = "Active"
    supported = "Supported"
    refuted = "Refuted"
    inconclusive = "Inconclusive"


class HypothesisCreate(BaseModel):
    session_id: PyObjectId
    statement: str
    status: HypothesisStatus = HypothesisStatus.active


class HypothesisUpdate(BaseModel):
    statement: str | None = None
    status: HypothesisStatus | None = None
    evidence_artifact_ids: list[PyObjectId] | None = None


class Hypothesis(BaseDocument):
    session_id: PyObjectId
    statement: str
    status: HypothesisStatus = HypothesisStatus.active
    evidence_artifact_ids: list[PyObjectId] = []
