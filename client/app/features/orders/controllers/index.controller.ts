import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { CartDS } from '~/features/cart/data/index.store'
import { OrdersDS } from '../data/index.store'
import { OrdersService } from '../services/index.service'
import type {
  TCreateOrderPayload,
  TOrder,
  TOrderListData,
  TOrderListQuery,
  TUpdateOrderStatusPayload
} from '../types/index.type'

class OrdersController extends BaseController<OrdersService> {
  constructor() {
    super(new OrdersService())
  }

  private readonly ordersDS = OrdersDS.getInstance()
  private readonly cartDS = CartDS.getInstance()

  public async createOrder(
    payload: TCreateOrderPayload
  ): Promise<ControllerResponse<TOrder>> {
    this.ordersDS.setSubmitting(true)

    const response: ServerResponse<TOrder> =
      await this.service.createOrder(payload)

    if (response.success && response.data) {
      this.ordersDS.upsertOrder(response.data)
      this.ordersDS.setSelectedOrder(response.data)
      this.cartDS.clearLocal()
    }

    this.ordersDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async getMyOrders(
    query?: TOrderListQuery
  ): Promise<ControllerResponse<TOrderListData>> {
    this.ordersDS.setLoading(true)

    const response = await this.service.getMyOrders(query)

    if (response.success && response.data) {
      this.ordersDS.setOrders(response.data)
    }

    this.ordersDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async getMyOrder(id: string): Promise<ControllerResponse<TOrder>> {
    this.ordersDS.setLoading(true)

    const response = await this.service.getMyOrder(id)

    if (response.success && response.data) {
      this.ordersDS.setSelectedOrder(response.data)
      this.ordersDS.upsertOrder(response.data)
    } else {
      this.ordersDS.setSelectedOrder(null)
    }

    this.ordersDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async getAdminOrders(
    query?: TOrderListQuery
  ): Promise<ControllerResponse<TOrderListData>> {
    this.ordersDS.setLoading(true)

    const response = await this.service.getAdminOrders(query)

    if (response.success && response.data) {
      this.ordersDS.setOrders(response.data)
    }

    this.ordersDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async getAdminOrder(id: string): Promise<ControllerResponse<TOrder>> {
    const response = await this.service.getAdminOrder(id)

    if (response.success && response.data) {
      this.ordersDS.setSelectedOrder(response.data)
    }

    return this.handleResponse(response)
  }

  public async updateOrderStatus(
    id: string,
    payload: TUpdateOrderStatusPayload
  ): Promise<ControllerResponse<TOrder>> {
    this.ordersDS.setSubmitting(true)

    const response = await this.service.updateOrderStatus(id, payload)

    if (response.success && response.data) {
      this.ordersDS.upsertOrder(response.data)
    }

    this.ordersDS.setSubmitting(false)
    return this.handleResponse(response)
  }
}

export const ordersController = new OrdersController()
