export function reportLovableError(error: Error, meta?: Record<string, unknown>) {
  // Lightweight error reporting shim used during builds/deploys.
  // Replace with real telemetry (Sentry, LogRocket, etc.) if desired.
  try {
    // Keep errors visible in server logs
    // eslint-disable-next-line no-console
    console.error("[lovable]", error?.message || error, meta || {});
  } catch (e) {
    // swallow to avoid throwing from the error reporter
  }
}
