import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { CartDS } from '../data/index.store'
import { CartService } from '../services/index.service'

import type {
  TAddCartItemPayload,
  TCartResponse,
  TUpdateCartItemPayload
} from '../types/index.type'

class CartController extends BaseController<CartService> {
  constructor() {
    super(new CartService())
  }

  private readonly cartDS = CartDS.getInstance()

  public async getCart(
    options?: { silent?: boolean },
  ): Promise<ControllerResponse<TCartResponse>> {
    if (!options?.silent) {
      this.cartDS.setLoading(true)
    }

    const response: ServerResponse<TCartResponse> =
      await this.service.getCart(options)

    if (response.success && response.data) {
      this.cartDS.setCart(response.data)
    }

    if (!options?.silent) {
      this.cartDS.setLoading(false)
    }
    return this.handleResponse(response)
  }

  public async addItem(
    payload: TAddCartItemPayload
  ): Promise<ControllerResponse<TCartResponse>> {
    this.cartDS.setSubmitting(true)

    const response: ServerResponse<TCartResponse> =
      await this.service.addItem(payload)

    if (response.success && response.data) {
      this.cartDS.setCart(response.data)
    }

    this.cartDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async updateItem(
    itemId: string,
    payload: TUpdateCartItemPayload
  ): Promise<ControllerResponse<TCartResponse>> {
    this.cartDS.setSubmitting(true)

    const response: ServerResponse<TCartResponse> =
      await this.service.updateItem(itemId, payload)

    if (response.success && response.data) {
      this.cartDS.setCart(response.data)
    }

    this.cartDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async removeItem(
    itemId: string
  ): Promise<ControllerResponse<TCartResponse>> {
    this.cartDS.setSubmitting(true)

    const response: ServerResponse<TCartResponse> =
      await this.service.removeItem(itemId)

    if (response.success && response.data) {
      this.cartDS.setCart(response.data)
    }

    this.cartDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async clearCart(): Promise<ControllerResponse<TCartResponse>> {
    this.cartDS.setSubmitting(true)

    const response: ServerResponse<TCartResponse> =
      await this.service.clearCart()

    if (response.success) {
      this.cartDS.clearLocal()
    }

    this.cartDS.setSubmitting(false)
    return this.handleResponse(response)
  }
}

export const cartController = new CartController()
