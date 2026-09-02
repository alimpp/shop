import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type { TProduct } from '~/features/products/types/index.type'
import type {
  TAdminUserBehaviorData,
  TTrackBehaviorPayload
} from '../types/index.type'

type TRawProduct = Record<string, any>

export class BehaviorService extends BaseApp<{ id: string }> {
  constructor() {
    super('behavior')
  }

  public async trackEvent(
    payload: TTrackBehaviorPayload
  ): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      return this.Post<ServerResponse<{ id: string }>>(
        '/behavior/events',
        payload,
        { silent: true }
      )
    })
  }

  public async getRecent(
    query?: { sessionId?: string; limit?: number }
  ): Promise<ServerResponse<TProduct[]>> {
    return this.executeRequest<TProduct[]>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct[]>>(
        '/behavior/recent',
        query,
        { silent: true }
      )

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map(item => this.normalizeCard(item))
          : []
      }
    })
  }

  public async getRecommendations(
    query?: { sessionId?: string; limit?: number }
  ): Promise<ServerResponse<TProduct[]>> {
    return this.executeRequest<TProduct[]>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct[]>>(
        '/behavior/recommendations',
        query,
        { silent: true }
      )

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map(item => this.normalizeCard(item))
          : []
      }
    })
  }

  public async getAdminUserBehavior(
    userId: string,
    query?: { page?: number; limit?: number }
  ): Promise<ServerResponse<TAdminUserBehaviorData>> {
    return this.executeRequest<TAdminUserBehaviorData>(async () => {
      return this.Get<ServerResponse<TAdminUserBehaviorData>>(
        `/behavior/admin/users/${userId}`,
        query
      )
    })
  }

  private normalizeCard(item: TRawProduct): TProduct {
    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? '',
      description: item.description ?? '',
      shortDescription: item.shortDescription ?? '',
      sku: item.sku ?? '',
      barcode: item.barcode ?? '',
      price: Number(item.price) || 0,
      salePrice:
        item.salePrice == null ? undefined : Number(item.salePrice) || 0,
      costPrice: undefined,
      stock: Number(item.stock) || 0,
      manageStock: item.manageStock ?? true,
      allowBackorder: item.allowBackorder ?? false,
      categoryId: item.categoryId ?? '',
      brandId: item.brandId ?? '',
      status: item.status ?? 'published',
      visibility: item.visibility ?? 'public',
      isFeatured: item.isFeatured ?? false,
      isActive: item.isActive ?? true,
      soldCount: Number(item.soldCount) || 0,
      viewCount: Number(item.viewCount) || 0,
      likeCount: Number(item.likeCount) || 0,
      commentCount: Number(item.commentCount) || 0,
      publishedAt: item.publishedAt ?? '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonical: '',
      ogImage: '',
      category: item.category
        ? {
            id: item.category.id ?? '',
            name: item.category.name ?? '',
            slug: item.category.slug ?? ''
          }
        : undefined,
      brand: item.brand
        ? {
            id: item.brand.id ?? '',
            name: item.brand.name ?? '',
            slug: item.brand.slug ?? ''
          }
        : undefined,
      medias: Array.isArray(item.medias)
        ? item.medias.map((media: TRawProduct) => ({
            id: media.id ?? '',
            type: media.type ?? 'image',
            url: media.url ?? '',
            mimeType: media.mimeType ?? '',
            size: Number(media.size) || 0,
            alt: media.alt ?? '',
            caption: media.caption ?? '',
            isThumbnail: media.isThumbnail ?? false,
            sortOrder: Number(media.sortOrder) || 0,
            createdAt: media.createdAt ?? ''
          }))
        : [],
      variants: Array.isArray(item.variants)
        ? item.variants.map((variant: TRawProduct) => ({
            id: variant.id ?? '',
            name: variant.name ?? '',
            sku: variant.sku ?? '',
            barcode: variant.barcode ?? '',
            price: Number(variant.price) || 0,
            salePrice:
              variant.salePrice == null
                ? undefined
                : Number(variant.salePrice) || 0,
            stock: Number(variant.stock) || 0,
            manageStock: variant.manageStock ?? true,
            allowBackorder: variant.allowBackorder ?? false,
            image: variant.image ?? '',
            isDefault: variant.isDefault ?? false,
            isActive: variant.isActive ?? true,
            values: [],
            createdAt: variant.createdAt ?? '',
            updatedAt: variant.updatedAt ?? ''
          }))
        : [],
      options: [],
      productTags: [],
      createdAt: item.createdAt ?? '',
      updatedAt: item.updatedAt ?? ''
    }
  }
}
