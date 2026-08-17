import { ProductModel } from '~/features/products/models/index.model'

import type { TFavoriteProduct } from '../types/index.type'

export class FavoriteProductModel extends ProductModel {
  favoritedAt?: string

  constructor(data?: Partial<TFavoriteProduct>) {
    super(data)
    this.favoritedAt = data?.favoritedAt ?? ''
  }

  get mainImage(): string {
    const thumbnail = this.medias?.find(media => media.isThumbnail)
    return thumbnail?.url || this.medias?.[0]?.url || ''
  }
}
