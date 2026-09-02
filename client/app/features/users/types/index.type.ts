import type { TAddress } from '~/features/addresses/types/index.type'
import type { TCartResponse } from '~/features/cart/types/index.type'
import type { TChat } from '~/features/chat/types/index.type'
import type { TFavoriteProduct, TFavoritesResponse } from '~/features/favorites/types/index.type'
import type { TInteractionTargetType } from '~/features/interactions/types/index.type'
import type { TOrder, TOrderListData } from '~/features/orders/types/index.type'

export interface TAdminUser {
  id: string
  fristname: string
  lastname: string
  email: string
  avatarUrl: string
  phone: string
  created_at: string
}

export interface TAdminUserStats {
  orders: number
  cartItems: number
  favorites: number
  likes: number
  comments: number
  addresses: number
}

export interface TAdminUserOverview {
  user: TAdminUser
  stats: TAdminUserStats
}

export interface TAdminUserListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TAdminUserListData {
  items: TAdminUser[]
  meta: TAdminUserListMeta
}

export interface TAdminUserListQuery {
  search?: string
  page?: number
  limit?: number
}

export interface TAdminUserActivityItem {
  id: string
  entityType: TInteractionTargetType | 'product' | 'blog'
  entityId: string
  createdAt: string
  title: string
  slug: string
  image: string
  href: string
  content?: string
}

export interface TAdminUserActivityList {
  items: TAdminUserActivityItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type TAdminUserTab =
  | 'info'
  | 'cart'
  | 'orders'
  | 'likes'
  | 'comments'
  | 'favorites'
  | 'behavior'
  | 'chat'

export type { TAddress, TCartResponse, TChat, TFavoriteProduct, TFavoritesResponse, TOrder, TOrderListData }
