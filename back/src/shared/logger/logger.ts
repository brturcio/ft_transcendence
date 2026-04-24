type LogLevel = "debug" | "info" | "warn" | "error";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[configuredLevel];
}

function toLogLine(level: LogLevel, message: string, metadata?: unknown): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata: metadata ?? null,
  });
}

export const logger = {
  debug(message: string, metadata?: unknown) {
    if (shouldLog("debug")) {
      console.debug(toLogLine("debug", message, metadata));
    }
  },
  info(message: string, metadata?: unknown) {
    if (shouldLog("info")) {
      console.info(toLogLine("info", message, metadata));
    }
  },
  warn(message: string, metadata?: unknown) {
    if (shouldLog("warn")) {
      console.warn(toLogLine("warn", message, metadata));
    }
  },
  error(message: string, metadata?: unknown) {
    if (shouldLog("error")) {
      console.error(toLogLine("error", message, metadata));
    }
  },
};
