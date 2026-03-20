from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print(f"Current API Key: {key[:10]}...{key[-5:] if key else 'None'}")

client = OpenAI(api_key=key)

try:
    print("Testing connection to OpenAI...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print("SUCCESS! AI Response:")
    print(response.choices[0].message.content)
except Exception as e:
    print("FAILED! Error details:")
    print(str(e))
