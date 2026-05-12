from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_client
from app.routers import projects, sessions, steps, artifacts, hypotheses, cleaning_ledger
from app.routers.context_pad import session_router, project_router, entry_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_client()


app = FastAPI(
    title="OpenLens API",
    version="0.1.0",
    description="Backend for the OpenLens agentic analytics platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(sessions.router)
app.include_router(steps.router)
app.include_router(artifacts.router)
app.include_router(hypotheses.router)
app.include_router(cleaning_ledger.router)
app.include_router(session_router)
app.include_router(project_router)
app.include_router(entry_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
