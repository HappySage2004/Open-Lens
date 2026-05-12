from typing import Any, Literal
from pydantic import BaseModel, Field
from app.models.common import BaseDocument, PyObjectId


class ReasoningBlock(BaseModel):
    objective: str = ""
    approach: str = ""
    dependencies: list[str] = []
    risks: list[str] = []


class ToolCall(BaseModel):
    tool_name: str
    inputs: dict[str, Any] = {}
    outputs: dict[str, Any] = {}
    error: str | None = None


class StepOutput(BaseModel):
    stdout: str = ""
    stderr: str = ""
    display_data: list[dict[str, Any]] = []


class UncertaintyFlag(BaseModel):
    message: str
    severity: Literal["low", "medium", "high"] = "medium"


class StepCreate(BaseModel):
    session_id: PyObjectId
    sequence_number: int
    user_message: str = ""


class StepUpdate(BaseModel):
    reasoning_block: ReasoningBlock | None = None
    tool_calls: list[ToolCall] | None = None
    output: StepOutput | None = None
    artifact_ids: list[PyObjectId] | None = None
    uncertainty_flags: list[UncertaintyFlag] | None = None
    status: Literal["pending", "running", "completed", "failed"] | None = None


class Step(BaseDocument):
    session_id: PyObjectId
    sequence_number: int
    user_message: str = ""
    reasoning_block: ReasoningBlock = Field(default_factory=ReasoningBlock)
    tool_calls: list[ToolCall] = []
    output: StepOutput = Field(default_factory=StepOutput)
    artifact_ids: list[PyObjectId] = []
    uncertainty_flags: list[UncertaintyFlag] = []
    status: Literal["pending", "running", "completed", "failed"] = "pending"
