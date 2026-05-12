from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ToolResult:
    success: bool
    data: Any = None
    error: str | None = None


class BaseTool(ABC):
    """All agent tools inherit from this. Implement `run` and declare `name` + `schema`."""

    name: str
    schema: dict  # JSON Schema for the tool as expected by LLM provider tool_use APIs

    @abstractmethod
    async def run(self, **kwargs: Any) -> ToolResult: ...
