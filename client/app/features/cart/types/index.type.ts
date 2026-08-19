export interface TCartSelectedOption {
  attributeId?: string
  attributeName: string
  optionValueId?: string
  attributeValueId?: string
  valueId?: string
  value: string
}

export interface TCartVariantOption {
  attributeId?: string
  attributeName: string
  valueId?: string
  value: string
}

export interface TCartProductSummary {
  id: string
  name: string
  slug: string
  image: string
}

export interface TCartVariantSummary {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  stock: number
  image: string | null
  options: TCartVariantOption[]
}

export interface TCartItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  created_at: string
  updated_at: string
  product: TCartProductSummary
  variant: TCartVariantSummary | null
  selectedOptions: TCartSelectedOption[]
}

export interface TCartResponse {
  items: TCartItem[]
  totalQuantity: number
  totalPrice: number
  itemCount: number
}

export interface TAddCartItemPayload {
  productId: string
  variantId?: string
  selectedOptions?: Array<{ optionValueId: string }>
  quantity: number
}

export interface TUpdateCartItemPayload {
  quantity: number
}
