const CACHE_PREFIX = 'pokedleplus:search:';
const TTL = 5 * 60 * 1000;
const MAX_ENTRIES = 50;

class SearchCache {
  constructor() {
    this.memoryCache = new Map();
  }

  getKey(query, mode) {
    return `${CACHE_PREFIX}${mode}:${query.toLowerCase()}`;
  }

  get(query, mode) {
    const key = this.getKey(query, mode);
    
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < TTL) {
      return memEntry.data;
    }
    
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      
      const entry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > TTL) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      this.memoryCache.set(key, entry);
      return entry.data;
    } catch {
      return null;
    }
  }

  set(query, mode, data) {
    const key = this.getKey(query, mode);
    const entry = {
      data,
      timestamp: Date.now(),
    };
    
    this.memoryCache.set(key, entry);
    
    if (this.memoryCache.size > MAX_ENTRIES) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      this.clear();
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch {}
    }
  }

  clear() {
    this.memoryCache.clear();
    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keys.push(k);
        }
      }
      keys.forEach(k => sessionStorage.removeItem(k));
    } catch {}
  }
}

export const searchCache = new SearchCache();