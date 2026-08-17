import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { FavoritesDS } from '../data/index.store'
import { FavoritesService } from '../services/index.service'

import type {
  TFavoriteProduct,
  TFavoritesResponse
} from '../types/index.type'

class FavoritesController extends BaseController<FavoritesService> {
  constructor() {
    super(new FavoritesService())
  }

  private readonly favoritesDS = FavoritesDS.getInstance()

  public async getFavorites(
    page = 1,
    limit = 20
  ): Promise<ControllerResponse<TFavoritesResponse>> {
    this.favoritesDS.setLoading(true)

    const response: ServerResponse<TFavoritesResponse>
      = await this.service.getFavorites(page, limit)

    if (response.success && response.data) {
      this.favoritesDS.setFavorites(response.data)
    }

    this.favoritesDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async toggleFavorite(
    productId: string,
    product?: TFavoriteProduct
  ): Promise<ControllerResponse<{ favorited: boolean }>> {
    this.favoritesDS.setSubmitting(true)

    const response: ServerResponse<{ favorited: boolean }>
      = await this.service.toggleFavorite(productId)

    if (response.success && response.data) {
      if (response.data.favorited) {
        if (product) {
          this.favoritesDS.upsertFavorite({
            ...product,
            favoritedAt: new Date().toISOString()
          })
        }
      } else {
        this.favoritesDS.removeFavorite(productId)
      }
    }

    this.favoritesDS.setSubmitting(false)
    return this.handleResponse(response)
  }
}

export const favoritesController = new FavoritesController()
