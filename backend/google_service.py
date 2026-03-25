import os
import datetime
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from models import GoogleAuth, TimeBlock, BlockSource, BlockStatus
from sqlalchemy.orm import Session
from dateutil import parser
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip().strip('"')
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip().strip('"')
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/auth/google/callback").strip().strip('"')
PROJECT_ID = CLIENT_ID.split('-')[0] if '-' in CLIENT_ID else "ai-task-manager"

print(f"DEBUG: Google Service Config:")
print(f"  - CLIENT_ID: {CLIENT_ID[:15]}...")
print(f"  - REDIRECT_URI: {REDIRECT_URI}")
print(f"  - PROJECT_ID: {PROJECT_ID}")

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

def get_flow():
    client_config = {
        "web": {
            "client_id": CLIENT_ID,
            "project_id": PROJECT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": CLIENT_SECRET,
            "redirect_uris": [REDIRECT_URI]
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

import urllib.parse

def get_google_auth_url() -> str:
    print(f"DEBUG: Manually constructing Google Auth URL with REDIRECT_URI: {REDIRECT_URI}")
    
    # 手動構建 URL，確保不包含 PKCE 的 code_challenge
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent"
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    print(f"DEBUG: Constructed Auth URL: {auth_url}")
    return auth_url

import requests

def process_google_callback(code: str, db: Session) -> bool:
    try:
        print(f"DEBUG: Manually exchanging code for token...")
        
        # 直接向 Google Token 端點發送請求
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        response = requests.post(token_url, data=data)
        token_data = response.json()
        
        if response.status_code != 200:
            print(f"DEBUG: Token exchange failed: {token_data}")
            return False
            
        print("DEBUG: Token exchanged successfully.")
        
        # Store or update the credentials in DB
        auth_record = db.query(GoogleAuth).first()
        if not auth_record:
            auth_record = GoogleAuth()
            db.add(auth_record)
            
        auth_record.access_token = token_data.get("access_token")
        if "refresh_token" in token_data:
            auth_record.refresh_token = token_data.get("refresh_token")
        
        if "expires_in" in token_data:
            auth_record.expires_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=token_data["expires_in"])
        
        db.commit()
        print("DEBUG: Successfully saved Google Auth tokens to DB.")
        return True
    except Exception as e:
        import traceback
        print(f"DEBUG: Error in process_google_callback: {str(e)}")
        print(traceback.format_exc())
        return False

def get_valid_credentials(db: Session) -> Credentials | None:
    auth_record = db.query(GoogleAuth).first()
    if not auth_record or not auth_record.access_token:
        return None
        
    creds = Credentials(
        token=auth_record.access_token,
        refresh_token=auth_record.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPES
    )
    
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Save updated token
            auth_record.access_token = creds.token
            auth_record.expires_at = creds.expiry
            db.commit()
        except Exception as e:
            print(f"Failed to refresh token: {e}")
            return None
            
    return creds

def sync_todays_calendar_events(db: Session):
    creds = get_valid_credentials(db)
    if not creds:
        return {"status": "error", "message": "Google Account not connected."}
        
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # 同步範圍擴大：從 7 天前到 7 天後，確保不會因為時區差錯過資料
        now = datetime.datetime.utcnow()
        start_range = (now - datetime.timedelta(days=7)).replace(hour=0, minute=0, second=0).isoformat() + 'Z'
        end_range = (now + datetime.timedelta(days=7)).replace(hour=23, minute=59, second=59).isoformat() + 'Z'

        print(f"DEBUG: Syncing Google Calendar from {start_range} to {end_range}")

        events_result = service.events().list(
            calendarId='primary', 
            timeMin=start_range,
            timeMax=end_range, 
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        synced_count = 0

        for event in events:
            event_id = event['id']
            summary = event.get('summary', 'Busy')
            
            # 解析日期時間
            start_raw = event['start'].get('dateTime', event['start'].get('date'))
            end_raw = event['end'].get('dateTime', event['end'].get('date'))
            is_all_day = 'date' in event['start']
            
            # 檢查是否已存在
            existing = db.query(TimeBlock).filter(TimeBlock.google_event_id == event_id).first()
            if existing:
                existing.title = summary
                if not is_all_day:
                    existing.start_time = parser.isoparse(start_raw)
                    existing.end_time = parser.isoparse(end_raw)
                    existing.date = existing.start_time.date()
                    existing.duration_hours = round((existing.end_time - existing.start_time).total_seconds() / 3600.0, 2)
                else:
                    existing.date = parser.parse(start_raw).date()
                    existing.is_all_day = True
                continue
                
            start_dt = None
            end_dt = None
            duration = 0.0
            
            if is_all_day:
                event_date = parser.parse(start_raw).date()
            else:
                start_dt = parser.isoparse(start_raw)
                end_dt = parser.isoparse(end_raw)
                event_date = start_dt.date()
                duration = round((end_dt - start_dt).total_seconds() / 3600.0, 2)
            
            new_block = TimeBlock(
                title=summary,
                date=event_date,
                start_time=start_dt,
                end_time=end_dt,
                duration_hours=duration,
                source=BlockSource.GOOGLE_CALENDAR,
                is_fixed=True,
                is_all_day=is_all_day,
                google_event_id=event_id,
                status=BlockStatus.SCHEDULED
            )
            db.add(new_block)
            synced_count += 1
            
        db.commit()
        return {"status": "success", "message": f"Synced {synced_count} events from Google Calendar."}
        
    except Exception as e:
        print(f"Error fetching calendar: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}
