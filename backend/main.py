from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import Task, TimeBlock, Priority, Status, BlockSource, BlockStatus
from schemas import TaskCreate, TaskUpdate, TaskSchema, AIParsedTask, DailyScheduleRequest, TimeBlockSchema
from ai_service import parse_task_from_text, get_priority_sorting, get_weekly_summary, get_daily_schedule
from google_service import get_google_auth_url, process_google_callback, sync_todays_calendar_events, get_valid_credentials
from fastapi.responses import RedirectResponse
import datetime
import os


# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Task Manager API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, set to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tasks", response_model=List[TaskSchema])
def get_tasks(
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    return query.all()

@app.get("/time_blocks", response_model=List[TimeBlockSchema])
def get_time_blocks(db: Session = Depends(get_db)):
    return db.query(TimeBlock).all()

@app.post("/tasks", response_model=List[TaskSchema])
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # If it's a daily task and we have a deadline, create multiple tasks
    if task.is_daily and task.deadline:
        now = datetime.datetime.now()
        # Keep only the date part of the deadline
        deadline_date = task.deadline.date()
        current_date = now.date()
        
        created_tasks = []
        
        while current_date <= deadline_date:
            # Create a new task for this day
            new_task_data = task.model_dump()
            
            # Update title to include date and set deadline to that day
            # (Keeping time if original had it, or just using current time on that day)
            new_deadline = datetime.datetime.combine(current_date, task.deadline.time())
            new_task_data['deadline'] = new_deadline
            
            db_task = Task(**new_task_data)
            db.add(db_task)
            created_tasks.append(db_task)
            
            current_date += datetime.timedelta(days=1)
            
        db.commit()
        for t in created_tasks:
            db.refresh(t)
        return created_tasks
    else:
        # Standard single task creation
        db_task = Task(**task.model_dump())
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return [db_task]

@app.put("/tasks/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

# Google Auth & Calendar Endpoints

@app.get("/auth/google/login")
def google_login():
    url = get_google_auth_url()
    return {"url": url}

@app.get("/auth/google/callback")
def google_callback(code: Optional[str] = None, state: Optional[str] = None, db: Session = Depends(get_db)):
    # 如果 FastAPI 沒抓到 code，嘗試從系統環境或手動解析 (雖然 FastAPI 通常能抓到，但預防萬一)
    if not code:
        print("DEBUG: Code not found in parameters, authentication failed.")
        return {"error": "No code provided by Google"}
        
    success = process_google_callback(code, db)
    if success:
        return RedirectResponse(url="http://localhost:5173?google_sync=success")
    return {"error": "Failed to authenticate"}

@app.get("/auth/google/status")
def google_status(db: Session = Depends(get_db)):
    creds = get_valid_credentials(db)
    return {"connected": creds is not None}

@app.post("/calendar/sync")
def sync_calendar(db: Session = Depends(get_db)):
    return sync_todays_calendar_events(db)

# AI Endpoints

@app.post("/ai/parse", response_model=AIParsedTask)
def ai_parse_task(text: str = Query(...)):
    try:
        return parse_task_from_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/sort", response_model=List[int])
def ai_sort_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.status != Status.DONE).all()
    if not tasks:
        return []
    
    task_list = [{"id": t.id, "title": t.title, "priority": t.priority, "deadline": t.deadline.isoformat() if t.deadline else None, "workload": t.workload} for t in tasks]
    try:
        return get_priority_sorting(task_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/summary")
def ai_summary(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    if not tasks:
        return {"summary": "No tasks yet. Get started!"}
    
    task_list = [{"title": t.title, "status": t.status, "deadline": t.deadline.isoformat() if t.deadline else None} for t in tasks]
    try:
        summary = get_weekly_summary(task_list)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/schedule/today", response_model=List[TimeBlockSchema])
def ai_schedule_today(request: DailyScheduleRequest, db: Session = Depends(get_db)):
    # 1. Get today's fixed blocks and all-day events (from DB, assuming Google Sync populated them)
    today = datetime.datetime.strptime(request.current_time, "%Y-%m-%d %H:%M:%S").date()
    
    todays_blocks = db.query(TimeBlock).filter(TimeBlock.date == today).all()
    
    fixed_blocks = []
    all_day_events = []
    for b in todays_blocks:
        if b.is_all_day:
            all_day_events.append(b.title)
        elif b.is_fixed:
            fixed_blocks.append({
                "title": b.title,
                "start_time": b.start_time.isoformat() if b.start_time else None,
                "end_time": b.end_time.isoformat() if b.end_time else None,
                "duration_hours": b.duration_hours
            })
            
    # 2. Get flexible tasks that are not done and have remaining workload
    flexible_tasks_db = db.query(Task).filter(Task.status != Status.DONE, Task.remaining_workload > 0).all()
    flexible_tasks = []
    for t in flexible_tasks_db:
        flexible_tasks.append({
            "task_id": t.id,
            "title": t.title,
            "priority": t.priority,
            "remaining_workload": t.remaining_workload,
            "deadline": t.deadline.isoformat() if t.deadline else None,
            "is_daily": t.is_daily
        })

    # 3. Call AI Service
    try:
        schedule_data = get_daily_schedule(
            available_hours=request.available_hours,
            current_time=request.current_time,
            fixed_blocks=fixed_blocks,
            flexible_tasks=flexible_tasks,
            all_day_events=all_day_events
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Scheduling failed: {str(e)}")

    # 4. Save new flexible blocks to DB
    new_blocks = schedule_data.get("new_time_blocks", [])
    created_blocks = []
    
    for block_data in new_blocks:
        start_time_str = block_data.get("suggested_start_time")
        start_dt = None
        if start_time_str:
            try:
                # expecting HH:MM format from AI
                start_dt = datetime.datetime.combine(today, datetime.datetime.strptime(start_time_str, "%H:%M").time())
            except ValueError:
                pass # ignore if AI returns weird format

        # Resolve title from task if not provided by AI (for normal tasks)
        title = block_data.get("title")
        task_id = block_data.get("task_id")
        if not title and task_id:
            task = db.query(Task).filter(Task.id == task_id).first()
            if task:
                title = task.title
        
        if not title:
            title = "AI Scheduled Task"

        new_block = TimeBlock(
            task_id=task_id, # can be null for surprise tasks
            title=title,
            date=today,
            start_time=start_dt,
            duration_hours=block_data.get("duration_hours", 1.0),
            is_fixed=False,
            is_all_day=False,
            source=BlockSource.SYSTEM,
            status=BlockStatus.SCHEDULED
        )
        db.add(new_block)
        created_blocks.append(new_block)

    db.commit()
    for b in created_blocks:
        db.refresh(b)
        
    return created_blocks

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
