// Cache service for Gemini 2.0 Flash responses to save credits and tokens
interface CacheEntry {
  response: string;
  timestamp: number;
  hash: string;
}

const CACHE_KEY_PREFIX = 'gemini_cache_';
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

// Generate a hash for the cache key based on request parameters
export const generateCacheHash = (
  prompt: string,
  existingFiles: any[],
  envVars: Record<string, string>,
  mode: string,
  generationMode: string,
  attachments?: { data: string; mimeType: string }[]
): string => {
  const data = {
    prompt,
    files: existingFiles.map(f => ({ name: f.name, content: f.content, language: f.language })),
    envVars,
    mode,
    generationMode,
    attachments: attachments?.map(a => ({ data: a.data.substring(0, 100), mimeType: a.mimeType })) // Only hash first 100 chars of attachments
  };

  // Simple hash function for cache key
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

// Check if cache entry is still valid
const isCacheValid = (entry: CacheEntry): boolean => {
  const now = Date.now();
  const expiryTime = entry.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
  return now < expiryTime;
};

// Get cached response for Gemini 2.0 Flash
export const getCachedResponse = (hash: string): string | null => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + hash;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);

    if (!isCacheValid(entry)) {
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log('🎯 Cache hit for Gemini 2.0 Flash request');
    return entry.response;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Store response in cache for Gemini 2.0 Flash
export const setCachedResponse = (hash: string, response: string): void => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + hash;
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      hash
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log('💾 Response cached for Gemini 2.0 Flash');
  } catch (error) {
    console.error('Error storing in cache:', error);
  }
};

// Clear all expired cache entries
export const clearExpiredCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (!isCacheValid(entry)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove corrupted cache entries
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

// Get cache statistics
export const getCacheStats = (): { totalEntries: number; validEntries: number; expiredEntries: number } => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

    let validEntries = 0;
    let expiredEntries = 0;

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (isCacheValid(entry)) {
            validEntries++;
          } else {
            expiredEntries++;
          }
        }
      } catch (error) {
        expiredEntries++;
      }
    });

    return {
      totalEntries: cacheKeys.length,
      validEntries,
      expiredEntries
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
  }
};
