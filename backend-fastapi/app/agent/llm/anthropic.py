from typing import AsyncIterator
from app.agent.llm.base import LLMEvent, LLMProvider


class AnthropicProvider(LLMProvider):
    """
    LLMProvider implementation for Anthropic models (claude-*).

    Recommended: use the Anthropic Python SDK with streaming tool use.
    Enable prompt caching on the system prompt and tool definitions.

    SDK: pip install anthropic
    """

    def __init__(self, model_id: str = "claude-sonnet-4-6"):
        self.model_id = model_id

    async def generate(
        self, messages: list[dict], tools: list[dict], system: str = ""
    ) -> AsyncIterator[LLMEvent]:
        raise NotImplementedError
        yield  # type: ignore[misc]
