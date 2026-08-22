export function useTypewriter(
  text: MaybeRefOrGetter<string>,
  options?: {
    speed?: number
    delay?: number
    enabled?: MaybeRefOrGetter<boolean>
  }
) {
  const displayed = ref('')
  const isTyping = ref(false)
  const isDone = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null
  let index = 0

  function clearTimer(): void {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function start(): void {
    clearTimer()

    if (toValue(options?.enabled) === false) {
      displayed.value = toValue(text)
      isTyping.value = false
      isDone.value = true
      return
    }

    const fullText = toValue(text)
    displayed.value = ''
    isTyping.value = Boolean(fullText)
    isDone.value = !fullText
    index = 0

    const speed = options?.speed ?? 28

    const typeNext = () => {
      if (index < fullText.length) {
        displayed.value += fullText.charAt(index)
        index += 1
        timer = setTimeout(typeNext, speed)
        return
      }

      isTyping.value = false
      isDone.value = true
    }

    const delay = options?.delay ?? 200
    timer = setTimeout(typeNext, delay)
  }

  watch(
    () => [toValue(text), toValue(options?.enabled ?? true)] as const,
    () => start(),
    { immediate: true }
  )

  onUnmounted(clearTimer)

  return {
    displayed,
    isTyping,
    isDone,
    restart: start
  }
}
