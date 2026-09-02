import type { TProduct } from '~/features/products/types/index.type'
import type { TBehaviorEventType } from '../types/index.type'

const STORAGE_KEY = 'shop_behavior_local_v1'
const MAX_EVENTS = 300
const MAX_FILTERS = 80

export const LOCAL_BEHAVIOR_SCORE_WEIGHTS: Record<TBehaviorEventType, number> = {
  product_view: 1,
  gallery_view: 2,
  like: 8,
  unlike: -8,
  comment: 10,
  favorite: 9,
  unfavorite: -9,
  add_to_cart: 12,
  filter: 0.5
}

export type TBehaviorProductCard = Pick<
  TProduct,
  | 'id'
  | 'name'
  | 'slug'
  | 'price'
  | 'salePrice'
  | 'stock'
  | 'categoryId'
  | 'brandId'
  | 'status'
  | 'visibility'
  | 'isFeatured'
  | 'isActive'
  | 'soldCount'
  | 'viewCount'
  | 'likeCount'
  | 'commentCount'
  | 'medias'
  | 'category'
  | 'brand'
  | 'createdAt'
  | 'updatedAt'
>

export interface TLocalBehaviorEvent {
  id: string
  eventType: TBehaviorEventType
  productId?: string
  scoreDelta: number
  metadata?: Record<string, unknown>
  createdAt: string
  synced: boolean
}

export interface TLocalBehaviorInterest {
  productId: string
  score: number
  viewCount: number
  galleryViewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  cartCount: number
  lastInteractedAt: string
  product?: TBehaviorProductCard | null
}

