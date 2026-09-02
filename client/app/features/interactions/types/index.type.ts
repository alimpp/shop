export enum TInteractionTargetType {
  PRODUCT = 'product',
  BLOG = 'blog'
}

export interface TLikeTogglePayload {
  entityType: TInteractionTargetType
  entityId: string
}

export interface TLikeStatusQuery {
  entityType: TInteractionTargetType
  entityId: string
}

export interface TCommentUser {
  id: string
  fristname?: string
  lastname?: string
  avatarUrl?: string
}

export interface TComment {
  id: string
  userId: string
  entityType: TInteractionTargetType
  entityId: string
  content: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  user?: TCommentUser
}

export interface TCommentPayload {
  entityType: TInteractionTargetType
  entityId: string
  content: string
}

export interface TCommentListQuery {
  entityType: TInteractionTargetType
  entityId: string
  page?: number
  limit?: number
}

export interface TCommentListData {
  items: TComment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TLikeToggleResult {
  liked: boolean
  likeCount: number
}

export interface TRatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export interface TRatingSummary {
  ratingAvg: number
  ratingCount: number
  distribution: TRatingDistribution
}

export interface TMyRating {
  score: number | null
}

export interface TUpsertRatingPayload {
  productId: string
  score: number
}

export interface TUpsertRatingResult extends TRatingSummary {
  score: number
}
