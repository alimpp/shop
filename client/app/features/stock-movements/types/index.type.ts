export type TStockMovementReason =
  | 'order_placed'
  | 'order_cancelled'
  | 'order_returned'
  | 'order_restocked'
  | 'admin_update'
  | 'admin_pricing'

export type TStockMovementActorType = 'system' | 'admin' | 'user'

export interface TStockMovement {
  id: string
  productId?: string | null
  variantId?: string | null
  orderId?: string | null
  productName?: string | null
  variantName?: string | null
  quantityChange: number
  stockBefore: number
  stockAfter: number
  reason: TStockMovementReason
  reasonLabel: string
  actorType: TStockMovementActorType
  actorLabel: string
  actorId?: string | null
  note?: string | null
  createdAt: string
}

export interface TStockMovementListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TStockMovementListData {
  items: TStockMovement[]
  meta: TStockMovementListMeta
}

export interface TStockMovementListQuery {
  page?: number
  limit?: number
  productId?: string
  variantId?: string
  orderId?: string
  reason?: TStockMovementReason
  search?: string
}
