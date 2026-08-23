import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TPricingListData,
  TPricingListQuery,
  TPricingProduct,
  TUpdateProductPricingPayload
} from '../types/index.type'

type TRaw = Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class PricingService extends BaseApp<TPricingProduct> {
  constructor() {
    super('admin-pricing')
  }

  private normalizeVariant(raw: TRaw) {
    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      sku: String(raw.sku ?? ''),
      price: toNumber(raw.price),
      salePrice:
        raw.salePrice === null || typeof raw.salePrice === 'undefined'
          ? null
          : toNumber(raw.salePrice),
      stock: toNumber(raw.stock),
      isActive: Boolean(raw.isActive ?? true)
    }
  }

  private normalizeProduct(raw: TRaw): TPricingProduct {
    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      sku: String(raw.sku ?? ''),
      price: toNumber(raw.price),
      salePrice:
        raw.salePrice === null || typeof raw.salePrice === 'undefined'
          ? null
          : toNumber(raw.salePrice),
      stock: toNumber(raw.stock),
      manageStock: Boolean(raw.manageStock ?? true),
      image: (raw.image as string | null) ?? null,
      variantCount: toNumber(raw.variantCount),
      variants: Array.isArray(raw.variants)
        ? raw.variants.map((item) => this.normalizeVariant(item as TRaw))
        : []
    }
  }

  public async getPricingProducts(
    query?: TPricingListQuery
  ): Promise<ServerResponse<TPricingListData>> {
    return this.executeRequest<TPricingListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/admin/products/pricing',
        query
      )
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : []

      return {
        ...response,
        data: {
          items: items.map((item: TRaw) => this.normalizeProduct(item)),
          meta: {
            total: response.data?.meta?.total ?? 0,
            page: response.data?.meta?.page ?? 1,
            limit: response.data?.meta?.limit ?? 30,
            totalPages: response.data?.meta?.totalPages ?? 0
          }
        }
      }
    })
  }

  public async updateProductPricing(
    id: string,
    payload: TUpdateProductPricingPayload
  ): Promise<ServerResponse<TPricingProduct>> {
    return this.executeRequest<TPricingProduct>(async () => {
      const response = await this.Patch<ServerResponse<TRaw>>(
        `/admin/products/pricing/${id}`,
        payload
      )

      return {
        ...response,
        data: this.normalizeProduct(response.data ?? {})
      }
    })
  }
}
