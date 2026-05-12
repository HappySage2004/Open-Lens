from typing import AsyncIterator
from app.agent.llm.base import LLMEvent, LLMProvider


class OpenAIProvider(LLMProvider):
    """
    LLMProvider implementation for OpenAI models (gpt-*, o*).

    SDK: pip install openai
    """

    def __init__(self, model_id: str = "gpt-4o"):
        self.model_id = model_id

    async def generate(
        self, messages: list[dict], tools: list[dict], system: str = ""
    ) -> AsyncIterator[LLMEvent]:
        raise NotImplementedError
        yield  # type: ignore[misc]
