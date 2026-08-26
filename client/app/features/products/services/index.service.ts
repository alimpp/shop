import type { ServerResponse } from '~/types/common'

import { BaseApp } from '~/core/BaseApp'

import type {
  TProduct,
  TProductAttributeRef,
  TProductAttributeValue,
  TProductAttributeWithValues,
  TProductBrandRef,
  TProductCategoryRef,
  TProductListData,
  TProductListMeta,
  TProductListQuery,
  TProductMedia,
  TProductOption,
  TProductOptionValue,
  TProductPayload,
  TProductSpecification,
  TProductTag,
  TProductTagRef,
  TProductVariant,
  TProductVariantValue
} from '../types/index.type'

type TRawProduct = Record<string, any>

type TProductApiListPayload
  = | TRawProduct[]
    | {
      data?: TRawProduct[]
      items?: TRawProduct[]
      meta?: Partial<TProductListMeta>
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }

export class ProductsService extends BaseApp<TProduct> {
  constructor() {
    super('products')
  }

  public getCachedProducts(): TProductListData | null {
    if (!this.hasData()) {
      return null
    }

    const items = this.getData()
    const total = items.length

    return {
      items,
      meta: {
        total,
        page: 1,
        limit: total || 20,
        totalPages: total > 0 ? 1 : 0
      }
    }
  }

  public saveProductsCache(products: TProduct[]): void {
    this.saveData(products)
  }

  private toNumber(value: unknown, fallback?: number): number | undefined {
    if (value === null || value === '' || typeof value === 'undefined') {
      return fallback
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  private normalizeCategory(item?: TRawProduct): TProductCategoryRef | undefined {
    if (!item) {
      return undefined
    }

    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? ''
    }
  }

  private normalizeBrand(item?: TRawProduct): TProductBrandRef | undefined {
    if (!item) {
      return undefined
    }

    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? '',
      logo: item.logo ?? '',
      description: item.description ?? '',
      isActive: item.isActive ?? true
    }
  }

