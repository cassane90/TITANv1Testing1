
import { DiagnosisResult, DeviceCategory } from '../../types';

const CACHE_KEY_PREFIX = 'titan_neural_cache_';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

interface CacheEntry {
  timestamp: number;
  result: DiagnosisResult;
}

export const cacheService = {
  /**
   * Normalizes symptom descriptions to facilitate clustering.
   * "My screen is broken" -> "broken screen"
   */
  normalizeSymptoms(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove short stop words
      .sort()
      .join(' ')
      .trim();
  },

  /**
   * Generates a unique key based on device category, symptoms, and coarse location.
   * Coarse location ensures local specialist accuracy (approx 11km radius).
   */
  generateKey(category: DeviceCategory, symptoms: string, lat?: number, lng?: number): string {
    const normalized = this.normalizeSymptoms(symptoms);
    // Round to 1 decimal place (~11km precision) to preserve specialist relevance
    const locKey = lat && lng ? `_${lat.toFixed(1)}_${lng.toFixed(1)}` : '_global';
    return `${CACHE_KEY_PREFIX}${category}_${normalized}${locKey}`;
  },

  get(category: DeviceCategory, symptoms: string, lat?: number, lng?: number): DiagnosisResult | null {
    const key = this.generateKey(category, symptoms, lat, lng);
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;

    try {
      const entry: CacheEntry = JSON.parse(stored);
      const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRY_MS;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }
      
      return entry.result;
    } catch (e) {
      console.error("CACHE_READ_FAILURE", e);
      return null;
    }
  },

  set(category: DeviceCategory, symptoms: string, result: DiagnosisResult, lat?: number, lng?: number): void {
    const key = this.generateKey(category, symptoms, lat, lng);
    const entry: CacheEntry = {
      timestamp: Date.now(),
      result
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn("CACHE_WRITE_FAILURE: Local storage may be full.");
    }
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};
