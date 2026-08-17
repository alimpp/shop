import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { CartItemModel } from '../models/index.model'

import type { TCartItem, TCartResponse } from '../types/index.type'

interface ICartState {
  items: CartItemModel[]
  totalQuantity: number
  totalPrice: number
  itemCount: number
  loading: boolean
  submitting: boolean
  hydrated: boolean
}

const emptyTotals = () => ({
  items: [] as CartItemModel[],
  totalQuantity: 0,
  totalPrice: 0,
  itemCount: 0
})

export class CartDS extends BaseStore<ICartState> {
  private static _instance: CartDS

  public static getInstance(): CartDS {
    if (!CartDS._instance) {
      CartDS._instance = new CartDS()
    }
    return CartDS._instance
  }

  private constructor() {
    super('cart', {
      ...emptyTotals(),
      loading: false,
      submitting: false,
      hydrated: false
    })
    StoreManager.register(this)
  }

  public get getItems(): CartItemModel[] {
    return this._state.items
  }

  public get getTotalQuantity(): number {
    return this._state.totalQuantity
  }

  public get getCount(): number {
    return this._state.totalQuantity
  }

  public get getTotalPrice(): number {
    return this._state.totalPrice
  }

  public get getItemCount(): number {
    return this._state.itemCount
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getSubmitting(): boolean {
    return this._state.submitting
  }

  public get getHydrated(): boolean {
    return this._state.hydrated
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting
  }

  public setCart(cart: TCartResponse): void {
    this._state.items = (cart.items ?? []).map(item => new CartItemModel(item))
    this._state.totalQuantity = cart.totalQuantity ?? 0
    this._state.totalPrice = cart.totalPrice ?? 0
    this._state.itemCount = cart.itemCount ?? 0
    this._state.hydrated = true
  }

  public setItems(items: TCartItem[]): void {
    this._state.items = items.map(item => new CartItemModel(item))
  }

  public clearLocal(): void {
    Object.assign(this._state, {
      ...emptyTotals(),
      hydrated: true
    })
  }

  public reset(): void {
    Object.assign(this._state, {
      ...emptyTotals(),
      loading: false,
      submitting: false,
      hydrated: false
    })
  }
}

export const useCartDS = () => CartDS.getInstance()
