import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { FavoriteProductModel } from '../models/index.model'

import type { TFavoriteProduct, TFavoritesResponse } from '../types/index.type'

interface IFavoritesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface IFavoritesState {
  items: FavoriteProductModel[]
  meta: IFavoritesMeta
  loading: boolean
  submitting: boolean
}

export class FavoritesDS extends BaseStore<IFavoritesState> {
  private static _instance: FavoritesDS

  public static getInstance(): FavoritesDS {
    if (!FavoritesDS._instance) {
      FavoritesDS._instance = new FavoritesDS()
    }
    return FavoritesDS._instance
  }

  private constructor() {
    super('favorites', {
      items: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      loading: false,
      submitting: false
    })
    StoreManager.register(this)
  }

  public get getItems(): FavoriteProductModel[] {
    return this._state.items
  }

  public get getMeta(): IFavoritesMeta {
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

  public setFavorites(data: TFavoritesResponse): void {
    this._state.items = (data.items ?? []).map(
      item => new FavoriteProductModel(item)
    )
    this._state.meta = {
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 20,
      totalPages: data.totalPages ?? 0
    }
  }

  public isFavorited(productId: string): boolean {
    return this._state.items.some(item => item.id === productId)
  }

  public upsertFavorite(product: TFavoriteProduct): void {
    const model = new FavoriteProductModel(product)
    const index = this._state.items.findIndex(item => item.id === model.id)

    if (index === -1) {
      this._state.items = [model, ...this._state.items]
      this._state.meta.total += 1
      return
    }

    this._state.items.splice(index, 1, model)
  }

  public removeFavorite(productId: string): void {
    const before = this._state.items.length
    this._state.items = this._state.items.filter(item => item.id !== productId)
    if (this._state.items.length < before) {
      this._state.meta.total = Math.max(0, this._state.meta.total - 1)
    }
  }

  public reset(): void {
    this._state.items = []
    this._state.meta = { total: 0, page: 1, limit: 20, totalPages: 0 }
    this._state.loading = false
    this._state.submitting = false
  }
}

export const useFavoritesDS = () => FavoritesDS.getInstance()
