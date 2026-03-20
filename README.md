# AI Task Management System

A modern task manager with GPT-4o integration, featuring natural language parsing, intelligent sorting, and data visualization.

## Features
- **Task Management (CRUD):** Full control over your task lifecycle.
- **AI Parsing:** Create tasks using natural language.
- **AI Priority Sort:** Optimize your schedule with AI recommendations.
- **AI Insights:** Get weekly performance summaries.
- **Dashboard:** Visualize progress with Chart.js.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Chart.js, Lucide-React
- **Backend:** FastAPI, SQLite, SQLAlchemy, Pydantic
- **AI:** OpenAI GPT-4o

## Setup Instructions

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Edit `.env` to include your `OPENAI_API_KEY`.
4. Run `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## File Structure
- `backend/`: FastAPI application, models, and AI services.
- `frontend/`: React application and components.
