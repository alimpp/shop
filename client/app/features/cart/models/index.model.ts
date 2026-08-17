import type {
  TCartItem,
  TCartProductSummary,
  TCartVariantOption,
  TCartVariantSummary
} from '../types/index.type'

class CartVariantOptionModel implements TCartVariantOption {
  attributeId?: string
  attributeName: string
  valueId?: string
  value: string

  constructor(data?: Partial<TCartVariantOption>) {
    this.attributeId = data?.attributeId
    this.attributeName = data?.attributeName ?? ''
    this.valueId = data?.valueId
    this.value = data?.value ?? ''
  }
}

class CartProductSummaryModel implements TCartProductSummary {
  id: string
  name: string
  slug: string
  image: string

  constructor(data?: Partial<TCartProductSummary>) {
    this.id = data?.id ?? ''
    this.name = data?.name ?? ''
    this.slug = data?.slug ?? ''
    this.image = data?.image ?? ''
  }
}

class CartVariantSummaryModel implements TCartVariantSummary {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  stock: number
  image: string | null
  options: CartVariantOptionModel[]

  constructor(data?: Partial<TCartVariantSummary>) {
    this.id = data?.id ?? ''
    this.name = data?.name ?? ''
    this.sku = data?.sku ?? ''
    this.price = data?.price ?? 0
    this.salePrice = data?.salePrice ?? null
    this.stock = data?.stock ?? 0
    this.image = data?.image ?? null
    this.options =
      data?.options?.map(option => new CartVariantOptionModel(option)) ?? []
  }

  get label(): string {
    const parts = this.options
      .filter(option => option.value)
      .map(option =>
        option.attributeName
          ? `${option.attributeName}: ${option.value}`
          : option.value
      )

    if (parts.length) return parts.join(' · ')
    return this.name || ''
  }
}

export class CartItemModel implements TCartItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
  created_at: string
  updated_at: string
  product: CartProductSummaryModel
  variant: CartVariantSummaryModel | null

  constructor(data?: Partial<TCartItem>) {
    this.id = data?.id ?? ''
    this.productId = data?.productId ?? ''
    this.variantId = data?.variantId ?? null
    this.quantity = data?.quantity ?? 1
    this.unitPrice = data?.unitPrice ?? 0
    this.lineTotal = data?.lineTotal ?? 0
    this.created_at = data?.created_at ?? ''
    this.updated_at = data?.updated_at ?? ''
    this.product = new CartProductSummaryModel(data?.product)
    this.variant = data?.variant
      ? new CartVariantSummaryModel(data.variant)
      : null
  }

  get thumbnail(): string {
    return this.variant?.image || this.product.image || ''
  }

  get variantLabel(): string {
    return this.variant?.label || ''
  }

  get hasVariant(): boolean {
    return Boolean(this.variantId && this.variant)
  }
}
