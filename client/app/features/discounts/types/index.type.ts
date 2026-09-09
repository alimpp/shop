export interface TDiscountUsageStats {
  ordersCount: number
  totalDiscountAmount: number
  totalPaidAmount: number
  totalSubtotalAmount: number
}

export interface TDiscountCode {
  id: string
  code: string
  amount: number
  description?: string | null
  isActive: boolean
  maxUses?: number | null
  usedCount: number
  minOrderAmount?: number | null
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
  usage?: TDiscountUsageStats
}

export interface TDiscountListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TDiscountListData {
  items: TDiscountCode[]
  meta: TDiscountListMeta
}

export interface TDiscountListQuery {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface TDiscountPayload {
  code?: string
  amount: number
  description?: string
  isActive?: boolean
  maxUses?: number
  minOrderAmount?: number
  expiresAt?: string
}

export interface TValidateDiscountPayload {
  code: string
  cartTotal: number
}

export interface TValidateDiscountResult {
  id: string
  code: string
  amount: number
  discountAmount: number
  payableAmount: number
  description?: string | null
}

export interface TDiscountUsageOrder {
  id: string
  orderNumber: string
  status: string
  subtotalAmount: number
  discountAmount: number
  paidAmount: number
  createdAt: string
}

export interface TDiscountUsageDetail extends TDiscountCode {
  usage: TDiscountUsageStats
  orders: TDiscountUsageOrder[]
}

export interface TDiscountUsageReportSummary {
  codesCount: number
  totalUses: number
  totalDiscountAmount: number
  totalPaidAmount: number
  totalSubtotalAmount: number
}

export interface TDiscountUsageReport {
  summary: TDiscountUsageReportSummary
  items: TDiscountCode[]
}
