# AI Task Management System (TaskFlow AI)

A modern, intelligent task manager with **DeepSeek AI** and **Google Calendar** integration. It doesn't just list tasks—it acts as your **AI Project Manager** to schedule your day and track long-term progress.

## 🚀 Key Features

### 1. AI Project Manager (Daily Scheduler)
- **Dynamic Time Blocking:** AI breaks down large tasks into manageable daily time blocks based on your available working hours.
- **Context-Aware Scheduling:** AI automatically avoids conflicts with your Google Calendar meetings and adjusts for holidays or special events (like birthdays).
- **Quantifiable Feedback Loop:** Report actual progress after completing a block. AI recalculates remaining workloads to optimize tomorrow's schedule.

### 2. Google Calendar Integration (One-Way Sync)
- **Fixed Constraints:** Fetch your real-time meetings and events to serve as hard scheduling boundaries.
- **Special Event Detection:** Birthdays and holidays are treated as "Life Context," prompting AI to suggest empathetic tasks (e.g., "Buy birthday gift").

### 3. Advanced Visualization
- **Modern Calendar View:** A high-end, color-coded monthly view showing Tasks, Google Events, and AI-scheduled blocks.
- **Live Dashboard:** Real-time analytics on task distribution and workload by priority using Chart.js.

### 4. AI Quick Add
- Natural language task creation. AI automatically extracts concise titles (< 8 words) and puts full context into the description.

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript (Optimized), Tailwind CSS v4, Lucide-React, Chart.js.
- **Backend:** FastAPI, PostgreSQL/SQLAlchemy, Pydantic v2.
- **AI:** DeepSeek-V3 (OpenAI SDK Compatible).
- **Auth:** Google OAuth 2.0.

## 📦 Setup Instructions

### 1. Google API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Calendar API**.
3. Create OAuth 2.0 Credentials (Web Application).
4. Add Redirect URI: `http://127.0.0.1:8000/auth/google/callback`.

### 2. Environment Configuration
Edit `backend/.env`:
```env
DEEPSEEK_API_KEY="your_key"
GOOGLE_CLIENT_ID="your_id"
GOOGLE_CLIENT_SECRET="your_secret"
GOOGLE_REDIRECT_URI="http://127.0.0.1:8000/auth/google/callback"
DATABASE_URL="postgresql://user:pass@localhost:5432/db_name"
```

### 3. Launch
**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
