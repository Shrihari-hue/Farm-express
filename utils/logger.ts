/* eslint-disable no-console */
import { ENV } from "@constants/config";

/** Thin logging wrapper so we can later pipe errors to Sentry/Bugsnag
 * without touching call sites, and so console noise is stripped in prod. */
const isDev = ENV.appEnv === "development";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[FarmExpress]", ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info("[FarmExpress]", ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn("[FarmExpress]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[FarmExpress]", ...args);
    // TODO: forward to a crash-reporting service in Step 15 (Production Build).
  },
};
