from fastapi import APIRouter, status
from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate):
    return await project_service.create_project(data)


@router.get("", response_model=list[Project])
async def list_projects(skip: int = 0, limit: int = 50):
    return await project_service.list_projects(skip, limit)


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    return await project_service.get_project(project_id)


@router.patch("/{project_id}", response_model=Project)
async def update_project(project_id: str, data: ProjectUpdate):
    return await project_service.update_project(project_id, data)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    await project_service.delete_project(project_id)
