from app.agent.tools.base import ToolResult


async def execute_code(session_id: str, code: str, language: str = "python") -> ToolResult:
    """
    Execute `code` in the stateful Jupyter kernel bound to `session_id`.

    Steps:
    1. kernel_manager.get_or_create(session_id) → KernelHandle
    2. handle.execute(code) → KernelOutput
    3. Return ToolResult(success=True, data={"stdout": ..., "display_data": [...]})

    On execution error return ToolResult(success=False, error=traceback_str).
    """
    raise NotImplementedError
