"""
Translation API Routes - Exposes translation endpoints for the frontend.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.translation_service import (
    translate_text,
    translate_report,
    get_translated_ui_labels,
    SUPPORTED_LANGUAGES,
)

router = APIRouter(prefix="/api/translate", tags=["Translation"])


# ============================
# REQUEST MODELS
# ============================

class TranslateTextRequest(BaseModel):
    text: str
    target_language: str

class TranslateReportRequest(BaseModel):
    report: dict
    target_language: str

class TranslateBatchRequest(BaseModel):
    texts: List[str]
    target_language: str


# ============================
# ENDPOINTS
# ============================

@router.get("/languages")
def get_supported_languages():
    """Return list of supported languages."""
    return {
        "languages": [
            {"code": code, "name": name}
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }


@router.post("/text")
def translate_single_text(req: TranslateTextRequest):
    """Translate a single piece of text."""
    if req.target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {req.target_language}")

    translated = translate_text(req.text, req.target_language)
    return {
        "original": req.text,
        "translated": translated,
        "language": req.target_language,
    }


@router.post("/report")
def translate_full_report(req: TranslateReportRequest):
    """Translate an entire medical report object."""
    if req.target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {req.target_language}")

    translated = translate_report(req.report, req.target_language)
    return {
        "translated_report": translated,
        "language": req.target_language,
    }


@router.post("/batch")
def translate_batch_texts(req: TranslateBatchRequest):
    """Translate a batch of texts at once."""
    if req.target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {req.target_language}")

    translated = [translate_text(t, req.target_language) for t in req.texts]
    return {
        "translated": translated,
        "language": req.target_language,
    }


@router.get("/ui-labels/{language}")
def get_ui_labels(language: str):
    """Get all pre-translated UI labels for a specific language."""
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")

    labels = get_translated_ui_labels(language)
    return {
        "labels": labels,
        "language": language,
    }
