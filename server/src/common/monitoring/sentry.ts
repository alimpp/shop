/**
 * Optional Sentry bootstrap.
 * Set SENTRY_DSN to enable remote error reporting.
 */
import * as Sentry from '@sentry/node';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    sendDefaultPii: false,
  });

  initialized = true;
}

export function captureException(
  exception: unknown,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN?.trim()) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(exception);
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'error',
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN?.trim()) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureMessage(message, level);
  });
}
