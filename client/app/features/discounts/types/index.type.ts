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
