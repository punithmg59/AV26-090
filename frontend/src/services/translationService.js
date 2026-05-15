/**
 * Translation Service - Frontend translation client.
 * Connects to the backend translation API and provides caching.
 */

import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

// In-memory cache for translated reports and UI labels
const reportCache = new Map();
const labelCache = new Map();
const textCache = new Map();

/**
 * Translate a full medical report object via the backend.
 */
export async function translateReport(report, targetLanguage) {
  if (!report || targetLanguage === 'en') return report;

  // Cache key based on report hash + language
  const cacheKey = JSON.stringify(report) + '::' + targetLanguage;
  if (reportCache.has(cacheKey)) {
    console.log('[i18n] Report cache hit for', targetLanguage);
    return reportCache.get(cacheKey);
  }

  try {
    const res = await axios.post(`${API_BASE}/api/translate/report`, {
      report,
      target_language: targetLanguage,
    }, { timeout: 30000 });

    const translated = res.data.translated_report;
    reportCache.set(cacheKey, translated);
    console.log('[i18n] Report translated to', targetLanguage);
    return translated;
  } catch (err) {
    console.error('[i18n] Report translation failed:', err.message);
    return report; // Fallback to original
  }
}

/**
 * Translate a single text string via the backend.
 */
export async function translateText(text, targetLanguage) {
  if (!text || targetLanguage === 'en') return text;

  const cacheKey = text + '::' + targetLanguage;
  if (textCache.has(cacheKey)) {
    return textCache.get(cacheKey);
  }

  try {
    const res = await axios.post(`${API_BASE}/api/translate/text`, {
      text,
      target_language: targetLanguage,
    }, { timeout: 10000 });

    const translated = res.data.translated;
    textCache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error('[i18n] Text translation failed:', err.message);
    return text;
  }
}

/**
 * Translate a batch of texts via the backend.
 */
export async function translateBatch(texts, targetLanguage) {
  if (!texts?.length || targetLanguage === 'en') return texts;

  try {
    const res = await axios.post(`${API_BASE}/api/translate/batch`, {
      texts,
      target_language: targetLanguage,
    }, { timeout: 15000 });

    return res.data.translated;
  } catch (err) {
    console.error('[i18n] Batch translation failed:', err.message);
    return texts;
  }
}

/**
 * Get pre-translated UI labels for a specific language.
 */
export async function getUILabels(targetLanguage) {
  if (targetLanguage === 'en') return null; // Use defaults

  if (labelCache.has(targetLanguage)) {
    return labelCache.get(targetLanguage);
  }

  try {
    const res = await axios.get(`${API_BASE}/api/translate/ui-labels/${targetLanguage}`, {
      timeout: 30000,
    });

    const labels = res.data.labels;
    labelCache.set(targetLanguage, labels);
    console.log('[i18n] UI labels loaded for', targetLanguage);
    return labels;
  } catch (err) {
    console.error('[i18n] UI labels fetch failed:', err.message);
    return null;
  }
}

/**
 * Clear all translation caches (useful on language change).
 */
export function clearTranslationCache() {
  reportCache.clear();
  textCache.clear();
  // Don't clear labelCache - those are expensive and stable
  console.log('[i18n] Translation cache cleared.');
}
