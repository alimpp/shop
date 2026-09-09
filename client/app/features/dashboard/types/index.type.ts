import type { TOrderStatus } from '~/features/orders/types/index.type'

export interface TDashboardRevenue {
  total: number
  today: number
  week: number
  month: number
  previousMonth: number
  monthGrowthPercent: number | null
}

export interface TDashboardOrderStatusCount {
  status: TOrderStatus
  count: number
}

export interface TDashboardOrders {
  total: number
  today: number
  week: number
  month: number
  averageValue: number
  pending: number
  processing: number
  shipping: number
  cancelled: number
  returned: number
  byStatus: TDashboardOrderStatusCount[]
}

export interface TDashboardUsers {
  total: number
  today: number
  week: number
  month: number
}

export interface TDashboardProducts {
  total: number
  published: number
  draft: number
  archived: number
  inactive: number
  featured: number
  lowStock: number
  outOfStock: number
}

export interface TDashboardEngagement {
  openChats: number
  unreadChats: number
  activeCarts: number
  cartItems: number
  comments: number
}

export interface TDashboardChartPoint {
  date: string
  revenue: number
  orders: number
}

export interface TDashboardRecentOrder {
  id: string
  orderNumber: string
  status: TOrderStatus
  paidAmount: number
  created_at: string | Date
  customerName: string
  phone: string
  itemCount: number
}

export interface TDashboardTopProduct {
  id: string
  name: string
  slug: string
  soldCount: number
  stock: number
  price: number
  revenue: number
  image: string | null
}

export interface TDashboardLowStockProduct {
  id: string
  name: string
  slug: string
  sku: string
  stock: number
  image: string | null
}

export type TLowStockFilter = 'all' | 'low' | 'out'

export interface TLowStockItem extends TDashboardLowStockProduct {
  price: number
  status: string
  categoryName: string | null
  isOutOfStock: boolean
}

export interface TLowStockListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  threshold: number
  lowCount: number
  outCount: number
}

export interface TLowStockListData {
  items: TLowStockItem[]
  meta: TLowStockListMeta
}

export interface TLowStockListQuery {
  page?: number
  limit?: number
  filter?: TLowStockFilter
  search?: string
}

export interface TDashboardRecentUser {
  id: string
  fristname: string
  lastname: string
  phone: string
  created_at: string | Date
}

export interface TDashboardData {
  id: 'dashboard'
  revenue: TDashboardRevenue
  orders: TDashboardOrders
  users: TDashboardUsers
  products: TDashboardProducts
  engagement: TDashboardEngagement
  revenueChart: TDashboardChartPoint[]
  recentOrders: TDashboardRecentOrder[]
  topProducts: TDashboardTopProduct[]
  lowStockProducts: TDashboardLowStockProduct[]
  recentUsers: TDashboardRecentUser[]
  generatedAt: string
}
