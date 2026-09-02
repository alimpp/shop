import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TPaymentListData,
  TPaymentListQuery,
  TPaymentTransaction,
  TUpdatePaymentStatusPayload
} from '../types/index.type'

type TRaw = Record<string, unknown>

export class PaymentsService extends BaseApp<{ id: string }> {
  constructor() {
    super('payments')
  }

  private normalize(item: TRaw): TPaymentTransaction {
    const order = item.order as Record<string, unknown> | null | undefined
    const user = item.user as Record<string, unknown> | null | undefined

    return {
      id: String(item.id ?? ''),
      trackingCode: String(item.trackingCode ?? ''),
      userId: String(item.userId ?? ''),
      orderId: (item.orderId as string | null) ?? null,
      type: (item.type as TPaymentTransaction['type']) ?? 'order',
      status: (item.status as TPaymentTransaction['status']) ?? 'unknown',
      amount: Number(item.amount ?? 0),
      gateway: (item.gateway as string | null) ?? null,
      gatewayRef: (item.gatewayRef as string | null) ?? null,
      description: (item.description as string | null) ?? null,
      metadata: (item.metadata as Record<string, unknown> | null) ?? null,
      createdAt: String(item.createdAt ?? ''),
      updatedAt: String(item.updatedAt ?? ''),
      order: order
        ? {
            id: String(order.id ?? ''),
            orderNumber: String(order.orderNumber ?? ''),
            status: String(order.status ?? ''),
            paidAmount:
              order.paidAmount == null ? undefined : Number(order.paidAmount),
            created_at: order.created_at
              ? String(order.created_at)
              : undefined
          }
        : null,
      user: user
        ? {
            id: String(user.id ?? ''),
            fristname: String(user.fristname ?? ''),
            lastname: String(user.lastname ?? ''),
            phone: String(user.phone ?? '')
          }
        : null
    }
  }

  private normalizeList(response: ServerResponse<any>): ServerResponse<TPaymentListData> {
    const items = Array.isArray(response.data?.items) ? response.data.items : []
    return {
      ...response,
      data: {
        items: items.map((item: TRaw) => this.normalize(item)),
        meta: {
          total: response.data?.meta?.total ?? 0,
          page: response.data?.meta?.page ?? 1,
          limit: response.data?.meta?.limit ?? 20,
          totalPages: response.data?.meta?.totalPages ?? 1
        }
      }
    }
  }

  public async getMyPayments(
    query?: TPaymentListQuery
  ): Promise<ServerResponse<TPaymentListData>> {
    return this.executeRequest<TPaymentListData>(async () => {
      const response = await this.Get<ServerResponse<any>>('/payments', query)
      return this.normalizeList(response)
    })
  }

  public async getMyPayment(
    id: string
  ): Promise<ServerResponse<TPaymentTransaction>> {
    return this.executeRequest<TPaymentTransaction>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>(`/payments/${id}`)
      return {
        ...response,
        data: this.normalize(response.data ?? {})
      }
    })
  }

  public async getAdminPayments(
    query?: TPaymentListQuery
  ): Promise<ServerResponse<TPaymentListData>> {
    return this.executeRequest<TPaymentListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/payments/admin',
        query
      )
      return this.normalizeList(response)
    })
  }

  public async getAdminPayment(
    id: string
  ): Promise<ServerResponse<TPaymentTransaction>> {
    return this.executeRequest<TPaymentTransaction>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>(
        `/payments/admin/${id}`
      )
      return {
        ...response,
        data: this.normalize(response.data ?? {})
      }
    })
  }

  public async updateAdminPaymentStatus(
    id: string,
    payload: TUpdatePaymentStatusPayload
  ): Promise<ServerResponse<TPaymentTransaction>> {
    return this.executeRequest<TPaymentTransaction>(async () => {
      const response = await this.Patch<ServerResponse<TRaw>>(
        `/payments/admin/${id}/status`,
        payload
      )
      return {
        ...response,
        data: this.normalize(response.data ?? {})
      }
    })
  }
}