export interface TLocalBehaviorFilter {
  id: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface TLocalBehaviorState {
  version: 1
  events: TLocalBehaviorEvent[]
  interests: Record<string, TLocalBehaviorInterest>
  filters: TLocalBehaviorFilter[]
}

function emptyState(): TLocalBehaviorState {
  return {
    version: 1,
    events: [],
    interests: {},
    filters: []
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function toBehaviorProductCard(product: TProduct): TBehaviorProductCard {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    categoryId: product.categoryId,
    brandId: product.brandId,
    status: product.status,
    visibility: product.visibility,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    soldCount: product.soldCount,
    viewCount: product.viewCount,
    likeCount: product.likeCount,
    commentCount: product.commentCount,
    medias: product.medias ?? [],
    category: product.category,
    brand: product.brand,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }
}

function cardToProduct(card: TBehaviorProductCard): TProduct {
  return {
    id: card.id,
    name: card.name,
    slug: card.slug,
    description: '',
    shortDescription: '',
    sku: '',
    barcode: '',
    price: card.price,
    salePrice: card.salePrice,
    costPrice: undefined,
    stock: card.stock,
    manageStock: true,
    allowBackorder: false,
    categoryId: card.categoryId,
    brandId: card.brandId,
    status: card.status,
    visibility: card.visibility,
    isFeatured: card.isFeatured,
    isActive: card.isActive,
    soldCount: card.soldCount,
    viewCount: card.viewCount,
    likeCount: card.likeCount,
    commentCount: card.commentCount,
    publishedAt: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonical: '',
    ogImage: '',
    category: card.category,
    brand: card.brand,
    medias: card.medias ?? [],
    variants: [],
    options: [],
    productTags: [],
    createdAt: card.createdAt,
    updatedAt: card.updatedAt
  }
}

export function readLocalBehaviorState(): TLocalBehaviorState {
  if (!import.meta.client) return emptyState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as TLocalBehaviorState
    if (!parsed || parsed.version !== 1) return emptyState()
    return {
      version: 1,
      events: Array.isArray(parsed.events) ? parsed.events : [],
      interests:
        parsed.interests && typeof parsed.interests === 'object'
          ? parsed.interests
          : {},
      filters: Array.isArray(parsed.filters) ? parsed.filters : []
    }
  } catch {
    return emptyState()
  }
}

export function writeLocalBehaviorState(state: TLocalBehaviorState): void {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function upsertLocalInterest(
  state: TLocalBehaviorState,
  productId: string,
  eventType: TBehaviorEventType,
  scoreDelta: number,
  product?: TBehaviorProductCard | null
): void {
  const current = state.interests[productId] ?? {
    productId,
    score: 0,
    viewCount: 0,
    galleryViewCount: 0,
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
    cartCount: 0,
    lastInteractedAt: new Date().toISOString(),
    product: null
  }

  current.score = Math.max(0, Number((current.score + scoreDelta).toFixed(2)))
  current.lastInteractedAt = new Date().toISOString()

  if (eventType === 'product_view') current.viewCount += 1
  if (eventType === 'gallery_view') current.galleryViewCount += 1
  if (eventType === 'like') current.likeCount += 1
  if (eventType === 'unlike') {
    current.likeCount = Math.max(0, current.likeCount - 1)
  }
  if (eventType === 'comment') current.commentCount += 1
  if (eventType === 'favorite') current.favoriteCount += 1
  if (eventType === 'unfavorite') {
    current.favoriteCount = Math.max(0, current.favoriteCount - 1)
  }
  if (eventType === 'add_to_cart') current.cartCount += 1
  if (product) current.product = product

  state.interests[productId] = current
}

export function recordLocalBehaviorEvent(input: {
  eventType: TBehaviorEventType
  productId?: string
  metadata?: Record<string, unknown>
  product?: TBehaviorProductCard | null
}): TLocalBehaviorEvent {
  const state = readLocalBehaviorState()
  const scoreDelta = LOCAL_BEHAVIOR_SCORE_WEIGHTS[input.eventType] ?? 0

  const event: TLocalBehaviorEvent = {
    id: createId(),
    eventType: input.eventType,
    productId: input.productId,
    scoreDelta,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
    synced: false
  }

  state.events.unshift(event)
  if (state.events.length > MAX_EVENTS) {
    state.events = state.events.slice(0, MAX_EVENTS)
  }

  if (input.eventType === 'filter') {
    state.filters.unshift({
      id: event.id,
      createdAt: event.createdAt,
      metadata: input.metadata ?? {}
    })
    if (state.filters.length > MAX_FILTERS) {
      state.filters = state.filters.slice(0, MAX_FILTERS)
    }
  }

  if (input.productId) {
    upsertLocalInterest(
      state,
      input.productId,
      input.eventType,
      scoreDelta,
      input.product
    )
  }

  writeLocalBehaviorState(state)
  return event
}

export function getUnsyncedLocalEvents(): TLocalBehaviorEvent[] {
  return readLocalBehaviorState().events.filter(event => !event.synced).reverse()
}

export function markLocalEventsSynced(eventIds: string[]): void {
  if (!eventIds.length) return
  const state = readLocalBehaviorState()
  const idSet = new Set(eventIds)
  state.events = state.events.map(event =>
    idSet.has(event.id) ? { ...event, synced: true } : event
  )
  writeLocalBehaviorState(state)
}

export function clearLocalBehaviorData(): void {
  writeLocalBehaviorState(emptyState())
}

export function getLocalRecentProducts(limit = 12): TProduct[] {
  const state = readLocalBehaviorState()
  const seen = new Set<string>()
  const products: TProduct[] = []

  for (const event of state.events) {
    if (event.eventType !== 'product_view' || !event.productId) continue
    if (seen.has(event.productId)) continue
    const interest = state.interests[event.productId]
    if (!interest?.product) continue
    seen.add(event.productId)
    products.push(cardToProduct(interest.product))
    if (products.length >= limit) break
  }

  return products
}

export function getLocalTopInterests(limit = 20): TLocalBehaviorInterest[] {
  return Object.values(readLocalBehaviorState().interests)
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (
        new Date(b.lastInteractedAt).getTime()
        - new Date(a.lastInteractedAt).getTime()
      )
    })
    .slice(0, limit)
}

export function getLocalRecommendationSeedProducts(limit = 12): TProduct[] {
  return getLocalTopInterests(limit)
    .map(item => (item.product ? cardToProduct(item.product) : null))
    .filter((item): item is TProduct => Boolean(item))
}

export function getLocalFilterPreferences(): {
  categoryIds: string[]
  brandIds: string[]
} {
  const filters = readLocalBehaviorState().filters
  const categoryIds: string[] = []
  const brandIds: string[] = []

  for (const filter of filters) {
    const categoryId = filter.metadata?.categoryId
    const brandId = filter.metadata?.brandId
    if (typeof categoryId === 'string' && categoryId) categoryIds.push(categoryId)
    if (typeof brandId === 'string' && brandId) brandIds.push(brandId)
  }

  return {
    categoryIds: [...new Set(categoryIds)],
    brandIds: [...new Set(brandIds)]
  }
}
