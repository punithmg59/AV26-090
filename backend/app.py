from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.heart_routes import router as heart_router

app = FastAPI(
    title="Healthcare AI API",
    version="1.0.0"
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

# =========================
# ROOT
# =========================

@app.get("/")
def home():
    return {
        "message": "Healthcare AI Backend Running"
    }