export type TBehaviorEventType =
  | 'product_view'
  | 'gallery_view'
  | 'like'
  | 'unlike'
  | 'comment'
  | 'favorite'
  | 'unfavorite'
  | 'add_to_cart'
  | 'filter'

export interface TTrackBehaviorPayload {
  eventType: TBehaviorEventType
  productId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

export interface TAdminBehaviorProduct {
  id: string
  name: string
  slug: string
  image: string
  category?: string | null
  brand?: string | null
}

export interface TAdminBehaviorInterest {
  productId: string
  score: number
  viewCount: number
  galleryViewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  cartCount: number
  lastInteractedAt?: string | null
  product: TAdminBehaviorProduct | null
}

export interface TAdminBehaviorEvent {
  id: string
  eventType: TBehaviorEventType
  scoreDelta: number
  metadata?: Record<string, unknown> | null
  createdAt: string
  product: Pick<TAdminBehaviorProduct, 'id' | 'name' | 'slug' | 'image'> | null
}

export interface TAdminBehaviorFilter {
  id: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface TAdminUserBehaviorData {
  summary: {
    totalEvents: number
    eventTypeCounts: Array<{ eventType: TBehaviorEventType; count: number }>
    topInterests: TAdminBehaviorInterest[]
  }
  filters: TAdminBehaviorFilter[]
  events: TAdminBehaviorEvent[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
