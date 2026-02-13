// ════════════════════════════════════════════════════════════
// IN-MEMORY API CACHE - Fast dashboard/stats without Redis
// ════════════════════════════════════════════════════════════

const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 300, // 5 min default
  checkperiod: 60,
  useClones: false,
});

/**
 * Cache middleware for GET routes
 * @param {number} ttlSeconds - Cache TTL in seconds
 */
function cacheMiddleware(ttlSeconds = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const userId = req.user?._id?.toString() || 'anon';
    const key = `cache:${req.originalUrl}:${userId}`;

    const cached = cache.get(key);
    if (cached !== undefined) {
      return res.status(200).json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      cache.set(key, body, ttlSeconds);
      return originalJson(body);
    };
    next();
  };
}

/**
 * Invalidate cache for a user (e.g. after create/update entry)
 */
function invalidateUserCache(userId) {
  const keys = cache.keys();
  keys.forEach((k) => {
    if (k.includes(userId)) cache.del(k);
  });
}

module.exports = { cacheMiddleware, invalidateUserCache, cache };
