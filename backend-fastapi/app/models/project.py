from pydantic import BaseModel, Field
from app.models.common import BaseDocument


class ProjectCreate(BaseModel):
    title: str
    description: str = ""


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class Project(BaseDocument):
    title: str
    description: str = ""
