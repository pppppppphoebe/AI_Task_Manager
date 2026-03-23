# AI Task Management System

A modern task manager with **DeepSeek AI** integration, featuring natural language parsing, intelligent sorting, and data visualization.

## Features
- **Task Management (CRUD):** Full control over your task lifecycle.
- **AI Quick Add (Parsing):** Create tasks using natural language. 
  - *Optimization:* AI automatically generates concise titles (< 8 words) and moves extra context into the description.
- **AI Priority Sort:** Optimize your schedule with AI recommendations based on deadlines, priority, and workload.
- **AI Insights:** Get weekly performance summaries and productivity reports.
- **Dashboard:** Visualize progress with Chart.js and manage workload distribution.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Chart.js, Lucide-React
  - *Note:* Standard enums have been replaced with `const` objects + `type` unions to comply with strict `erasableSyntaxOnly` TS rules.
- **Backend:** FastAPI, PostgreSQL/SQLite, SQLAlchemy, Pydantic
- **AI:** DeepSeek (Compatible with OpenAI SDK)

## Setup Instructions

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Edit `.env` to include your `DEEPSEEK_API_KEY`.
4. Run `uvicorn main:app --reload` (or `python main.py`)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## File Structure
- `backend/`: FastAPI application, models, and DeepSeek AI services.
- `frontend/`: React application, components, and optimized TypeScript types.
