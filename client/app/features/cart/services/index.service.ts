import type { ServerResponse } from '~/types/common'

import { BaseApp } from '~/core/BaseApp'

import type {
  TAddCartItemPayload,
  TCartItem,
  TCartResponse,
  TUpdateCartItemPayload
} from '../types/index.type'

export class CartService extends BaseApp<TCartItem> {
  constructor() {
    super('cart')
  }

  public async getCart(
    options?: { silent?: boolean },
  ): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Get<ServerResponse<TCartResponse>>('/cart', undefined, {
        silent: options?.silent,
      })
    })
  }

  public async addItem(
    payload: TAddCartItemPayload
  ): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Post<ServerResponse<TCartResponse>>(
        '/cart/items',
        payload
      )
    })
  }

  public async updateItem(
    itemId: string,
    payload: TUpdateCartItemPayload
  ): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Patch<ServerResponse<TCartResponse>>(
        `/cart/items/${itemId}`,
        payload
      )
    })
  }

  public async removeItem(
    itemId: string
  ): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Delete<ServerResponse<TCartResponse>>(
        `/cart/items/${itemId}`
      )
    })
  }

  public async clearCart(): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Delete<ServerResponse<TCartResponse>>('/cart')
    })
  }
}
