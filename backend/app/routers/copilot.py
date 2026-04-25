import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

COPILOT_SYSTEM_PROMPT = """
You are SUPPLY_CHAIN_PROJECT Copilot, an AI assistant for small Indian transport company operators.

You have access to real-time data about:
- Active trips and their risk scores
- Truck health scores and document status
- E-Way Bill validity
- Route profitability data
- Weather conditions on active routes
- Cascade risk assessments

Answer questions in simple, direct language. Operators are busy — be concise.
Always include: the problem, the impact in rupees or hours, and the recommended action.
When suggesting reroutes, mention the specific highway (NH19, NH58, etc.).
Use Indian context: mention Kanpur, Delhi, Mumbai, Agra as example cities.
Never give legal or compliance advice beyond what the system knows.

Current context will be injected as JSON before each query.
"""

class CopilotQuery(BaseModel):
    question: str
    context: dict

@router.post("/query")
async def query_copilot(query: CopilotQuery):
    if not GEMINI_API_KEY:
        # Mock response for development if API key is not provided
        return {
            "response": f"Mock Response to: {query.question}. (Please set GEMINI_API_KEY to use real AI)"
        }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    context_json = json.dumps(query.context, indent=2)
    prompt = f"Current fleet status:\n{context_json}\n\nOperator question: {query.question}\n\nRespond in 2-3 sentences max. Be direct and actionable."
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": COPILOT_SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract text from Gemini response
            if "candidates" in data and len(data["candidates"]) > 0:
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": answer}
            else:
                return {"response": "I'm sorry, I couldn't generate a response."}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
