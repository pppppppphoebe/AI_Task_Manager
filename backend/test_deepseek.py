from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
print(f"Checking API Key: {DEEPSEEK_API_KEY[:5]}...{DEEPSEEK_API_KEY[-5:] if DEEPSEEK_API_KEY else 'None'}")

client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

try:
    print("Sending test request to DeepSeek...")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a tester."},
            {"role": "user", "content": "Hello, are you there?"},
        ],
        stream=False
    )
    print("Connection Successful!")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print("\n--- CONNECTION ERROR ---")
    print(str(e))
    print("------------------------")
