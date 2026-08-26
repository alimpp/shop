import type {
  TCartItem,
  TCartProductSummary,
  TCartSelectedOption,
  TCartVariantOption,
  TCartVariantSummary
} from '../types/index.type'
import { buildProductSelectionChips } from '~/utils/productSelection'

class CartSelectedOptionModel implements TCartSelectedOption {
  attributeId?: string
  attributeName: string
  optionValueId?: string
  attributeValueId?: string
  valueId?: string
  value: string

  constructor(data?: Partial<TCartSelectedOption>) {
    this.attributeId = data?.attributeId
    this.attributeName = data?.attributeName ?? ''
    this.optionValueId = data?.optionValueId
    this.attributeValueId = data?.attributeValueId
    this.valueId = data?.valueId ?? data?.attributeValueId
    this.value = data?.value ?? ''
  }

  get label(): string {
    if (this.attributeName && this.value) {
      return `${this.attributeName}: ${this.value}`
    }
    return this.value
  }
}

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
  selectedOptions: CartSelectedOptionModel[]

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
    this.selectedOptions =
      data?.selectedOptions?.map(option => new CartSelectedOptionModel(option))
      ?? []
  }

  get thumbnail(): string {
    return this.variant?.image || this.product.image || ''
  }

  get selectionChips() {
    return buildProductSelectionChips(
      {
        variant: this.variant
          ? {
              name: this.variant.name,
              sku: this.variant.sku,
              options: this.variant.options.map(option => ({
                attributeName: option.attributeName,
                value: option.value
              }))
            }
          : null,
        selectedOptions: this.selectedOptions
      },
      { includeSku: false }
    )
  }

  get optionsLabel(): string {
    const labels = this.selectionChips.map(chip => chip.label)
    if (labels.length) return labels.join(' · ')
    return this.variant?.label || ''
  }

  get variantLabel(): string {
    return this.optionsLabel
  }

  get hasVariant(): boolean {
    return Boolean(this.variantId && this.variant)
  }
}
