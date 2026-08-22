const MIN_VISIBLE_MS = 250

export function useAppLoader() {
  const count = useState('app-loader-count', () => 0)
  const visible = useState('app-loader-visible', () => false)
  const shownAt = useState('app-loader-shown-at', () => 0)

  let hideTimer: ReturnType<typeof setTimeout> | null = null

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

    const elapsed = Date.now() - shownAt.value
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)

    hideTimer = setTimeout(() => {
      if (count.value === 0) {
        visible.value = false
      }
      hideTimer = null
    }, remaining)
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
    runWithLoader,
  }
}
