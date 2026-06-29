from openai import OpenAI
from dotenv import  load_dotenv
import os

load_dotenv()

api_key=os.getenv("OPENAI_API_KEY")


client=OpenAI(api_key=api_key)

def main():
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "What is My name?"}]
    )
    print(response.choices[0].message.content)

if __name__=="__main__":
    main()

