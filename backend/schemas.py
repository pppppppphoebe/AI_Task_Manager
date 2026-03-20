from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models import Priority, Status

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Priority = Priority.MEDIUM
    status: Status = Status.TODO
    workload: int = 1

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    workload: Optional[int] = None

class TaskSchema(TaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AIParsedTask(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Priority = Priority.MEDIUM
    workload: int = 1
