import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TCreateOrderPayload,
  TOrder,
  TOrderListData,
  TOrderListQuery,
  TUpdateOrderStatusPayload
} from '../types/index.type'

type TRaw = Record<string, unknown>

export class OrdersService extends BaseApp<TOrder> {
  constructor() {
    super('orders')
  }

  private normalizeOrder(item: TRaw): TOrder {
    const address = (item.address ?? {}) as Record<string, unknown>
    const user = item.user as Record<string, unknown> | null
    const items = Array.isArray(item.items) ? item.items : []

    return {
      id: String(item.id ?? ''),
      orderNumber: String(item.orderNumber ?? ''),
      userId: String(item.userId ?? ''),
      status: (item.status as TOrder['status']) ?? 'pending_confirmation',
      subtotalAmount: Number(
        item.subtotalAmount ?? item.paidAmount ?? 0
      ),
      discountAmount: Number(item.discountAmount ?? 0),
      discountCode: (item.discountCode as string | null) ?? null,
      discountCodeId: (item.discountCodeId as string | null) ?? null,
      paidAmount: Number(item.paidAmount ?? 0),
      addressId: (item.addressId as string | null) ?? null,
      address: {
        id: String(address.id ?? ''),
        name: String(address.name ?? ''),
        province: String(address.province ?? ''),
        city: String(address.city ?? ''),
        address: String(address.address ?? ''),
        postalCode: String(address.postalCode ?? '')
      },
      items: items.map((raw) => {
        const row = raw as Record<string, unknown>
        return {
          id: String(row.id ?? ''),
          productId: (row.productId as string | null) ?? null,
          variantId: (row.variantId as string | null) ?? null,
          productName: String(row.productName ?? ''),
          productSlug: String(row.productSlug ?? ''),
          productImage: String(row.productImage ?? ''),
          quantity: Number(row.quantity ?? 1),
          unitPrice: Number(row.unitPrice ?? 0),
          lineTotal: Number(row.lineTotal ?? 0),
          variant: (row.variant as TOrder['items'][number]['variant']) ?? null,
          selectedOptions: Array.isArray(row.selectedOptions)
            ? (row.selectedOptions as TOrder['items'][number]['selectedOptions'])
            : []
        }
      }),
      itemCount: Number(item.itemCount ?? items.length),
      totalQuantity: Number(item.totalQuantity ?? 0),
      payment: item.payment
        ? (() => {
            const payment = item.payment as Record<string, unknown>
            return {
              id: String(payment.id ?? ''),
              trackingCode: String(payment.trackingCode ?? ''),
              status:
                (payment.status as 'success' | 'failed' | 'unknown')
                ?? 'unknown',
              amount: Number(payment.amount ?? 0),
              createdAt: String(payment.createdAt ?? '')
            }
          })()
        : null,
      created_at: String(item.created_at ?? ''),
      updated_at: String(item.updated_at ?? ''),
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

  public async createOrder(
    payload: TCreateOrderPayload
  ): Promise<ServerResponse<TOrder>> {
    return this.executeRequest<TOrder>(async () => {
      const response = await this.Post<ServerResponse<TRaw>>('/orders', payload)
      return {
        ...response,
        data: this.normalizeOrder(response.data ?? {})
      }
    })
  }

  public async getMyOrders(
    query?: TOrderListQuery
  ): Promise<ServerResponse<TOrderListData>> {
    return this.executeRequest<TOrderListData>(async () => {
      const response = await this.Get<ServerResponse<any>>('/orders', query)
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : []

      return {
        ...response,
        data: {
          items: items.map((item: TRaw) => this.normalizeOrder(item)),
          meta: {
            total: response.data?.meta?.total ?? 0,
            page: response.data?.meta?.page ?? 1,
            limit: response.data?.meta?.limit ?? 20,
            totalPages: response.data?.meta?.totalPages ?? 1
          }
        }
      }
    })
  }

  public async getMyOrder(id: string): Promise<ServerResponse<TOrder>> {
    return this.executeRequest<TOrder>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>(`/orders/${id}`)
      return {
        ...response,
        data: this.normalizeOrder(response.data ?? {})
      }
    })
  }

  public async getAdminOrders(
    query?: TOrderListQuery
  ): Promise<ServerResponse<TOrderListData>> {
    return this.executeRequest<TOrderListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/orders/admin',
        query
      )
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : []

      return {
        ...response,
        data: {
          items: items.map((item: TRaw) => this.normalizeOrder(item)),
          meta: {
            total: response.data?.meta?.total ?? 0,
            page: response.data?.meta?.page ?? 1,
            limit: response.data?.meta?.limit ?? 20,
            totalPages: response.data?.meta?.totalPages ?? 1
          }
        }
      }
    })
  }

  public async getAdminOrder(id: string): Promise<ServerResponse<TOrder>> {
    return this.executeRequest<TOrder>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>(
        `/orders/admin/${id}`
      )
      return {
        ...response,
        data: this.normalizeOrder(response.data ?? {})
      }
    })
  }

  public async updateOrderStatus(
    id: string,
    payload: TUpdateOrderStatusPayload
  ): Promise<ServerResponse<TOrder>> {
    return this.executeRequest<TOrder>(async () => {
      const response = await this.Patch<ServerResponse<TRaw>>(
        `/orders/admin/${id}/status`,
        payload
      )
      return {
        ...response,
        data: this.normalizeOrder(response.data ?? {})
      }
    })
  }

  public async updateMyOrderStatus(
    id: string,
    payload: TUpdateOrderStatusPayload
  ): Promise<ServerResponse<TOrder>> {
    return this.executeRequest<TOrder>(async () => {
      const response = await this.Patch<ServerResponse<TRaw>>(
        `/orders/${id}/status`,
        payload
      )
      return {
        ...response,
        data: this.normalizeOrder(response.data ?? {})
      }
    })
  }
}
