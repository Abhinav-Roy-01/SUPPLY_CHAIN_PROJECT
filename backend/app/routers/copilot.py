import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = "You are a supply chain AI copilot for small Indian transport companies. Answer in 2-3 sentences. Be direct and actionable. Mention specific highways (NH19, NH58), cities (Kanpur, Delhi, Agra), and rupee amounts where relevant."

class CopilotQuery(BaseModel):
    question: str
    context: dict

@router.post("/query")
async def query_copilot(query: CopilotQuery):
    if not GEMINI_API_KEY:
        return {"response": f"Mock: {query.question} (Set GEMINI_API_KEY to use real AI)"}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

    prompt = f"{SYSTEM_PROMPT}\n\nFleet context: {json.dumps(query.context)}\n\nQuestion: {query.question}"

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                return {"response": data["candidates"][0]["content"]["parts"][0]["text"]}
            return {"response": "No response generated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))