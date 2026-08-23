import type { TProductListMeta } from '~/features/products/types/index.type'

export interface TPricingVariant {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  stock: number
  isActive: boolean
}

export interface TPricingProduct {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  stock: number
  manageStock: boolean
  image: string | null
  variantCount: number
  variants: TPricingVariant[]
}

export interface TPricingListData {
  items: TPricingProduct[]
  meta: TProductListMeta
}

export interface TPricingListQuery {
  search?: string
  categoryId?: string
  lowStockOnly?: boolean
  page?: number
  limit?: number
}

export interface TUpdateVariantPricingPayload {
  id: string
  price?: number
  salePrice?: number | null
  stock?: number
}

export interface TUpdateProductPricingPayload {
  price?: number
  salePrice?: number | null
  stock?: number
  variants?: TUpdateVariantPricingPayload[]
}

export type TPricingSaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
