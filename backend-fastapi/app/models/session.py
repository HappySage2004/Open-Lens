from typing import Literal
from pydantic import BaseModel, Field
from app.models.common import BaseDocument, PyObjectId


class TaskNode(BaseModel):
    node_id: str
    label: str
    status: Literal["pending", "in_progress", "completed", "skipped"] = "pending"
    depends_on: list[str] = []


class TaskGraph(BaseModel):
    nodes: list[TaskNode] = []


class SessionSettings(BaseModel):
    model_id: str = "claude-sonnet-4-6"
    reasoning_effort: Literal["low", "medium", "high"] = "medium"
    auto_promote_artifacts: bool = True
    show_uncertainty_flags: bool = True
    suggest_next_steps: bool = True
    stream_reasoning: bool = True


class SessionCreate(BaseModel):
    project_id: PyObjectId
    title: str
    problem_statement: str = ""
    settings: SessionSettings = Field(default_factory=SessionSettings)


class SessionUpdate(BaseModel):
    title: str | None = None
    problem_statement: str | None = None
    task_graph: TaskGraph | None = None
    settings: SessionSettings | None = None
    data_snapshot_ref: str | None = None


class Session(BaseDocument):
    project_id: PyObjectId
    title: str
    problem_statement: str = ""
    task_graph: TaskGraph = Field(default_factory=TaskGraph)
    settings: SessionSettings = Field(default_factory=SessionSettings)
    data_snapshot_ref: str | None = None
    step_ids: list[PyObjectId] = []
    artifact_ids: list[PyObjectId] = []
