const MIN_VISIBLE_MS = 250

type AppLoaderApi = {
  isLoading: ComputedRef<boolean>
  start: () => void
  stop: () => void
  reset: () => void
  runWithLoader: <T>(fn: () => Promise<T>) => Promise<T>
}

let hideTimer: ReturnType<typeof setTimeout> | null = null

function scheduleHide(
  count: Ref<number>,
  visible: Ref<boolean>,
  shownAt: Ref<number>,
): void {
  if (!import.meta.client) return

  const elapsed = Date.now() - shownAt.value
  const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)

  hideTimer = setTimeout(() => {
    if (count.value === 0) {
      visible.value = false
    }
    hideTimer = null
  }, remaining)
}

function createAppLoader(
  count: Ref<number>,
  visible: Ref<boolean>,
  shownAt: Ref<number>,
): AppLoaderApi {
  const isLoading = computed(() => visible.value)

  function start(): void {
    if (!import.meta.client) return

    count.value += 1

    if (count.value === 1) {
      shownAt.value = Date.now()
      visible.value = true

      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
    }
  }

  function stop(): void {
    if (!import.meta.client) return
    if (count.value <= 0) return

    count.value -= 1

    if (count.value !== 0) return

    scheduleHide(count, visible, shownAt)
  }

  function reset(): void {
    if (!import.meta.client) return

    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }

    count.value = 0
    visible.value = false
    shownAt.value = 0
  }

  async function runWithLoader<T>(fn: () => Promise<T>): Promise<T> {
    start()

    try {
      return await fn()
    } finally {
      stop()
    }
  }

  return {
    isLoading,
    start,
    stop,
    reset,
    runWithLoader,
  }
}

export function useAppLoader(): AppLoaderApi {
  const count = useState('app-loader-count', () => 0)
  const visible = useState('app-loader-visible', () => false)
  const shownAt = useState('app-loader-shown-at', () => 0)

  return createAppLoader(count, visible, shownAt)
}

export function getAppLoader(): AppLoaderApi | null {
  const nuxtApp = tryUseNuxtApp()
  if (!nuxtApp) return null

  if (!nuxtApp._appLoader) {
    const count = useState('app-loader-count', () => 0)
    const visible = useState('app-loader-visible', () => false)
    const shownAt = useState('app-loader-shown-at', () => 0)
    nuxtApp._appLoader = createAppLoader(count, visible, shownAt)
  }

  return nuxtApp._appLoader as AppLoaderApi
}

declare module '#app' {
  interface NuxtApp {
    _appLoader?: AppLoaderApi
  }
}
