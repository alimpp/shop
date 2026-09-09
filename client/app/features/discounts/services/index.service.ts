import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TDiscountCode,
  TDiscountListData,
  TDiscountListQuery,
  TDiscountPayload,
  TDiscountUsageDetail,
  TDiscountUsageReport,
  TValidateDiscountPayload,
  TValidateDiscountResult
} from '../types/index.type'

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeUsage(raw: Record<string, unknown> | undefined) {
  return {
    ordersCount: toNumber(raw?.ordersCount),
    totalDiscountAmount: toNumber(raw?.totalDiscountAmount),
    totalPaidAmount: toNumber(raw?.totalPaidAmount),
    totalSubtotalAmount: toNumber(raw?.totalSubtotalAmount)
  }
}

function normalizeDiscount(raw: Record<string, unknown>): TDiscountCode {
  return {
    id: String(raw.id ?? ''),
    code: String(raw.code ?? ''),
    amount: toNumber(raw.amount),
    description: (raw.description as string | null) ?? null,
    isActive: Boolean(raw.isActive),
    maxUses: raw.maxUses == null ? null : toNumber(raw.maxUses),
    usedCount: toNumber(raw.usedCount),
    minOrderAmount:
      raw.minOrderAmount == null ? null : toNumber(raw.minOrderAmount),
    expiresAt: (raw.expiresAt as string | null) ?? null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    usage: normalizeUsage(raw.usage as Record<string, unknown> | undefined)
  }
}

export class DiscountsService extends BaseApp<{ id: string }> {
  constructor() {
    super('discounts')
  }

  public async validate(
    payload: TValidateDiscountPayload
  ): Promise<ServerResponse<TValidateDiscountResult>> {
    return this.executeRequest<TValidateDiscountResult>(async () => {
      return this.Post<ServerResponse<TValidateDiscountResult>>(
        '/discounts/validate',
        payload
      )
    })
  }

  public async getDiscounts(
    query?: TDiscountListQuery
  ): Promise<ServerResponse<TDiscountListData>> {
    return this.executeRequest<TDiscountListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/discounts',
        query as Record<string, unknown>
      )
      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items)
            ? response.data.items.map((item: Record<string, unknown>) =>
                normalizeDiscount(item)
              )
            : [],
          meta: {
            total: toNumber(response.data?.meta?.total),
            page: toNumber(response.data?.meta?.page, 1),
            limit: toNumber(response.data?.meta?.limit, 20),
            totalPages: toNumber(response.data?.meta?.totalPages, 1)
          }
        }
      }
    })
  }

  public async getUsageReport(): Promise<ServerResponse<TDiscountUsageReport>> {
    return this.executeRequest<TDiscountUsageReport>(async () => {
      const response = await this.Get<ServerResponse<any>>('/discounts/report')
      const summary = (response.data?.summary ?? {}) as Record<string, unknown>
      return {
        ...response,
        data: {
          summary: {
            codesCount: toNumber(summary.codesCount),
            totalUses: toNumber(summary.totalUses),
            totalDiscountAmount: toNumber(summary.totalDiscountAmount),
            totalPaidAmount: toNumber(summary.totalPaidAmount),
            totalSubtotalAmount: toNumber(summary.totalSubtotalAmount)
          },
          items: Array.isArray(response.data?.items)
            ? response.data.items.map((item: Record<string, unknown>) =>
                normalizeDiscount(item)
              )
            : []
        }
      }
    })
  }

  public async getUsageDetail(
    id: string
  ): Promise<ServerResponse<TDiscountUsageDetail>> {
    return this.executeRequest<TDiscountUsageDetail>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        `/discounts/${id}/usage`
      )
      const raw = (response.data ?? {}) as Record<string, unknown>
      return {
        ...response,
        data: {
          ...normalizeDiscount(raw),
          usage: normalizeUsage(raw.usage as Record<string, unknown>),
          orders: Array.isArray(raw.orders)
            ? raw.orders.map((order: Record<string, unknown>) => ({
                id: String(order.id ?? ''),
                orderNumber: String(order.orderNumber ?? ''),
                status: String(order.status ?? ''),
                subtotalAmount: toNumber(order.subtotalAmount),
                discountAmount: toNumber(order.discountAmount),
                paidAmount: toNumber(order.paidAmount),
                createdAt: String(order.createdAt ?? '')
              }))
            : []
        }
      }
    })
  }

  public async createDiscount(
    payload: TDiscountPayload
  ): Promise<ServerResponse<TDiscountCode>> {
    return this.executeRequest<TDiscountCode>(async () => {
      return this.Post<ServerResponse<TDiscountCode>>('/discounts', payload)
    })
  }

  public async updateDiscount(
    id: string,
    payload: TDiscountPayload
  ): Promise<ServerResponse<TDiscountCode>> {
    return this.executeRequest<TDiscountCode>(async () => {
      return this.Patch<ServerResponse<TDiscountCode>>(
        `/discounts/${id}`,
        payload
      )
    })
  }

  public async deleteDiscount(
    id: string
  ): Promise<ServerResponse<{ id: string; deleted: boolean }>> {
    return this.executeRequest<{ id: string; deleted: boolean }>(async () => {
      return this.Delete<ServerResponse<{ id: string; deleted: boolean }>>(
        `/discounts/${id}`
      )
    })
  }
}
