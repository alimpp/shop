export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach(() => {
    clearOverlayLocks()
    getAppLoader()?.reset()
  })
})
