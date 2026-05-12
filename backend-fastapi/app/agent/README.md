# Agent Layer — Interface Contract

This directory is owned by the AI engineer. The CRUD layer (`routers/`, `services/`) is complete and stable. This README defines the contracts each module must fulfil so both layers compose without circular dependencies.

---

## Dependency rule

**Agent code imports from services. Services never import from agent.**

```
routers → services → database
agent   → services (for persistence only)
```

---

## Module contracts

### `runner.py` — `AgentRunner`

Entry point for all agent execution. Called by `ws_handler.py`.

```python
async def run_step(session_id: str, step_input: StepInput) -> AsyncIterator[StepEvent]: ...
```

Must:
- Call `step_service.create_step()` to open the step record before streaming begins
- Yield `StepEvent` objects as work progresses (see event types below)
- Call `step_service.finalize_step()` atomically when the step completes or errors
- Call `session_service.append_step_id()` after a successful step
- Call `session_service.append_artifact_id()` for each artifact promoted
- **Never** read or reference `personal_scratch_pad` — this field must never appear in any prompt construction path

### `ws_handler.py` — WebSocket endpoint

Mounts at `/ws/sessions/{session_id}`. Accepts a JSON message `{"user_message": "..."}`, delegates to `AgentRunner.run_step`, and streams `StepEvent` JSON frames back to the client.

### `tools/base.py` — shared types

```python
@dataclass
class ToolResult:
    success: bool
    data: Any
    error: str | None = None

class BaseTool(ABC):
    @abstractmethod
    async def run(self, **kwargs) -> ToolResult: ...
```

### `tools/execute_code.py`

```python
async def execute_code(session_id: str, code: str, language: str = "python") -> ToolResult:
    """Execute code in the session's stateful Jupyter kernel via KernelManager."""
    ...
```

### `tools/artifact_tools.py`

```python
async def create_artifact(session_id: str, step_id: str, type: ArtifactType, name: str, payload: dict) -> Artifact:
    """Persist via artifact_service and register on session via session_service.append_artifact_id."""
    ...

async def read_artifact(artifact_id: str) -> Artifact: ...
async def update_artifact(artifact_id: str, payload: dict) -> Artifact: ...
```

### `tools/task_tools.py`

```python
async def update_task_graph(session_id: str, graph: TaskGraph) -> Session: ...
async def mark_task_complete(session_id: str, node_id: str) -> Session: ...
```

### `tools/hypothesis_tools.py`

```python
async def add_hypothesis(session_id: str, statement: str) -> Hypothesis: ...
async def update_hypothesis(hypothesis_id: str, status: HypothesisStatus, evidence_ids: list[str]) -> Hypothesis: ...
```

### `tools/cleaning_tools.py`

```python
async def propose_cleaning(session_id: str, transformations: list[dict]) -> list[dict]:
    """Return proposed transformations for user approval — does not persist yet."""
    ...

async def apply_cleaning(session_id: str, step_id: str, approved_transformations: list[dict]) -> list[CleaningEntry]:
    """Persist approved entries via cleaning_ledger_service — immutable after this point."""
    ...
```

### `kernel/manager.py` — `KernelManager`

```python
class KernelHandle:
    session_id: str
    kernel_id: str
    async def execute(self, code: str) -> KernelOutput: ...
    async def interrupt(self) -> None: ...
    async def restart(self) -> None: ...

class KernelManager:
    async def get_or_create(self, session_id: str) -> KernelHandle:
        """Return an existing warm kernel for the session or start a new one."""
        ...
    async def shutdown(self, session_id: str) -> None: ...
```

### `llm/base.py` — `LLMProvider`

```python
@dataclass
class LLMEvent:
    type: Literal["text_delta", "tool_use", "tool_result", "done"]
    data: Any

class LLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str = "",
    ) -> AsyncIterator[LLMEvent]: ...
```

### `llm/factory.py`

```python
def get_provider(model_id: str) -> LLMProvider:
    """Return the correct provider instance based on model_id prefix."""
    ...
```

---

## StepEvent types (streamed over WebSocket)

```python
class StepEvent(TypedDict):
    type: Literal["reasoning", "tool_call", "tool_result", "output", "artifact_created", "uncertainty", "done", "error"]
    data: Any
    step_id: str
```

---

## Context Pad merge

Call `context_pad_service.merge_for_prompt(session_id, project_id)` to get the ordered list of entries to prepend to the system prompt. Session-scoped entries are returned first (higher precedence).
