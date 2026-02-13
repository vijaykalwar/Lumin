// ════════════════════════════════════════════════════════════
// 🚀 AI RESPONSE CACHE
// Simple in-memory LRU cache for AI responses (performance optimization)
// ════════════════════════════════════════════════════════════

class AICache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  generateKey(prompt, context) {
    return `${prompt}-${JSON.stringify(context || {})}`;
  }

  get(prompt, context) {
    const key = this.generateKey(prompt, context);
    const cached = this.cache.get(key);
    
    if (cached) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    
    return null;
  }

  set(prompt, context, response) {
    const key = this.generateKey(prompt, context);
    
    // Remove oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

module.exports = new AICache();
