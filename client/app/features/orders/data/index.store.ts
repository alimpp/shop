import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { OrderModel } from '../models/index.model'
import type { TOrder, TOrderListData, TOrderListMeta } from '../types/index.type'

interface IOrdersState {
  orders: OrderModel[]
  selectedOrder: OrderModel | null
  meta: TOrderListMeta
  loading: boolean
  submitting: boolean
}

const emptyMeta = (): TOrderListMeta => ({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0
})

export class OrdersDS extends BaseStore<IOrdersState> {
  private static _instance: OrdersDS

  public static getInstance(): OrdersDS {
    if (!OrdersDS._instance) {
      OrdersDS._instance = new OrdersDS()
    }
    return OrdersDS._instance
  }

  private constructor() {
    super('orders', {
      orders: [],
      selectedOrder: null,
      meta: emptyMeta(),
      loading: false,
      submitting: false
    })
    StoreManager.register(this)
  }

  public get getOrders(): OrderModel[] {
    return this._state.orders
  }

  public get getSelectedOrder(): OrderModel | null {
    return this._state.selectedOrder
  }

  public get getMeta(): TOrderListMeta {
    return this._state.meta
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getSubmitting(): boolean {
    return this._state.submitting
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting
  }

  public setOrders(data: TOrderListData): void {
    this._state.orders = (data.items ?? []).map(item => new OrderModel(item))
    this._state.meta = { ...emptyMeta(), ...(data.meta ?? {}) }
  }

  public setSelectedOrder(order: TOrder | null): void {
    this._state.selectedOrder = order ? new OrderModel(order) : null
  }

  public upsertOrder(order: TOrder): void {
    const model = new OrderModel(order)
    const index = this._state.orders.findIndex(item => item.id === model.id)

    if (index === -1) {
      this._state.orders = [model, ...this._state.orders]
    } else {
      this._state.orders.splice(index, 1, model)
    }

    if (this._state.selectedOrder?.id === model.id) {
      this._state.selectedOrder = model
    }
  }

  public reset(): void {
    this._state.orders = []
    this._state.selectedOrder = null
    this._state.meta = emptyMeta()
    this._state.loading = false
    this._state.submitting = false
  }
}

export const useOrdersDS = () => OrdersDS.getInstance()
