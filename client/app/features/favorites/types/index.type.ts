import type { TProduct } from '../../products/types/index.type'

export interface TFavoritesResponse {
  items: TFavoriteItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TFavoriteItem {
  id: string
  favoritedAt?: string
  [key: string]: unknown
}

export interface TFavoriteStatusResponse {
  favorited: boolean
}

export type TFavoriteProduct = TProduct & { favoritedAt?: string }
