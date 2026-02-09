const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level}: ${message}`;
};

const info = (message, ...meta) => {
  console.info(formatMessage("INFO", message), ...meta);
};

const warn = (message, ...meta) => {
  console.warn(formatMessage("WARN", message), ...meta);
};

const error = (message, ...meta) => {
  console.error(formatMessage("ERROR", message), ...meta);
};

module.exports = {
  info,
  warn,
  error,
};
