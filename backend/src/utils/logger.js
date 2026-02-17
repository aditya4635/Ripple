const LogLevel = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
});

const currentLevel =
  process.env.LOG_LEVEL?.toUpperCase() === "DEBUG"
    ? LogLevel.DEBUG
    : LogLevel.INFO;

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

const logger = {
  debug(message, meta) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  info(message, meta) {
    if (currentLevel <= LogLevel.INFO) {
      console.info(formatMessage("INFO", message, meta));
    }
  },

  warn(message, meta) {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  error(message, error) {
    if (currentLevel <= LogLevel.ERROR) {
      const meta = error
        ? { message: error.message, stack: error.stack }
        : undefined;
      console.error(formatMessage("ERROR", message, meta));
    }
  },
};

export default logger;
