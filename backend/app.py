from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.heart_routes import router as heart_router
from routes.history_routes import router as history_router
from routes.analytics_routes import router as analytics_router

app = FastAPI(
    title="Healthcare AI API",
    version="2.0.0"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTES
# =========================

app.include_router(heart_router)
app.include_router(history_router)
app.include_router(analytics_router)

# =========================
# ROOT
# =========================

@app.get("/")
def home():
    return {
        "message": "Healthcare AI Backend Running",
        "version": "2.0.0"
    }