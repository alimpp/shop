import type { TProduct } from '../../products/types/index.type'

export type TFavoriteProduct = TProduct & { favoritedAt?: string }

export interface TFavoritesResponse {
  items: TFavoriteProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TFavoriteStatusResponse {
  favorited: boolean
}

