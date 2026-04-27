from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routers import ml, copilot, bilty, challan, trips, ml_extensions, briefing

app = FastAPI(title="SUPPLY_CHAIN_PROJECT API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml.router,            prefix="/api/v1/ml",       tags=["ML"])
app.include_router(ml_extensions.router, prefix="/api/v1/ml",       tags=["ML Extensions"])
app.include_router(copilot.router,       prefix="/api/v1/copilot",  tags=["AI Copilot"])
app.include_router(bilty.router,         prefix="/api/v1/bilty",    tags=["Bilty"])
app.include_router(challan.router,       prefix="/api/v1/challan",  tags=["Challan"])
app.include_router(trips.router,         prefix="/api/v1/trips",    tags=["Trips"])
app.include_router(briefing.router,      prefix="/api/v1/briefing", tags=["Briefing"])

@app.get("/")
async def root():
    return {"message": "SUPPLY CHAIN COMMAND API v2.0", "docs": "/docs"}
