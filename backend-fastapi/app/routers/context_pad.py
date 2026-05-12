from typing import Literal
from fastapi import APIRouter, status
from app.models.context_pad import ContextPadEntry, ContextPadEntryCreate, ContextPadEntryUpdate
from app.services import context_pad_service

# Two mount points: session-scoped and project-scoped entries share the same handler
session_router = APIRouter(prefix="/sessions/{session_id}/context-pad", tags=["context-pad"])
project_router = APIRouter(prefix="/projects/{project_id}/context-pad", tags=["context-pad"])


@session_router.post("", response_model=ContextPadEntry, status_code=status.HTTP_201_CREATED)
async def create_session_entry(session_id: str, data: ContextPadEntryCreate):
    data.scope = "session"
    data.scope_id = session_id  # type: ignore[assignment]
    return await context_pad_service.create_entry(data)


@session_router.get("", response_model=list[ContextPadEntry])
async def list_session_entries(session_id: str):
    return await context_pad_service.list_entries("session", session_id)


@project_router.post("", response_model=ContextPadEntry, status_code=status.HTTP_201_CREATED)
async def create_project_entry(project_id: str, data: ContextPadEntryCreate):
    data.scope = "project"
    data.scope_id = project_id  # type: ignore[assignment]
    return await context_pad_service.create_entry(data)


@project_router.get("", response_model=list[ContextPadEntry])
async def list_project_entries(project_id: str):
    return await context_pad_service.list_entries("project", project_id)


# Shared entry operations (no scope prefix needed — entry_id is globally unique)
entry_router = APIRouter(prefix="/context-pad", tags=["context-pad"])


@entry_router.get("/{entry_id}", response_model=ContextPadEntry)
async def get_entry(entry_id: str):
    return await context_pad_service.get_entry(entry_id)


@entry_router.patch("/{entry_id}", response_model=ContextPadEntry)
async def update_entry(entry_id: str, data: ContextPadEntryUpdate):
    return await context_pad_service.update_entry(entry_id, data)


@entry_router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: str):
    await context_pad_service.delete_entry(entry_id)
