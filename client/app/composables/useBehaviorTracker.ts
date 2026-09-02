import type { TProduct } from '~/features/products/types/index.type'
import type { TBehaviorEventType } from '~/features/behavior/types/index.type'
import { behaviorController } from '~/features/behavior/controllers/index.controller'
import { ProductsService } from '~/features/products/services/index.service'
import {
  clearLocalBehaviorData,
  getLocalFilterPreferences,
  getLocalRecentProducts,
  getLocalRecommendationSeedProducts,
  getLocalTopInterests,
  getUnsyncedLocalEvents,
  markLocalEventsSynced,
  recordLocalBehaviorEvent,
  toBehaviorProductCard,
  type TBehaviorProductCard
} from '~/features/behavior/utils/local-behavior.store'

const SESSION_KEY = 'shop_behavior_session'
const productsService = new ProductsService()

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  }
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function useBehaviorTracker() {
  const token = useCookie<string | null>('token')
  const sessionId = useState<string>('behavior-session-id', () => '')
  const syncing = useState<boolean>('behavior-syncing', () => false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function ensureSessionId(): string {
    if (sessionId.value) return sessionId.value

    if (import.meta.client) {
      const existing = localStorage.getItem(SESSION_KEY)
      if (existing) {
        sessionId.value = existing
        return existing
      }
      const created = createSessionId()
      localStorage.setItem(SESSION_KEY, created)
      sessionId.value = created
      return created
    }

    const created = createSessionId()
    sessionId.value = created
    return created
  }

  async function track(
    eventType: TBehaviorEventType,
    options?: {
      productId?: string
      metadata?: Record<string, unknown>
      product?: TProduct | TBehaviorProductCard | null
    }
  ): Promise<void> {
    if (!import.meta.client) return

    const productCard = options?.product
      ? 'description' in options.product
        ? toBehaviorProductCard(options.product as TProduct)
        : (options.product as TBehaviorProductCard)
      : null

    if (!isAuthenticated.value) {
      recordLocalBehaviorEvent({
        eventType,
        productId: options?.productId,
        metadata: options?.metadata,
        product: productCard
      })
      return
    }

    await behaviorController.trackEvent({
      eventType,
      productId: options?.productId,
      sessionId: ensureSessionId(),
      metadata: options?.metadata
    })
  }

  async function syncLocalToServer(): Promise<void> {
    if (!import.meta.client || !isAuthenticated.value || syncing.value) return

    const pending = getUnsyncedLocalEvents()
    if (!pending.length) {
      clearLocalBehaviorData()
      return
    }

    syncing.value = true
    const syncedIds: string[] = []
    const currentSessionId = ensureSessionId()

    try {
      for (const event of pending) {
        const response = await behaviorController.trackEvent({
          eventType: event.eventType,
          productId: event.productId,
          sessionId: currentSessionId,
          metadata: event.metadata
        })
        if (response.success) {
          syncedIds.push(event.id)
        }
      }

      if (syncedIds.length) {
        markLocalEventsSynced(syncedIds)
      }

      if (syncedIds.length === pending.length) {
        clearLocalBehaviorData()
      }
    } finally {
      syncing.value = false
    }
  }

  async function getRecentProducts(limit = 12): Promise<TProduct[]> {
    if (!import.meta.client) return []

    if (!isAuthenticated.value) {
      return getLocalRecentProducts(limit)
    }

    await syncLocalToServer()
    const response = await behaviorController.getRecent({
      sessionId: ensureSessionId(),
      limit
    })
    return response.success ? (response.data ?? []) : []
  }

  async function getRecommendedProducts(limit = 12): Promise<TProduct[]> {
    if (!import.meta.client) return []

    if (!isAuthenticated.value) {
      return resolveLocalRecommendations(limit)
    }

    await syncLocalToServer()
    const response = await behaviorController.getRecommendations({
      sessionId: ensureSessionId(),
      limit
    })
    return response.success ? (response.data ?? []) : []
  }

  async function resolveLocalRecommendations(limit: number): Promise<TProduct[]> {
    const seeds = getLocalTopInterests(20)
    const recent = getLocalRecentProducts(limit)
    const excludeIds = new Set(recent.map(item => item.id))
    const seedProducts = getLocalRecommendationSeedProducts(limit)

    if (!seeds.length) {
      return recent.slice(0, limit)
    }

    const categoryIds = [
      ...new Set(
        seeds
          .map(item => item.product?.categoryId || item.product?.category?.id)
          .filter((id): id is string => Boolean(id))
      ),
      ...getLocalFilterPreferences().categoryIds
    ]
    const brandIds = [
      ...new Set(
        seeds
          .map(item => item.product?.brandId || item.product?.brand?.id)
          .filter((id): id is string => Boolean(id))
      ),
      ...getLocalFilterPreferences().brandIds
    ]

    const collected: TProduct[] = []
    const seen = new Set<string>(excludeIds)

    async function pull(query: {
      categoryId?: string
      brandId?: string
      limit?: number
    }): Promise<void> {
      if (collected.length >= limit) return
      const response = await productsService.getProducts({
        ...query,
        limit: Math.max(limit * 2, 12),
        page: 1
      })
      if (!response.success || !response.data?.items?.length) return

      for (const item of response.data.items) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        collected.push(item)
        if (collected.length >= limit) break
      }
    }

    for (const categoryId of categoryIds.slice(0, 3)) {
      await pull({ categoryId })
      if (collected.length >= limit) break
    }

    if (collected.length < limit) {
      for (const brandId of brandIds.slice(0, 3)) {
        await pull({ brandId })
        if (collected.length >= limit) break
      }
    }

    if (!collected.length) {
      return seedProducts
        .filter(item => !excludeIds.has(item.id))
        .slice(0, limit)
    }

    return collected.slice(0, limit)
  }

  return {
    sessionId,
    isAuthenticated,
    ensureSessionId,
    track,
    syncLocalToServer,
    getRecentProducts,
    getRecommendedProducts
  }
}
