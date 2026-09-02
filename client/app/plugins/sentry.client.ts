export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = String(config.public.sentryDsn || '').trim()
  if (!dsn || !import.meta.client) return

  let Sentry: typeof import('@sentry/vue') | null = null

  try {
    Sentry = await import('@sentry/vue')
  } catch {
    console.warn('[sentry] @sentry/vue is not installed yet')
    return
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(config.public.sentryTracesSampleRate ?? 0.1)
  })

  nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
    Sentry?.captureException(error, {
      extra: { info }
    })
  }

  window.addEventListener('unhandledrejection', (event) => {
    Sentry?.captureException(event.reason)
  })
})
