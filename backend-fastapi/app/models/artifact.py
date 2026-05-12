from enum import Enum
from typing import Any
from pydantic import BaseModel, Field
from app.models.common import BaseDocument, PyObjectId


class ArtifactType(str, Enum):
    chart = "Chart"
    table = "Table"
    summary_stat = "SummaryStat"
    model_output = "ModelOutput"
    key_finding = "KeyFinding"
    cleaning_ledger = "CleaningLedger"
    hypothesis_register = "HypothesisRegister"
    narrative = "Narrative"


class ArtifactCreate(BaseModel):
    session_id: PyObjectId
    step_id: PyObjectId | None = None
    type: ArtifactType
    name: str
    payload: dict[str, Any] = {}
    tags: list[str] = []


class ArtifactUpdate(BaseModel):
    name: str | None = None
    payload: dict[str, Any] | None = None
    tags: list[str] | None = None


class Artifact(BaseDocument):
    session_id: PyObjectId
    step_id: PyObjectId | None = None
    type: ArtifactType
    name: str
    payload: dict[str, Any] = {}
    tags: list[str] = []
