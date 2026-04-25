from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize Firebase Admin SDK
# firebase_admin.initialize_app()

from app.routers import ml
from app.routers import copilot
from app.routers import bilty
from app.routers import challan
from app.routers import trips
from app.routers import ml_extensions
from app.routers import briefing

app = FastAPI(
    title="SUPPLY_CHAIN_PROJECT API",
    description="Three-Layer Supply Chain Intelligence Platform",
    version="2.0.0"
)

# ── CORS (needed for dev; harmless in prod) ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ────────────────────────────────────────────────────────────────
app.include_router(ml.router,            prefix="/api/v1/ml",       tags=["ML — Delay Predictor"])
app.include_router(ml_extensions.router, prefix="/api/v1/ml",       tags=["ML — Extensions"])
app.include_router(copilot.router,       prefix="/api/v1/copilot",  tags=["AI Copilot"])
app.include_router(bilty.router,         prefix="/api/v1/bilty",    tags=["Layer 1 — Bilty"])
app.include_router(challan.router,       prefix="/api/v1/challan",  tags=["Layer 1 — Challan"])
app.include_router(trips.router,         prefix="/api/v1/trips",    tags=["Layer 1 — Trips"])
app.include_router(briefing.router,      prefix="/api/v1/briefing", tags=["Layer 3 — Briefing"])

# ── Auth Utilities ─────────────────────────────────────────────────────────────
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        if not firebase_admin._apps:
            return {"uid": "mock-uid", "email": "test@example.com"}
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/api/v1/protected")
async def protected_route(user=Depends(verify_token)):
    return {"message": f"Hello {user.get('email')}, you are authenticated."}

# ── Serve React Frontend (Production Build) ────────────────────────────────────
# When npm run build is run, Vite outputs to frontend/dist/
# This block serves that dist folder from FastAPI on port 8000.
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

if os.path.isdir(FRONTEND_DIST):
    # Serve all static assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str = ""):
        """
        Catch-all: serve React's index.html for all non-API routes.
        This makes React Router work correctly on page refresh.
        """
        # Only catch non-API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend not built yet. Run: npm run build")
else:
    @app.get("/")
    async def root():
        return {
            "message": "SUPPLY CHAIN COMMAND API v2.0",
            "docs": "/docs",
            "note": "Frontend not built yet. Run: npm run build inside /frontend"
        }
