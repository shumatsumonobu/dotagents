/**
 * シンプルなロガーモジュール
 *
 * 構造化ログをJSON形式で出力する。
 * ログレベル: debug, info, warn, error
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function formatMessage(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

function log(level, message, meta) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

  const formatted = formatMessage(level, message, meta);
  if (level === 'error') {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
}

module.exports = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
