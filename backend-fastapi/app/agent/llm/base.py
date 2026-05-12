from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, AsyncIterator, Literal


@dataclass
class LLMEvent:
    type: Literal["text_delta", "tool_use", "tool_result", "done"]
    data: Any


class LLMProvider(ABC):
    """
    Unified async interface over LLM providers (Anthropic, OpenAI, Google, Mistral).

    `messages` follows the OpenAI/Anthropic common format:
        [{"role": "user" | "assistant", "content": str | list}, ...]

    `tools` is a list of JSON Schema tool definitions in Anthropic tool_use format.
    """

    model_id: str

    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str = "",
    ) -> AsyncIterator[LLMEvent]: ...
