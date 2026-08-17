import type { ServerResponse } from '~/types/common'

import { BaseApp } from '~/core/BaseApp'

import type {
  TFavoriteProduct,
  TFavoritesResponse
} from '../types/index.type'

export class FavoritesService extends BaseApp<TFavoriteProduct> {
  constructor() {
    super('favorites')
  }

  public async getFavorites(
    page = 1,
    limit = 20
  ): Promise<ServerResponse<TFavoritesResponse>> {
    return this.executeRequest<TFavoritesResponse>(async () => {
      return await this.Get<ServerResponse<TFavoritesResponse>>(
        '/favorites',
        { page, limit }
      )
    })
  }

  public async toggleFavorite(
    productId: string
  ): Promise<ServerResponse<{ favorited: boolean }>> {
    return this.executeRequest<{ favorited: boolean }>(async () => {
      return await this.Post<ServerResponse<{ favorited: boolean }>>(
        '/favorites/toggle',
        { productId }
      )
    })
  }
}
