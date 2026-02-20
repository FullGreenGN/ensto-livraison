/**
 * Simple logger wrapper.
 * Can be replaced with Winston or Pino for more advanced logging features.
 */
export const logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...optionalParams);
    }
  },
};

