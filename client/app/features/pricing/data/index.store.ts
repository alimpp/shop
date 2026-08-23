import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import type { TProductListMeta } from '~/features/products/types/index.type'
import type { TPricingProduct } from '../types/index.type'

interface IPricingState {
  items: TPricingProduct[]
  meta: TProductListMeta
  loading: boolean
  savingIds: string[]
}

const emptyMeta = (): TProductListMeta => ({
  total: 0,
  page: 1,
  limit: 30,
  totalPages: 0
})

export class PricingDS extends BaseStore<IPricingState> {
  private static _instance: PricingDS

  public static getInstance(): PricingDS {
    if (!PricingDS._instance) {
      PricingDS._instance = new PricingDS()
    }
    return PricingDS._instance
  }

  private constructor() {
    super('admin-pricing', {
      items: [],
      meta: emptyMeta(),
      loading: false,
      savingIds: []
    })
    StoreManager.register(this)
  }

  public get getItems(): TPricingProduct[] {
    return this._state.items
  }

  public get getMeta(): TProductListMeta {
    return this._state.meta
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getSavingIds(): string[] {
    return this._state.savingIds
  }

  public isSaving(id: string): boolean {
    return this._state.savingIds.includes(id)
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setItems(items: TPricingProduct[], meta?: Partial<TProductListMeta>): void {
    this._state.items = items
    this._state.meta = { ...emptyMeta(), ...(meta ?? {}) }
  }

  public upsertItem(item: TPricingProduct): void {
    const index = this._state.items.findIndex(row => row.id === item.id)
    if (index === -1) {
      this._state.items.unshift(item)
      return
    }
    this._state.items[index] = item
  }

  public setSaving(id: string, saving: boolean): void {
    if (saving) {
      if (!this._state.savingIds.includes(id)) {
        this._state.savingIds.push(id)
      }
      return
    }

    this._state.savingIds = this._state.savingIds.filter(rowId => rowId !== id)
  }

  public reset(): void {
    this._state.items = []
    this._state.meta = emptyMeta()
    this._state.loading = false
    this._state.savingIds = []
  }
}

export const usePricingDS = () => PricingDS.getInstance()
