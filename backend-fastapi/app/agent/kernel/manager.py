from dataclasses import dataclass
from typing import Any


@dataclass
class KernelOutput:
    stdout: str = ""
    stderr: str = ""
    display_data: list[dict[str, Any]] = None

    def __post_init__(self):
        if self.display_data is None:
            self.display_data = []


class KernelHandle:
    """Handle to a running Jupyter kernel for a specific session."""

    def __init__(self, session_id: str, kernel_id: str):
        self.session_id = session_id
        self.kernel_id = kernel_id

    async def execute(self, code: str) -> KernelOutput:
        """Execute code and return captured output. Raises on kernel error."""
        raise NotImplementedError

    async def interrupt(self) -> None:
        """Send a kernel interrupt signal."""
        raise NotImplementedError

    async def restart(self) -> None:
        """Restart the kernel, clearing all state."""
        raise NotImplementedError


class KernelManager:
    """
    Manages a pool of stateful Jupyter kernels, one per session.

    Implementation notes:
    - Use jupyter_client.AsyncKernelManager under the hood
    - Pre-warm kernels from a pool to reduce first-execution latency
    - Idle kernels should be shut down after a configurable TTL
    """

    _kernels: dict[str, KernelHandle] = {}

    async def get_or_create(self, session_id: str) -> KernelHandle:
        """Return the warm kernel for session_id, or start a new one."""
        raise NotImplementedError

    async def shutdown(self, session_id: str) -> None:
        """Shut down and remove the kernel for session_id."""
        raise NotImplementedError

    async def shutdown_all(self) -> None:
        """Graceful shutdown for all kernels — call on app teardown."""
        raise NotImplementedError


kernel_manager = KernelManager()
