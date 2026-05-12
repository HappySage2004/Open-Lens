from typing import AsyncIterator, Any, Literal, TypedDict

from app.models.step import StepCreate, StepUpdate


class StepInput(TypedDict):
    user_message: str
    sequence_number: int


class StepEvent(TypedDict):
    type: Literal["reasoning", "tool_call", "tool_result", "output", "artifact_created", "uncertainty", "done", "error"]
    data: Any
    step_id: str


async def run_step(session_id: str, step_input: StepInput) -> AsyncIterator[StepEvent]:
    """
    Main agent execution loop for a single step.

    Contract:
    - Open the step record: await step_service.create_step(StepCreate(...))
    - Build system prompt from context_pad_service.merge_for_prompt(session_id, project_id)
    - personal_scratch_pad must NEVER appear in the prompt — it is user-private
    - Yield StepEvent dicts as work progresses
    - On completion: await step_service.finalize_step(step_id, StepUpdate(...))
    - On artifact: await session_service.append_artifact_id(session_id, artifact_id)
    - On step done: await session_service.append_step_id(session_id, step_id)
    """
    raise NotImplementedError
    # mypy: the yield below makes this an async generator so the return type is correct
    yield  # type: ignore[misc]
