from app.models.session import Session, SessionUpdate, TaskGraph
from app.services import session_service


async def update_task_graph(session_id: str, graph: TaskGraph) -> Session:
    """Replace the session's task graph with an updated DAG."""
    raise NotImplementedError


async def mark_task_complete(session_id: str, node_id: str) -> Session:
    """Set a single task node's status to 'completed'."""
    raise NotImplementedError
