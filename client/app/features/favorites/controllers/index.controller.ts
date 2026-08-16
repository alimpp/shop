import type { ServerResponse, ControllerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { FavoritesService } from '../services/index.service'

import type { TFavoritesResponse } from '../types/index.type'

class FavoritesController extends BaseController<FavoritesService> {
  constructor() {
    super(new FavoritesService())
  }

  public async getFavorites(
    page = 1,
    limit = 20
  ): Promise<ControllerResponse<TFavoritesResponse>> {
    const serverResponse: ServerResponse<TFavoritesResponse>
      = await this.service.getFavorites(page, limit)
    return this.handleResponse(serverResponse)
  }

  public async toggleFavorite(
    productId: string
  ): Promise<ControllerResponse<{ favorited: boolean }>> {
    const serverResponse: ServerResponse<{ favorited: boolean }>
      = await this.service.toggleFavorite(productId)
    return this.handleResponse(serverResponse)
  }
}

export const favoritesController = new FavoritesController()
