from app.agent.llm.base import LLMProvider
from app.agent.llm.anthropic import AnthropicProvider
from app.agent.llm.openai import OpenAIProvider


def get_provider(model_id: str) -> LLMProvider:
    """
    Resolve a model_id string to the correct LLMProvider instance.

    Routing:
    - "claude-*"  → AnthropicProvider
    - "gpt-*", "o*" → OpenAIProvider
    - Extend here for Google (gemini-*), Mistral (mistral-*), etc.
    """
    if model_id.startswith("claude"):
        return AnthropicProvider(model_id)
    if model_id.startswith(("gpt", "o1", "o3", "o4")):
        return OpenAIProvider(model_id)
    raise ValueError(f"No provider registered for model_id: {model_id!r}")
