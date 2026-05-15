/**
 * useTranslation Hook - Provides real-time translation capabilities to any component.
 * Automatically reacts to language changes from the global store.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import { translateReport, translateText, getUILabels, translateBatch } from '../services/translationService';

// Default English UI labels (used as fallback)
const DEFAULT_LABELS = {
  clinical_diagnostic_report: "Clinical Diagnostic Report",
  ai_analysis_complete: "AI Analysis Complete",
  primary_diagnosis: "Primary Diagnosis",
  ai_confidence: "AI Confidence",
  risk_level: "Risk Level",
  document_source: "Document Source",
  original_scan: "Original Scan",
  ai_heatmap: "AI Heatmap",
  what_happened: "What Happened",
  why_happened: "Why It Happened",
  what_to_do_next: "What To Do Next",
  specialist_recommendations: "Specialist Recommendations",
  health_recommendations: "Health Recommendations",
  tumor_location: "Tumor Location",
  estimated_size: "Estimated Size",
  blood_pressure: "Blood Pressure",
  heart_rate: "Heart Rate",
  disclaimer: "This AI-generated report is for informational purposes only and does not replace professional medical advice.",
  dashboard: "Dashboard",
  predictor: "Predictor",
  brain_tumor: "Brain Tumor",
  reports_history: "Reports History",
  analytics: "Analytics",
  health_tips: "Health Tips",
  settings: "Settings",
  disease_assessment: "Disease Assessment",
  upload_documents: "Upload medical documents for AI-powered disease analysis",
  predict: "Predict",
  generating_report: "Generating Report...",
  sign_in: "Sign In",
  sign_out: "Sign Out",
  my_profile: "My Profile",
  welcome_back: "Welcome Back",
  create_account: "Create Account",
  low_risk: "LOW RISK",
  moderate_risk: "MODERATE RISK",
  high_risk: "HIGH RISK",
  routine: "Routine",
  moderate: "Moderate",
  urgent: "Urgent",
  critical: "Critical",
};

export default function useTranslation() {
  const language = useStore((s) => s.language);
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [translating, setTranslating] = useState(false);
  const prevLangRef = useRef(language);

  // Load UI labels when language changes
  useEffect(() => {
    if (language === 'en') {
      setLabels(DEFAULT_LABELS);
      return;
    }

    let cancelled = false;

    const loadLabels = async () => {
      setTranslating(true);
      try {
        const translatedLabels = await getUILabels(language);
        if (!cancelled && translatedLabels) {
          setLabels(translatedLabels);
          console.log(`[i18n] UI labels updated for: ${language}`);
        }
      } catch (err) {
        console.error('[i18n] Failed to load UI labels:', err);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    };

    loadLabels();
    prevLangRef.current = language;

    return () => { cancelled = true; };
  }, [language]);

  /**
   * Get a UI label by key. Returns the translated version if available.
   */
  const t = useCallback((key) => {
    return labels[key] || DEFAULT_LABELS[key] || key;
  }, [labels]);

  /**
   * Translate a full report object.
   */
  const tReport = useCallback(async (report) => {
    if (language === 'en' || !report) return report;
    setTranslating(true);
    try {
      const result = await translateReport(report, language);
      return result;
    } finally {
      setTranslating(false);
    }
  }, [language]);

  /**
   * Translate a single dynamic text string.
   */
  const tText = useCallback(async (text) => {
    if (language === 'en' || !text) return text;
    try {
      return await translateText(text, language);
    } catch {
      return text;
    }
  }, [language]);

  /**
   * Translate a batch of dynamic strings.
   */
  const tBatch = useCallback(async (texts) => {
    if (language === 'en' || !texts?.length) return texts;
    try {
      return await translateBatch(texts, language);
    } catch {
      return texts;
    }
  }, [language]);

  return {
    language,
    t,           // Sync: UI labels by key
    tReport,     // Async: translate full report
    tText,       // Async: translate single text
    tBatch,      // Async: translate array of texts
    translating, // Boolean: is a translation in progress
    isEnglish: language === 'en',
  };
}
