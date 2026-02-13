// ════════════════════════════════════════════════════════════
// QUERY TIMEOUT - Prevent hanging MongoDB queries
// ════════════════════════════════════════════════════════════

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Run a Mongoose query with a timeout
 * @param {Promise} queryPromise - Query (e.g. Model.find().lean())
 * @param {number} timeoutMs - Max time in ms
 * @returns {Promise}
 */
function queryWithTimeout(queryPromise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    queryPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    ),
  ]);
}

module.exports = { queryWithTimeout, DEFAULT_TIMEOUT_MS };
