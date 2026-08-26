import type {
  TOrder,
  TOrderAddress,
  TOrderItem,
  TOrderSelectedOption,
  TOrderStatus,
  TOrderUser,
  TOrderVariant
} from '../types/index.type'
import { ORDER_STATUS_LABELS } from '../types/index.type'
import { buildProductSelectionChips } from '~/utils/productSelection'

class OrderSelectedOptionModel implements TOrderSelectedOption {
  attributeId?: string
  attributeName: string
  optionValueId?: string
  attributeValueId?: string
  value: string

  constructor(data?: Partial<TOrderSelectedOption>) {
    this.attributeId = data?.attributeId
    this.attributeName = data?.attributeName ?? ''
    this.optionValueId = data?.optionValueId
    this.attributeValueId = data?.attributeValueId
    this.value = data?.value ?? ''
  }

  get label(): string {
    if (this.attributeName && this.value) {
      return `${this.attributeName}: ${this.value}`
    }
    return this.value
  }
}

class OrderVariantModel implements TOrderVariant {
  id: string
  name: string
  sku: string
  price: number
  salePrice: number | null
  image: string | null
  options: OrderSelectedOptionModel[]

  constructor(data?: Partial<TOrderVariant>) {
    this.id = data?.id ?? ''
    this.name = data?.name ?? ''
    this.sku = data?.sku ?? ''
    this.price = data?.price ?? 0
    this.salePrice = data?.salePrice ?? null
    this.image = data?.image ?? null
    this.options =
      data?.options?.map(option => new OrderSelectedOptionModel(option)) ?? []
  }
}

class OrderItemModel implements TOrderItem {
  id: string
  productId: string | null
  variantId: string | null
  productName: string
  productSlug: string
  productImage: string
  quantity: number
  unitPrice: number
  lineTotal: number
  variant: OrderVariantModel | null
  selectedOptions: OrderSelectedOptionModel[]

  constructor(data?: Partial<TOrderItem>) {
    this.id = data?.id ?? ''
    this.productId = data?.productId ?? null
    this.variantId = data?.variantId ?? null
    this.productName = data?.productName ?? ''
    this.productSlug = data?.productSlug ?? ''
    this.productImage = data?.productImage ?? ''
    this.quantity = data?.quantity ?? 1
    this.unitPrice = data?.unitPrice ?? 0
    this.lineTotal = data?.lineTotal ?? 0
    this.variant = data?.variant ? new OrderVariantModel(data.variant) : null
    this.selectedOptions =
      data?.selectedOptions?.map(option => new OrderSelectedOptionModel(option))
      ?? []
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
    return this.variant?.name ?? ''
  }
}

class OrderAddressModel implements TOrderAddress {
  id: string
  name: string
  province: string
  city: string
  address: string
  postalCode: string

  constructor(data?: Partial<TOrderAddress>) {
    this.id = data?.id ?? ''
    this.name = data?.name ?? ''
    this.province = data?.province ?? ''
    this.city = data?.city ?? ''
    this.address = data?.address ?? ''
    this.postalCode = data?.postalCode ?? ''
  }

  get summary(): string {
    return [this.province, this.city, this.address]
      .filter(Boolean)
      .join('، ')
  }
}

export class OrderModel implements TOrder {
  id: string
  orderNumber: string
  userId: string
  status: TOrderStatus
  paidAmount: number
  addressId: string | null
  address: OrderAddressModel
  items: OrderItemModel[]
  itemCount: number
  totalQuantity: number
  created_at: string
  updated_at: string
  user?: TOrderUser | null

  constructor(data?: Partial<TOrder>) {
    this.id = data?.id ?? ''
    this.orderNumber = data?.orderNumber ?? ''
    this.userId = data?.userId ?? ''
    this.status = data?.status ?? 'pending_confirmation'
    this.paidAmount = data?.paidAmount ?? 0
    this.addressId = data?.addressId ?? null
    this.address = new OrderAddressModel(data?.address)
    this.items = (data?.items ?? []).map(item => new OrderItemModel(item))
    this.itemCount = data?.itemCount ?? this.items.length
    this.totalQuantity =
      data?.totalQuantity
      ?? this.items.reduce((sum, item) => sum + item.quantity, 0)
    this.created_at = data?.created_at ?? ''
    this.updated_at = data?.updated_at ?? ''
    this.user = data?.user ?? null
  }

  get statusLabel(): string {
    return ORDER_STATUS_LABELS[this.status] ?? this.status
  }

  get formattedDate(): string {
    if (!this.created_at) return ''
    return new Date(this.created_at).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  get customerName(): string {
    const name = [this.user?.fristname, this.user?.lastname]
      .filter(Boolean)
      .join(' ')
    return name || this.user?.phone || ''
  }
}
