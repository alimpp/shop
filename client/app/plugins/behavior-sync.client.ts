export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const token = useCookie<string | null>('token')
  if (!token.value) return

  const { syncLocalToServer } = useBehaviorTracker()
  void syncLocalToServer()
})
