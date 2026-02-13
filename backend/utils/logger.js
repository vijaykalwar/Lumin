// ════════════════════════════════════════════════════════════
// SIMPLE ERROR LOGGER - No external deps, file + console
// ════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function formatMessage(level, message, meta = {}) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  return JSON.stringify(entry) + '\n';
}

function writeToFile(filename, data) {
  const filepath = path.join(logsDir, filename);
  try {
    fs.appendFileSync(filepath, data);
  } catch (e) {
    console.error('Logger write failed:', e.message);
  }
}

const logger = {
  info(msg, meta = {}) {
    const data = formatMessage('info', msg, meta);
    if (process.env.NODE_ENV !== 'production') console.log('[INFO]', msg, meta);
    writeToFile('combined.log', data);
  },
  error(msg, meta = {}) {
    const data = formatMessage('error', msg, meta);
    console.error('[ERROR]', msg, meta);
    writeToFile('error.log', data);
    writeToFile('combined.log', data);
  },
  warn(msg, meta = {}) {
    const data = formatMessage('warn', msg, meta);
    console.warn('[WARN]', msg, meta);
    writeToFile('combined.log', data);
  },
};

module.exports = logger;
