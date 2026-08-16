import { reactive } from 'vue'

import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'

export interface TCartItem {
  productId: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string
  quantity: number
}

interface ICartState {
  items: TCartItem[]
}

const STORAGE_KEY = 'cart-items'

function loadFromStorage(): TCartItem[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TCartItem[]) : []
  } catch {
    return []
  }
}

class CartDS extends BaseStore<ICartState> {
  private static _instance: CartDS

  public static getInstance(): CartDS {
    if (!CartDS._instance) {
      CartDS._instance = new CartDS()
    }
    return CartDS._instance
  }

  private constructor() {
    super(
      'cart',
      reactive({
        items: loadFromStorage()
      }) as ICartState
    )
    StoreManager.register(this)
  }

  public get getItems(): TCartItem[] {
    return this._state.items
  }

  public get getCount(): number {
    return this._state.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  public get getTotal(): number {
    return this._state.items.reduce(
      (sum, item) => sum + item.quantity * (item.salePrice ?? item.price),
      0
    )
  }

  private persist(): void {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state.items))
    }
  }

  public add(item: TCartItem): void {
    const existing = this._state.items.find(
      cartItem => cartItem.productId === item.productId
    )

    if (existing) {
      existing.quantity += item.quantity
    } else {
      this._state.items.push({ ...item })
    }

    this.persist()
  }

  public updateQuantity(productId: string, quantity: number): void {
    const item = this._state.items.find(
      cartItem => cartItem.productId === productId
    )

    if (!item) return

    item.quantity = Math.max(1, quantity)
    this.persist()
  }

  public remove(productId: string): void {
    const index = this._state.items.findIndex(
      cartItem => cartItem.productId === productId
    )

    if (index !== -1) {
      this._state.items.splice(index, 1)
      this.persist()
    }
  }

  public clear(): void {
    this._state.items = []
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  public reset(): void {
    this.clear()
  }
}

export const useCartDS = () => CartDS.getInstance()
