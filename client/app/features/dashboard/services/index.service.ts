import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type { TDashboardData } from '../types/index.type'

type TRaw = Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class DashboardService extends BaseApp<TDashboardData> {
  constructor() {
    super('admin-dashboard')
  }

  private normalizeDashboard(raw: TRaw): TDashboardData {
    const revenue = (raw.revenue ?? {}) as TRaw
    const orders = (raw.orders ?? {}) as TRaw
    const users = (raw.users ?? {}) as TRaw
    const products = (raw.products ?? {}) as TRaw
    const engagement = (raw.engagement ?? {}) as TRaw

    return {
      id: 'dashboard',
      revenue: {
        total: toNumber(revenue.total),
        today: toNumber(revenue.today),
        week: toNumber(revenue.week),
        month: toNumber(revenue.month),
        previousMonth: toNumber(revenue.previousMonth),
        monthGrowthPercent:
          revenue.monthGrowthPercent === null
            ? null
            : toNumber(revenue.monthGrowthPercent)
      },
      orders: {
        total: toNumber(orders.total),
        today: toNumber(orders.today),
        week: toNumber(orders.week),
        month: toNumber(orders.month),
        averageValue: toNumber(orders.averageValue),
        pending: toNumber(orders.pending),
        processing: toNumber(orders.processing),
        shipping: toNumber(orders.shipping),
        cancelled: toNumber(orders.cancelled),
        returned: toNumber(orders.returned),
        byStatus: Array.isArray(orders.byStatus)
          ? orders.byStatus.map((item) => {
              const row = item as TRaw
              return {
                status: row.status as TDashboardData['orders']['byStatus'][number]['status'],
                count: toNumber(row.count)
              }
            })
          : []
      },
      users: {
        total: toNumber(users.total),
        today: toNumber(users.today),
        week: toNumber(users.week),
        month: toNumber(users.month)
      },
      products: {
        total: toNumber(products.total),
        published: toNumber(products.published),
        draft: toNumber(products.draft),
        archived: toNumber(products.archived),
        inactive: toNumber(products.inactive),
        featured: toNumber(products.featured),
        lowStock: toNumber(products.lowStock),
        outOfStock: toNumber(products.outOfStock)
      },
      engagement: {
        openChats: toNumber(engagement.openChats),
        unreadChats: toNumber(engagement.unreadChats),
        activeCarts: toNumber(engagement.activeCarts),
        cartItems: toNumber(engagement.cartItems),
        comments: toNumber(engagement.comments)
      },
      revenueChart: Array.isArray(raw.revenueChart)
        ? raw.revenueChart.map((item) => {
            const row = item as TRaw
            return {
              date: String(row.date ?? ''),
              revenue: toNumber(row.revenue),
              orders: toNumber(row.orders)
            }
          })
        : [],
      recentOrders: Array.isArray(raw.recentOrders)
        ? raw.recentOrders.map((item) => {
            const row = item as TRaw
            return {
              id: String(row.id ?? ''),
              orderNumber: String(row.orderNumber ?? ''),
              status: row.status as TDashboardData['recentOrders'][number]['status'],
              paidAmount: toNumber(row.paidAmount),
              created_at: String(row.created_at ?? ''),
              customerName: String(row.customerName ?? ''),
              phone: String(row.phone ?? ''),
              itemCount: toNumber(row.itemCount)
            }
          })
        : [],
      topProducts: Array.isArray(raw.topProducts)
        ? raw.topProducts.map((item) => {
            const row = item as TRaw
            return {
              id: String(row.id ?? ''),
              name: String(row.name ?? ''),
              slug: String(row.slug ?? ''),
              soldCount: toNumber(row.soldCount),
              stock: toNumber(row.stock),
              price: toNumber(row.price),
              revenue: toNumber(row.revenue),
              image: (row.image as string | null) ?? null
            }
          })
        : [],
      lowStockProducts: Array.isArray(raw.lowStockProducts)
        ? raw.lowStockProducts.map((item) => {
            const row = item as TRaw
            return {
              id: String(row.id ?? ''),
              name: String(row.name ?? ''),
              slug: String(row.slug ?? ''),
              sku: String(row.sku ?? ''),
              stock: toNumber(row.stock),
              image: (row.image as string | null) ?? null
            }
          })
        : [],
      recentUsers: Array.isArray(raw.recentUsers)
        ? raw.recentUsers.map((item) => {
            const row = item as TRaw
            return {
              id: String(row.id ?? ''),
              fristname: String(row.fristname ?? ''),
              lastname: String(row.lastname ?? ''),
              phone: String(row.phone ?? ''),
              created_at: String(row.created_at ?? '')
            }
          })
        : [],
      generatedAt: String(raw.generatedAt ?? '')
    }
  }

  public async getDashboard(): Promise<ServerResponse<TDashboardData>> {
    return this.executeRequest<TDashboardData>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>('/admin/dashboard')
      return {
        ...response,
        data: this.normalizeDashboard(response.data ?? {})
      }
    })
  }
}
