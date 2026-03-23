from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"嘗試連線至: {db_url.split('@')[-1] if db_url else 'None'}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ 資料庫連線成功！")
        
        # 檢查 tasks 表是否存在以及欄位
        try:
            res = conn.execute(text("SELECT is_daily FROM tasks LIMIT 1"))
            print("✅ 'is_daily' 欄位已存在。")
        except Exception as e:
            print("❌ 'is_daily' 欄位不存在，需要手動新增。")
            print(f"錯誤詳情: {e}")
            
except Exception as e:
    print("\n❌ 資料庫連線失敗！")
    print(f"錯誤詳情: {str(e)}")
    print("\n請檢查：")
    print("1. 你的 PostgreSQL 服務是否已啟動？")
    print("2. 資料庫 'ai_task_manager' 是否已建立？")
    print("3. .env 中的密碼是否正確？")
