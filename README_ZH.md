# AI 任務管理器 (AI Task Manager)

這是一個結合了 **FastAPI (Python)**、**React (TypeScript)** 以及 **DeepSeek AI** 的現代化任務管理應用程式。它不僅能管理日常待辦事項，還能透過 AI 自動分析自然語言、優化任務排序並生成每週進度總結。

## 🚀 核心功能

### 1. 任務管理 (Task Management)
*   **全功能 CRUD**：新增、讀取、更新、刪除任務。
*   **狀態與優先級**：支援「待處理」、「進行中」、「已完成」狀態，以及「高、中、低」三種優先級。
*   **工時預估**：為每個任務設定預計工時。

### 2. AI 智慧功能 (AI Features)
*   **AI Quick Add (自然語言解析)**：你可以直接輸入「這週五中午前要完成專案報告，優先度高」。
    *   **優化**：AI 會自動生成 8 個字以內的精簡標題，並將其餘細節與原始意圖歸類至「描述」欄位。
*   **智慧排序 (AI Priority Sort)**：一鍵呼叫 AI 專家，根據截止日期、優先級與工時，為你排出最有效率的執行順序。
*   **每週總結 (AI Weekly Insights)**：AI 會分析你目前的所有任務，提供激勵人心的每週進度報告與逾期提醒。

### 3. 數據視覺化 (Dashboard)
*   **狀態分佈圖**：使用圓餅圖顯示任務完成比例。
*   **工作量分析**：使用長條圖分析不同優先級的總預計工時，幫助你平衡壓力。

## 🛠️ 技術棧

*   **後端 (Backend)**:
    *   Framework: FastAPI
    *   Database: PostgreSQL / SQLite (支援 SQLAlchemy ORM)
    *   AI Integration: **DeepSeek** (使用 OpenAI SDK 相容介面)
*   **前端 (Frontend)**:
    *   Framework: React 19 + TypeScript
    *   TypeScript: 已針對 `erasableSyntaxOnly` 優化，使用 `const` 物件與 `type` 聯集取代標準 Enum。
    *   Styling: Tailwind CSS v4
    *   Charts: Chart.js
    *   Icons: Lucide React

## 📦 安裝與啟動

### 1. 資料庫與 AI 設定
1. 安裝 PostgreSQL (或使用預設 SQLite)。
2. 修改 `backend/.env` 中的 `DEEPSEEK_API_KEY` 與 `DATABASE_URL`。

### 2. 後端啟動
```bash
cd backend
pip install -r requirements.txt
python main.py
```
後端將運行於：`http://localhost:8000`

### 3. 前端啟動
```bash
cd frontend
npm install
npm run dev
```
前端將運行於：`http://localhost:5173`

## 📝 後續優化方向 (TODO)
*   [ ] 支援 Google 帳號登入與 Google Calendar 同步。
*   [ ] 串接 Google Gemini API 作為備用 AI 模型。
*   [ ] 支援拖拽式看板 (Kanban Board) 介面。
