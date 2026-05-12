from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.db_name]


# Collection accessors
def projects_col():
    return get_db()["projects"]


def sessions_col():
    return get_db()["sessions"]


def steps_col():
    return get_db()["steps"]


def artifacts_col():
    return get_db()["artifacts"]


def hypotheses_col():
    return get_db()["hypotheses"]


def cleaning_ledger_col():
    return get_db()["cleaning_ledger"]


def context_pad_col():
    return get_db()["context_pad_entries"]


async def close_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None
