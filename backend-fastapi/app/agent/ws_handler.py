import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agent.runner import StepInput, run_step

router = APIRouter(tags=["agent-ws"])


@router.websocket("/ws/sessions/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint — streams StepEvent JSON frames to the frontend.

    Expected incoming message: {"user_message": "...", "sequence_number": N}
    Outgoing frames: StepEvent dicts serialised as JSON, one per line.

    TODO: implement when agent runner is ready.
    """
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            step_input: StepInput = json.loads(raw)
            async for event in run_step(session_id, step_input):
                await websocket.send_text(json.dumps(event))
    except WebSocketDisconnect:
        pass
    except NotImplementedError:
        await websocket.send_text(json.dumps({"type": "error", "data": "Agent not yet implemented", "step_id": ""}))
        await websocket.close()
