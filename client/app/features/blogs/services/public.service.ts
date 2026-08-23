import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TBlogPublicCard,
  TBlogPublicDetail,
  TBlogPublicDetailData,
  TBlogPublicListData,
  TBlogPublicListQuery,
  TBlogPublicProduct,
  TBlogPublicSection
} from '../types/public.type'

type TRaw = Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class BlogsPublicService extends BaseApp<TBlogPublicCard> {
  constructor() {
    super('blogs-public')
  }

  private normalizeSection(raw: TRaw): TBlogPublicSection {
    return {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      imageUrl: (raw.imageUrl as string | null) ?? null,
      sortOrder: toNumber(raw.sortOrder)
    }
  }

  private normalizeProduct(raw: TRaw): TBlogPublicProduct {
    const brand = raw.brand as TRaw | null
    const category = raw.category as TRaw | null

    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      slug: String(raw.slug ?? ''),
      price: toNumber(raw.price),
      salePrice:
        raw.salePrice === null || typeof raw.salePrice === 'undefined'
          ? null
          : toNumber(raw.salePrice),
      image: (raw.image as string | null) ?? null,
      brand: brand
        ? {
            id: String(brand.id ?? ''),
            name: String(brand.name ?? ''),
            slug: brand.slug ? String(brand.slug) : undefined
          }
        : null,
      category: category
        ? {
            id: String(category.id ?? ''),
            name: String(category.name ?? ''),
            slug: category.slug ? String(category.slug) : undefined
          }
        : null
    }
  }

  private normalizeCard(raw: TRaw): TBlogPublicCard {
    return {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? ''),
      slug: String(raw.slug ?? ''),
      summary: String(raw.summary ?? ''),
      coverImage: String(raw.coverImage ?? ''),
      isFeatured: Boolean(raw.isFeatured ?? false),
      viewCount: toNumber(raw.viewCount),
      publishedAt: raw.publishedAt ? String(raw.publishedAt) : undefined,
      readingMinutes: toNumber(raw.readingMinutes, 5)
    }
  }

  private normalizeDetail(raw: TRaw): TBlogPublicDetail {
    return {
      ...this.normalizeCard(raw),
      metaTitle: raw.metaTitle ? String(raw.metaTitle) : undefined,
      metaDescription: raw.metaDescription ? String(raw.metaDescription) : undefined,
      keywords: raw.keywords ? String(raw.keywords) : undefined,
      canonical: raw.canonical ? String(raw.canonical) : undefined,
      ogImage: raw.ogImage ? String(raw.ogImage) : undefined,
      sections: Array.isArray(raw.sections)
        ? raw.sections.map(item => this.normalizeSection(item as TRaw))
        : [],
      products: Array.isArray(raw.products)
        ? raw.products.map(item => this.normalizeProduct(item as TRaw))
        : []
    }
  }

  public async getPublicBlogs(
    query?: TBlogPublicListQuery
  ): Promise<ServerResponse<TBlogPublicListData>> {
    return this.executeRequest<TBlogPublicListData>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>('/blogs/public', query)
      const payload = (response.data ?? {}) as TRaw
      const items = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.items)
          ? payload.items
          : []

      const meta = (payload.meta ?? {}) as TRaw

      return {
        ...response,
        data: {
          items: items.map(item => this.normalizeCard(item as TRaw)),
          meta: {
            total: toNumber(meta.total),
            page: toNumber(meta.page, 1),
            limit: toNumber(meta.limit, 12),
            totalPages: toNumber(meta.totalPages)
          }
        }
      }
    })
  }

  public async getBlogBySlug(
    slug: string
  ): Promise<ServerResponse<TBlogPublicDetailData>> {
    return this.executeRequest<TBlogPublicDetailData>(async () => {
      const response = await this.Get<ServerResponse<TRaw>>(`/blogs/slug/${slug}`)
      const payload = (response.data ?? {}) as TRaw

      return {
        ...response,
        data: {
          blog: this.normalizeDetail((payload.blog ?? {}) as TRaw),
          relatedBlogs: Array.isArray(payload.relatedBlogs)
            ? payload.relatedBlogs.map(item => this.normalizeCard(item as TRaw))
            : []
        }
      }
    })
  }
}
