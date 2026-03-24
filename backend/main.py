from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import Task, Priority, Status
from schemas import TaskCreate, TaskUpdate, TaskSchema, AIParsedTask
from ai_service import parse_task_from_text, get_priority_sorting, get_weekly_summary
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
