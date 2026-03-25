from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Boolean, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
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

class BlockSource(str, enum.Enum):
    SYSTEM = "system"
    GOOGLE_CALENDAR = "google_calendar"

class BlockStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "InProgress"
    COMPLETED = "Completed"
    REVIEWED = "Reviewed"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM)
    status = Column(SQLEnum(Status), default=Status.TODO)
    
    # Updated Workload Logic
    total_workload = Column(Float, default=1.0) # total estimated hours
    remaining_workload = Column(Float, default=1.0) # hours left to complete
    
    is_daily = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    time_blocks = relationship("TimeBlock", back_populates="task", cascade="all, delete-orphan")

class TimeBlock(Base):
    __tablename__ = "time_blocks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    
    title = Column(String)
    date = Column(Date)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration_hours = Column(Float, default=0.0)
    
    source = Column(SQLEnum(BlockSource), default=BlockSource.SYSTEM)
    is_fixed = Column(Boolean, default=False)
    is_all_day = Column(Boolean, default=False)
    
    google_event_id = Column(String, nullable=True, unique=True)
    status = Column(SQLEnum(BlockStatus), default=BlockStatus.SCHEDULED)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    task = relationship("Task", back_populates="time_blocks")

class GoogleAuth(Base):
    __tablename__ = "google_auth"
    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

