from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from models import Priority, Status, BlockSource, BlockStatus

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Priority = Priority.MEDIUM
    status: Status = Status.TODO
    total_workload: float = 1.0
    remaining_workload: float = 1.0
    is_daily: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    total_workload: Optional[float] = None
    remaining_workload: Optional[float] = None
    is_daily: Optional[bool] = None

class TimeBlockBase(BaseModel):
    title: str
    date: date
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_hours: float = 0.0
    source: BlockSource = BlockSource.SYSTEM
    is_fixed: bool = False
    is_all_day: bool = False
    google_event_id: Optional[str] = None
    status: BlockStatus = BlockStatus.SCHEDULED

class TimeBlockCreate(TimeBlockBase):
    task_id: Optional[int] = None

class TimeBlockUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    status: Optional[BlockStatus] = None

class TimeBlockSchema(TimeBlockBase):
    id: int
    task_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class TaskSchema(TaskBase):
    id: int
    created_at: datetime
    time_blocks: List[TimeBlockSchema] = []

    class Config:
        from_attributes = True

class AIParsedTask(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Priority = Priority.MEDIUM
    total_workload: float = 1.0
    is_daily: bool = False

class DailyScheduleRequest(BaseModel):
    available_hours: float
    current_time: str

