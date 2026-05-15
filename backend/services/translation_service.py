"""
Translation Service - Real multilingual translation using deep-translator (Google Translate).
Supports: English, Hindi, Kannada, Tamil, Telugu, Malayalam, Spanish, French, German, Arabic.
Includes caching to avoid re-translating identical text.
"""

import json
import hashlib
import logging
from functools import lru_cache
from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

# ============================
# LANGUAGE CODE MAPPING
# ============================

SUPPORTED_LANGUAGES = {
    "en": "english",
    "hi": "hindi",
    "kn": "kannada",
    "ta": "tamil",
    "te": "telugu",
    "ml": "malayalam",
    "es": "spanish",
    "fr": "french",
    "de": "german",
    "ar": "arabic",
}

# deep-translator uses ISO codes directly
LANG_CODE_MAP = {
    "en": "en",
    "hi": "hi",
    "kn": "kn",
    "ta": "ta",
    "te": "te",
    "ml": "ml",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ar": "ar",
}

# ============================
# IN-MEMORY TRANSLATION CACHE
# ============================

_translation_cache = {}
MAX_CACHE_SIZE = 500


def _cache_key(text: str, target: str) -> str:
    return hashlib.md5(f"{text}::{target}".encode()).hexdigest()


# ============================
# CORE TRANSLATION FUNCTION
# ============================

def translate_text(text: str, target_language: str) -> str:
    """
    Translate a single string from English to the target language.
    Returns original text if target is English or translation fails.
    """
    if not text or not isinstance(text, str) or not text.strip():
        return text

    # No translation needed for English
    if target_language == "en":
        return text

    # Validate target language
    target_code = LANG_CODE_MAP.get(target_language)
    if not target_code:
        logger.warning(f"[TRANSLATION] Unsupported language: {target_language}")
        return text

    # Check cache
    key = _cache_key(text, target_code)
    if key in _translation_cache:
        return _translation_cache[key]

    try:
        translator = GoogleTranslator(source="en", target=target_code)
        translated = translator.translate(text)

        if translated:
            # Store in cache (with size limit)
            if len(_translation_cache) >= MAX_CACHE_SIZE:
                # Remove oldest 100 entries
                keys_to_remove = list(_translation_cache.keys())[:100]
                for k in keys_to_remove:
                    del _translation_cache[k]

            _translation_cache[key] = translated
            logger.info(f"[TRANSLATION] Translated to {target_language}: '{text[:40]}...'")
            return translated
        else:
            return text

    except Exception as e:
        logger.error(f"[TRANSLATION] Error translating to {target_language}: {e}")
        return text  # Graceful fallback to original English text


def translate_list(items: list, target_language: str) -> list:
    """Translate a list of strings."""
    if not items or target_language == "en":
        return items
    return [translate_text(str(item), target_language) if isinstance(item, str) else item for item in items]


# ============================
# REPORT TRANSLATION
# ============================

def translate_report(report: dict, target_language: str) -> dict:
    """
    Translate an entire medical report dictionary.
    Translates all string fields and lists of strings.
    Preserves non-translatable fields (numbers, booleans, etc.)
    """
    if not report or target_language == "en":
        return report

    logger.info(f"[TRANSLATION] Translating full report to: {target_language}")

    translated = {}
    for key, value in report.items():
        if isinstance(value, str) and value.strip():
            translated[key] = translate_text(value, target_language)
        elif isinstance(value, list):
            translated[key] = translate_list(value, target_language)
        else:
            translated[key] = value

    logger.info(f"[TRANSLATION] Report translation completed for {target_language}.")
    return translated


# ============================
# STATIC UI LABELS TRANSLATION
# ============================

# Pre-defined UI labels for instant frontend rendering
UI_LABELS = {
    "clinical_diagnostic_report": "Clinical Diagnostic Report",
    "ai_analysis_complete": "AI Analysis Complete",
    "primary_diagnosis": "Primary Diagnosis",
    "ai_confidence": "AI Confidence",
    "risk_level": "Risk Level",
    "document_source": "Document Source",
    "original_scan": "Original Scan",
    "ai_heatmap": "AI Heatmap",
    "what_happened": "What Happened",
    "why_happened": "Why It Happened",
    "what_to_do_next": "What To Do Next",
    "specialist_recommendations": "Specialist Recommendations",
    "health_recommendations": "Health Recommendations",
    "tumor_location": "Tumor Location",
    "estimated_size": "Estimated Size",
    "blood_pressure": "Blood Pressure",
    "heart_rate": "Heart Rate",
    "disclaimer": "This AI-generated report is for informational purposes only and does not replace professional medical advice.",
    "dashboard": "Dashboard",
    "predictor": "Predictor",
    "brain_tumor": "Brain Tumor",
    "reports_history": "Reports History",
    "analytics": "Analytics",
    "health_tips": "Health Tips",
    "settings": "Settings",
    "disease_assessment": "Disease Assessment",
    "upload_documents": "Upload medical documents for AI-powered disease analysis",
    "predict": "Predict",
    "generating_report": "Generating Report...",
    "sign_in": "Sign In",
    "sign_out": "Sign Out",
    "my_profile": "My Profile",
    "welcome_back": "Welcome Back",
    "create_account": "Create Account",
    "low_risk": "LOW RISK",
    "moderate_risk": "MODERATE RISK",
    "high_risk": "HIGH RISK",
    "routine": "Routine",
    "moderate": "Moderate",
    "urgent": "Urgent",
    "critical": "Critical",
}

# Cache for translated UI labels per language
_ui_labels_cache = {}


def get_translated_ui_labels(target_language: str) -> dict:
    """
    Return all UI labels translated to the target language.
    Uses chunked batch translation and aggressive caching.
    """
    if target_language == "en":
        return UI_LABELS

    if target_language in _ui_labels_cache:
        return _ui_labels_cache[target_language]

    logger.info(f"[TRANSLATION] Building UI labels cache for: {target_language}")

    target_code = LANG_CODE_MAP.get(target_language)
    if not target_code:
        return UI_LABELS

    try:
        translated_labels = {}
        keys = list(UI_LABELS.keys())
        values = list(UI_LABELS.values())

        # Translate each label individually but reuse translator instance
        translator = GoogleTranslator(source="en", target=target_code)

        for i, (key, value) in enumerate(UI_LABELS.items()):
            try:
                cache_key = _cache_key(value, target_code)
                if cache_key in _translation_cache:
                    translated_labels[key] = _translation_cache[cache_key]
                else:
                    result = translator.translate(value)
                    if result:
                        translated_labels[key] = result
                        _translation_cache[cache_key] = result
                    else:
                        translated_labels[key] = value
            except Exception:
                translated_labels[key] = value  # Fallback to English

        _ui_labels_cache[target_language] = translated_labels
        logger.info(f"[TRANSLATION] UI labels cached for {target_language} ({len(translated_labels)} labels).")
        return translated_labels

    except Exception as e:
        logger.error(f"[TRANSLATION] UI label translation failed: {e}")
        return UI_LABELS


