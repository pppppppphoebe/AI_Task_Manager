from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Boolean
import enum
from database import Base
import datetime

class Priority(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Status(str, enum.Enum):
    TODO = "Todo"
    IN_PROGRESS = "InProgress"
    DONE = "Done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM)
    status = Column(SQLEnum(Status), default=Status.TODO)
    workload = Column(Integer, default=1) # estimated hours
    is_daily = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
