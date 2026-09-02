export type TOrderStatus =
  | 'pending_confirmation'
  | 'processing'
  | 'shipping'
  | 'success'
  | 'cancelled'
  | 'returned'

export const ORDER_STATUS_LABELS: Record<TOrderStatus, string> = {
  pending_confirmation: 'در انتظار تایید',
  processing: 'در حال پردازش',
  shipping: 'در حال ارسال',
  success: 'تکمیل شده',
  cancelled: 'لغو شده',
  returned: 'مرجوع شده'
}

export const ORDER_STATUS_FLOW: TOrderStatus[] = [
  'pending_confirmation',
  'processing',
  'shipping',
  'success'
]

export const ORDER_STATUS_COLORS: Record<
  TOrderStatus,
  'warning' | 'info' | 'primary' | 'success' | 'error' | 'neutral'
> = {
  pending_confirmation: 'warning',
  processing: 'info',
  shipping: 'primary',
  success: 'success',
  cancelled: 'error',
  returned: 'neutral'
}

export interface TOrderAddress {
  id: string
  name: string
  province: string
  city: string
  address: string
  postalCode: string
}

export interface TOrderSelectedOption {
  attributeId?: string
  attributeName: string
  optionValueId?: string
  attributeValueId?: string
  value: string
}

export interface TOrderVariant {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  image: string | null
  options: TOrderSelectedOption[]
}

export interface TOrderItem {
  id: string
  productId: string | null
  variantId: string | null
  productName: string
  productSlug: string
  productImage: string
  quantity: number
  unitPrice: number
  lineTotal: number
  variant: TOrderVariant | null
  selectedOptions: TOrderSelectedOption[]
}

export interface TOrderUser {
  id: string
  fristname: string
  lastname: string
  phone: string
}

export interface TOrder {
  id: string
  orderNumber: string
  userId: string
  status: TOrderStatus
  subtotalAmount: number
  discountAmount: number
  discountCode?: string | null
  discountCodeId?: string | null
  paidAmount: number
  addressId: string | null
  address: TOrderAddress
  items: TOrderItem[]
  itemCount: number
  totalQuantity: number
  payment?: {
    id: string
    trackingCode: string
    status: 'success' | 'failed' | 'unknown'
    amount: number
    createdAt: string
  } | null
  created_at: string
  updated_at: string
  user?: TOrderUser | null
}

export interface TOrderListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TOrderListData {
  items: TOrder[]
  meta: TOrderListMeta
}

export interface TOrderListQuery {
  page?: number
  limit?: number
  status?: TOrderStatus
}

export interface TCreateOrderPayload {
  addressId: string
  discountCode?: string
}

export interface TUpdateOrderStatusPayload {
  status: TOrderStatus
}
