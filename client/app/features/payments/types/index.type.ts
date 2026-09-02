export type TPaymentStatus = 'success' | 'failed' | 'unknown'
export type TPaymentType = 'order'

export const PAYMENT_STATUS_LABELS: Record<TPaymentStatus, string> = {
  success: 'موفق',
  failed: 'ناموفق',
  unknown: 'نامشخص'
}

export const PAYMENT_STATUS_COLORS: Record<
  TPaymentStatus,
  'success' | 'error' | 'warning' | 'neutral'
> = {
  success: 'success',
  failed: 'error',
  unknown: 'warning'
}

export const PAYMENT_TYPE_LABELS: Record<TPaymentType, string> = {
  order: 'پرداخت سفارش'
}

export interface TPaymentOrderRef {
  id: string
  orderNumber: string
  status: string
  paidAmount?: number
  created_at?: string
}

export interface TPaymentUserRef {
  id: string
  fristname: string
  lastname: string
  phone: string
}

export interface TPaymentTransaction {
  id: string
  trackingCode: string
  userId: string
  orderId: string | null
  type: TPaymentType
  status: TPaymentStatus
  amount: number
  gateway: string | null
  gatewayRef: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  order?: TPaymentOrderRef | null
  user?: TPaymentUserRef | null
}

export interface TPaymentListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TPaymentListData {
  items: TPaymentTransaction[]
  meta: TPaymentListMeta
}

export interface TPaymentListQuery {
  status?: TPaymentStatus
  type?: TPaymentType
  orderId?: string
  search?: string
  page?: number
  limit?: number
}

export interface TUpdatePaymentStatusPayload {
  status: TPaymentStatus
  gatewayRef?: string
  description?: string
}
