# TaskFlow AI - 系統規劃與架構文件

本文件詳細描述了 **TaskFlow AI** 的進階系統架構、資料關係以及核心工作流設計。

---

## 1. 系統整體架構圖 (System Architecture)
展示了 AI 專案經理如何整合任務資料、Google Calendar 外部資訊，並透過 DeepSeek 進行智慧排程。

```mermaid
flowchart TB
 subgraph subGraph0["前端 Frontend (Vite)"]
        Axios["Axios API Client"]
        React["React 19 - Tailwind v4"]
        CalendarUI["Calendar View / UI 美術優化"]
        TodayUI["Daily Scheduler UI"]
  end
 subgraph subGraph1["後端 Backend (Python)"]
        SQLAlchemy["SQLAlchemy / PostgreSQL"]
        FastAPI["FastAPI 核心"]
        AIService["AI Service - DeepSeek-V3"]
        GoogleService["Google Service - OAuth & Calendar"]
  end
    User(("使用者")) -- 操作介面 --> React
    React -- API 請求 --> Axios
    Axios -- REST API --> FastAPI
    
    FastAPI <-- AI 處理 --> AIService
    FastAPI <-- OAuth/同步 --> GoogleService
    FastAPI <-- ORM --> SQLAlchemy
    
    AIService <-- 智慧排程/解析 --> DeepSeek["DeepSeek-V3 API"]
    GoogleService <-- 行事曆抓取 --> GoogleAPI["Google Calendar API"]
    SQLAlchemy <-- 存取資料 --> DB[("PostgreSQL")]

    style subGraph0 fill:#FFF9C4
    style subGraph1 fill:#C8E6C9
```

---

## 2. 資料庫實體關係圖 (Entity-Relationship Diagram)
描述母專案任務與具體時間執行區塊（TimeBlock）的一對多關係，以及授權資訊儲存。

```mermaid
erDiagram
    TASK ||--o{ TIME_BLOCK : "拆解為"
    TASK {
        int id PK
        string title
        string description
        datetime deadline
        enum priority
        enum status
        float total_workload "預估總工時"
        float remaining_workload "剩餘工時 (動態更新)"
        bool is_daily
    }

    TIME_BLOCK {
        int id PK
        int task_id FK "關聯任務 (可為空)"
        string title
        date date "執行日期"
        datetime start_time "具體時間 (Google或AI建議)"
        float duration_hours "分配時數"
        enum source "system / google_calendar"
        bool is_fixed "是否鎖定不可移動"
        bool is_all_day "是否全天事件"
        string google_event_id "Google對應ID"
    }

    GOOGLE_AUTH {
        int id PK
        string access_token
        string refresh_token
        datetime expires_at
    }
```

---

## 3. 核心功能流程圖 (Feature Workflows)

### 3.1 AI 智慧每日排程 (Daily Scheduling)
結合 Google Calendar 的固定行程與資料庫的彈性任務，動態分配時間。

```mermaid
sequenceDiagram
    participant U as 使用者
    participant F as React 前端
    participant B as FastAPI 後端
    participant G as Google API
    participant AI as DeepSeek AI

    U->>F: 點擊 "Plan My Day" (輸入 8 小時)
    F->>B: POST /calendar/sync (觸發同步)
    B->>G: 抓取前後 7 天行程
    G-->>B: 回傳會議與全天事件
    B->>B: 存入 TimeBlock (is_fixed=True)
    F->>B: POST /ai/schedule/today
    B->>AI: 送出 Prompt (含 Google 會議 + 剩餘工時任務)
    AI-->>B: 回傳 JSON (避開會議並拆解大任務)
    B-->>F: 回傳今日完美行程表
    F->>U: 顯示視覺化時間軸
```

### 3.2 量化回報與動態調整 (Feedback Loop)
執行完任務後的數據回饋，這將影響隔日的 AI 判斷。

```mermaid
sequenceDiagram
    participant U as 使用者
    participant F as 前端 Modal
    participant B as 後端 API
    
    U->>F: 點擊區塊 "Complete"
    F->>U: 顯示進度滑桿與剩餘工時調整
    U->>F: 回報: "進度落後，還需 5 小時"
    F->>B: PUT /tasks/{id} (更新 remaining_workload)
    B-->>B: 更新資料庫
    Note over B,AI: 隔日 AI 排程時會發現工時增加，自動分配更多時段
```

---

## 4. 系統模組地圖 (Module Map)

*   **後端模組**:
    *   `Google Service`: 處理 OAuth 2.0 授權、Token 刷新與日曆資料解析。
    *   `AI Prompt Engine`: 基於外部 `daily_scheduler.md` (類 skill.md) 的提示詞管理。
    *   `Database Engine`: 處理 Task 與 TimeBlock 的連動與 Cascade 刪除。

*   **前端模組**:
    *   `Calendar Engine`: 高美術質感的月曆渲染與資料分發。
    *   `Schedule Controller`: 負責控制每日排程的生成、執行狀態切換與回報視窗。
    *   `Feedback Loop Component`: 處理量化數據的互動收集。

---

## 5. 開發進度與路徑 (Roadmap)
*   [x] **AI 任務解析與基本 CRUD**
*   [x] **量化剩餘工時系統**
*   [x] **Google Calendar 單向同步 (One-Way Sync)**
*   [x] **AI 動態時間阻斷排程 (Time Blocking)**
*   [x] **美術與 UI 大翻修**
*   [ ] **Google Calendar 雙向同步 (Push to GCal)**
*   [ ] **Kanban Board 看板視圖**
*   [ ] **多語系 (i18n) 完整支援**
