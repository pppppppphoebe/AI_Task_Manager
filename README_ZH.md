# AI 任務管理系統 (TaskFlow AI)

這是一個結合了 **DeepSeek AI** 與 **Google Calendar** 深度整合的現代化任務管理系統。它不僅僅是一個待辦清單，更是你的 **「AI 專案經理」**，負責幫你安排每日行程並追蹤長期進度。

## 🚀 核心功能

### 1. AI 專案經理 (每日排程器)
*   **動態時間阻斷 (Time Blocking)**：AI 會根據你今天可用的工作時數，自動將大型任務拆解為合理的每日執行區塊。
*   **情境感知排程**：自動避開 Google 日曆中的固定會議，並根據節慶或生日調整排程壓力。
*   **量化回報機制**：執行完畢後可回報進度，AI 會動態重新計算剩餘工時，優化明天的安排。

### 2. Google Calendar 深度整合 (單向同步)
*   **硬性限制同步**：即時抓取你的會議與活動，確保 AI 安排的任務不會與現實行程衝突。
*   **特殊事件偵測**：自動辨識全天事件（如生日、節日），激發 AI 產生貼心建議（如「買生日禮物」）。

### 3. 進階數據視覺化
*   **現代化日曆視圖**：全新的美術翻修，以高質感的顏色與標籤區分「任務」、「Google 行程」與「AI 排程區塊」。
*   **動態儀表板**：使用 Chart.js 即時分析任務狀態分佈與各優先級的工作量。

### 4. AI 智慧快速新增
*   支援自然語言輸入，AI 自動生成 8 個字以內的精簡標題，並將背景資訊歸類至描述欄位。

## 🛠️ 技術棧
*   **前端 (Frontend)**: React 19, TypeScript, Tailwind CSS v4, Lucide-React, Chart.js.
*   **後端 (Backend)**: FastAPI, PostgreSQL/SQLAlchemy, Pydantic v2.
*   **人工智慧 (AI)**: DeepSeek-V3 (相容 OpenAI SDK).
*   **認證 (Auth)**: Google OAuth 2.0.

## 📦 安裝與設定

### 1. Google API 設定
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 啟用 **Google Calendar API**。
3. 建立 OAuth 2.0 用戶端 ID (網頁應用程式)。
4. 設定重新導向 URI：`http://127.0.0.1:8000/auth/google/callback`。

### 2. 環境變數配置
編輯 `backend/.env`：
```env
DEEPSEEK_API_KEY="你的金鑰"
GOOGLE_CLIENT_ID="你的 Google ID"
GOOGLE_CLIENT_SECRET="你的 Google Secret"
GOOGLE_REDIRECT_URI="http://127.0.0.1:8000/auth/google/callback"
DATABASE_URL="postgresql://user:pass@localhost:5432/db_name"
```

### 3. 啟動專案
**後端：**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```


## 📝 後續優化方向 (TODO)
*   [ ] 支援 Google 帳號登入與 Google Calendar 同步。
*   [ ] 串接 Google Gemini API 作為備用 AI 模型。
*   [ ] 支援拖拽式看板 (Kanban Board) 介面。
