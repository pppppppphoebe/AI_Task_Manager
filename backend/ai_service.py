from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from schemas import AIParsedTask
from models import Priority, Status
from typing import List
import datetime

load_dotenv()

# DeepSeek API config
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# 使用 DeepSeek 的模型 (deepseek-chat 或 deepseek-reasoner)
AI_MODEL = "deepseek-chat"

def parse_task_from_text(text: str) -> AIParsedTask:
    """Parse natural language text into a task object."""
    try:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        prompt = f"""
        Current time: {now}
        Parse the following user input into a JSON object representing a task: "{text}"
        The JSON should have:
        - title: (string)
        - description: (string or null)
        - deadline: (ISO format datetime string or null)
        - priority: (One of: High, Medium, Low)
        - workload: (estimated hours as integer, default to 1)

        Output ONLY the JSON object.
        """
        
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[{"role": "system", "content": "You are a task management assistant."},
                      {"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        return AIParsedTask(**data)
    except Exception as e:
        print(f"ERROR in AI Service (DeepSeek): {str(e)}")
        raise e

def get_priority_sorting(tasks: List[dict]) -> List[int]:
    """Get optimized task IDs based on deadline and priority."""
    prompt = f"""
    Given the following list of tasks, return the task IDs in the order they should be completed to maximize efficiency and meet deadlines.
    Tasks: {json.dumps(tasks)}
    Output ONLY a JSON list of task IDs.
    """
    
    response = client.chat.completions.create(
        model=AI_MODEL,
        messages=[{"role": "system", "content": "You are a productivity expert."},
                  {"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    
    data = json.loads(response.choices[0].message.content)
    # Expecting {"task_ids": [1, 3, 2]}
    return data.get("task_ids", [])

def get_weekly_summary(tasks: List[dict]) -> str:
    """Generate a summary of task completion."""
    prompt = f"""
    Analyze the following task list and provide a short, motivating weekly summary.
    Highlight completed tasks vs pending tasks, and warn about any missed deadlines.
    Tasks: {json.dumps(tasks)}
    """
    
    response = client.chat.completions.create(
        model=AI_MODEL,
        messages=[{"role": "system", "content": "You are a helpful assistant providing weekly productivity reports."},
                  {"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