  private normalizeAttribute(item?: TRawProduct): TProductAttributeRef | undefined {
    if (!item) {
      return undefined
    }

    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? '',
      isFilterable: item.isFilterable ?? false,
      sortOrder: this.toNumber(item.sortOrder, 0) ?? 0
    }
  }

  private normalizeAttributeValue(item?: TRawProduct): TProductAttributeValue | undefined {
    if (!item) {
      return undefined
    }

    return {
      id: item.id ?? '',
      attributeId: item.attributeId ?? '',
      value: item.value ?? '',
      slug: item.slug ?? '',
      sortOrder: this.toNumber(item.sortOrder, 0) ?? 0,
      attribute: this.normalizeAttribute(item.attribute)
    }
  }

  private normalizeVariantValue(item: TRawProduct): TProductVariantValue {
    return {
      id: item.id ?? '',
      variantId: item.variantId ?? '',
      attributeValueId: item.attributeValueId ?? '',
      attributeValue: this.normalizeAttributeValue(item.attributeValue)
    }
  }

  private normalizeOptionValue(item: TRawProduct): TProductOptionValue {
    const attributeValue = item.attributeValue as TRawProduct | undefined

    return {
      id: item.id ?? '',
      productOptionId: item.productOptionId ?? '',
      attributeValueId:
        item.attributeValueId
        ?? attributeValue?.id
        ?? '',
      attributeValue: this.normalizeAttributeValue(attributeValue)
    }
  }

  private normalizeTag(item?: TRawProduct): TProductTagRef | undefined {
    if (!item) {
      return undefined
    }

    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? ''
    }
  }

  private normalizeMedia(item: TRawProduct): TProductMedia {
    return {
      id: item.id ?? '',
      type: item.type ?? 'image',
      url: item.url ?? '',
      mimeType: item.mimeType ?? item.mime_type ?? '',
      size: this.toNumber(item.size),
      alt: item.alt ?? '',
      caption: item.caption ?? '',
      isThumbnail: item.isThumbnail ?? false,
      sortOrder: this.toNumber(item.sortOrder, 0) ?? 0,
      createdAt: item.createdAt ?? ''
    }
  }

  private normalizeVariant(item: TRawProduct): TProductVariant {
    return {
      id: item.id ?? '',
      name: item.name ?? '',
      sku: item.sku ?? '',
      barcode: item.barcode ?? '',
      price: this.toNumber(item.price, 0) ?? 0,
      salePrice: this.toNumber(item.salePrice),
      stock: this.toNumber(item.stock, 0) ?? 0,
      manageStock: item.manageStock ?? true,
      allowBackorder: item.allowBackorder ?? false,
      weight: this.toNumber(item.weight),
      length: this.toNumber(item.length),
      width: this.toNumber(item.width),
      height: this.toNumber(item.height),
      image: item.image ?? '',
      isDefault: item.isDefault ?? false,
      isActive: item.isActive ?? true,
      values: Array.isArray(item.values)
        ? item.values.map((value: TRawProduct) => this.normalizeVariantValue(value))
        : [],
      createdAt: item.createdAt ?? '',
      updatedAt: item.updatedAt ?? ''
    }
  }

  private normalizeOption(item: TRawProduct): TProductOption {
    return {
      id: item.id ?? '',
      productId: item.productId ?? '',
      attributeId: item.attributeId ?? '',
      sortOrder: this.toNumber(item.sortOrder, 0) ?? 0,
      attribute: this.normalizeAttribute(item.attribute),
      values: Array.isArray(item.values)
        ? item.values.map((value: TRawProduct) => this.normalizeOptionValue(value))
        : []
    }
  }

  private normalizeProductTag(item: TRawProduct): TProductTag {
    return {
      id: item.id ?? '',
      productId: item.productId ?? '',
      tagId: item.tagId ?? '',
      sortOrder: this.toNumber(item.sortOrder, 0) ?? 0,
      tag: this.normalizeTag(item.tag)
    }
  }

  private normalizeSpecifications(item?: TRawProduct): TProductSpecification[] | undefined {
    if (!Array.isArray(item)) {
      return undefined
    }

    const specifications = item
      .map(spec => ({
        title: String(spec?.title ?? '').trim(),
        value: String(spec?.value ?? '').trim()
      }))
      .filter(spec => Boolean(spec.title) && Boolean(spec.value))

    return specifications.length ? specifications : undefined
  }

  private normalizeProduct(item: TRawProduct): TProduct {
    const medias = Array.isArray(item.medias)
      ? item.medias.map((media: TRawProduct) => this.normalizeMedia(media)).sort((a, b) => a.sortOrder - b.sortOrder)
      : []

    const variants = Array.isArray(item.variants)
      ? item.variants.map((variant: TRawProduct) => this.normalizeVariant(variant))
      : []

    return {
      id: item.id ?? '',
      name: item.name ?? '',
      slug: item.slug ?? '',
      description: item.description ?? '',
      shortDescription: item.shortDescription ?? '',
      sku: item.sku ?? '',
      barcode: item.barcode ?? '',
      price: this.toNumber(item.price, 0) ?? 0,
      salePrice: this.toNumber(item.salePrice),
      costPrice: this.toNumber(item.costPrice),
      stock: this.toNumber(item.stock, 0) ?? 0,
      manageStock: item.manageStock ?? true,
      allowBackorder: item.allowBackorder ?? false,
      weight: this.toNumber(item.weight),
      length: this.toNumber(item.length),
      width: this.toNumber(item.width),
      height: this.toNumber(item.height),
      categoryId: item.categoryId ?? '',
      brandId: item.brandId ?? '',
      status: item.status ?? 'draft',
      visibility: item.visibility ?? 'public',
      isFeatured: item.isFeatured ?? false,
      isActive: item.isActive ?? true,
      soldCount: this.toNumber(item.soldCount, 0) ?? 0,
      viewCount: this.toNumber(item.viewCount, 0) ?? 0,
      likeCount: this.toNumber(item.likeCount, 0) ?? 0,
      commentCount: this.toNumber(item.commentCount, 0) ?? 0,
      publishedAt: item.publishedAt ?? '',
      metaTitle: item.metaTitle ?? '',
      metaDescription: item.metaDescription ?? '',
      keywords: item.keywords ?? '',
      canonical: item.canonical ?? '',
      ogImage: item.ogImage ?? '',
      category: this.normalizeCategory(item.category),
      brand: this.normalizeBrand(item.brand),
      medias,
      variants,
      options: Array.isArray(item.options)
        ? item.options.map((option: TRawProduct) => this.normalizeOption(option))
        : [],
      productTags: Array.isArray(item.productTags)
        ? item.productTags.map((productTag: TRawProduct) => this.normalizeProductTag(productTag))
        : [],
      specifications: this.normalizeSpecifications(item.specifications),
      createdAt: item.createdAt ?? '',
      updatedAt: item.updatedAt ?? '',
      deletedAt: item.deletedAt ?? ''
    }
  }

  private normalizeListResponse(response: TProductApiListPayload): TProductListData {
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response.items)
        ? response.items
        : Array.isArray(response.data)
          ? response.data
          : []

    const items = rawItems.map(item => this.normalizeProduct(item))
    const meta = Array.isArray(response)
      ? undefined
      : response.meta
    const total = meta?.total ?? (Array.isArray(response) ? items.length : response.total ?? items.length)
    const limit = meta?.limit ?? (Array.isArray(response) ? items.length || 20 : response.limit ?? 20)
    const page = meta?.page ?? (Array.isArray(response) ? 1 : response.page ?? 1)
    const totalPages = meta?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1)

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    }
  }

  public async getProducts(
    query?: TProductListQuery
  ): Promise<ServerResponse<TProductListData>> {
    const response = await this.executeRequest<TProductListData>(async () => {
      const response = await this.Get<ServerResponse<TProductApiListPayload>>(
        '/products',
        query
      )

      return {
        ...response,
        data: this.normalizeListResponse(response.data)
      }
    })

    if (response.success) {
      this.saveProductsCache(response.data.items)
    }

    return response
  }

  public async getProductById(
    id: string
  ): Promise<ServerResponse<TProduct>> {
    return this.executeRequest<TProduct>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct>>(
        `/products/${id}`
      )

      return {
        ...response,
        data: this.normalizeProduct(response.data)
      }
    })
  }

  public async getProductBySlug(
    slug: string
  ): Promise<ServerResponse<TProduct>> {
    return this.executeRequest<TProduct>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct>>(
        `/products/slug/${slug}`
      )

      return {
        ...response,
        data: this.normalizeProduct(response.data)
      }
    })
  }

  public async getBrands(): Promise<ServerResponse<TProductBrandRef[]>> {
    return this.executeRequest<TProductBrandRef[]>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct[]>>(
        '/brands'
      )

      const data = Array.isArray(response.data)
        ? response.data
            .map(item => this.normalizeBrand(item))
            .filter((brand): brand is TProductBrandRef => Boolean(brand))
        : []

      return {
        ...response,
        data
      }
    })
  }

  public async getAttributes(): Promise<ServerResponse<TProductAttributeWithValues[]>> {
    return this.executeRequest<TProductAttributeWithValues[]>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct[]>>(
        '/attributes',
        { includeValues: 1 }
      )

      const data = Array.isArray(response.data)
        ? response.data.reduce<TProductAttributeWithValues[]>((acc, item) => {
            const attribute = this.normalizeAttribute(item)
            if (!attribute) {
              return acc
            }

            const values: TProductAttributeValue[] = Array.isArray(item.values)
              ? item.values
                  .map((value: TRawProduct) => ({
                    id: value.id ?? '',
                    attributeId: attribute.id,
                    value: value.value ?? '',
                    slug: value.slug ?? '',
                    sortOrder: this.toNumber(value.sortOrder, 0) ?? 0,
                    attribute
                  }))
                  .filter(value => Boolean(value.id))
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              : []

            acc.push({
              ...attribute,
              values
            })

            return acc
          }, []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        : []

      return {
        ...response,
        data
      }
    })
  }

  public async getFilterAttributes(
    query?: TProductListQuery
  ): Promise<ServerResponse<TProductAttributeWithValues[]>> {
    return this.executeRequest<TProductAttributeWithValues[]>(async () => {
      const response = await this.Get<ServerResponse<TRawProduct[]>>(
        '/products/filters',
        query
      )

      const data = Array.isArray(response.data)
        ? response.data.reduce<TProductAttributeWithValues[]>((acc, item) => {
            const attribute = this.normalizeAttribute(item)
            if (!attribute) {
              return acc
            }

            const values: TProductAttributeValue[] = Array.isArray(item.values)
              ? item.values
                  .map((value: TRawProduct) => ({
                    id: value.id ?? '',
                    attributeId: attribute.id,
                    value: value.value ?? '',
                    slug: value.slug ?? '',
                    sortOrder: this.toNumber(value.sortOrder, 0) ?? 0,
                    attribute
                  }))
                  .filter(value => Boolean(value.id))
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              : []

            acc.push({
              ...attribute,
              values
            })

            return acc
          }, []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        : []

      return {
        ...response,
        data
      }
    })
  }

  public async createProduct(
    payload: TProductPayload
  ): Promise<ServerResponse<TProduct>> {
    return this.executeRequest<TProduct>(async () => {
      const response = await this.Post<ServerResponse<TRawProduct>>(
        '/products',
        payload
      )

      return {
        ...response,
        data: this.normalizeProduct(response.data)
      }
    })
  }

  public async updateProduct(
    id: string,
    payload: TProductPayload
  ): Promise<ServerResponse<TProduct>> {
    return this.executeRequest<TProduct>(async () => {
      const response = await this.Patch<ServerResponse<TRawProduct>>(
        `/products/${id}`,
        payload
      )

      return {
        ...response,
        data: this.normalizeProduct(response.data)
      }
    })
  }

  public async deleteProduct(
    id: string
  ): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(
        `/products/${id}`
      )

      return {
        ...response,
        data: { id }
      }
    })
  }
}
