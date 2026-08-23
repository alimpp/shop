export interface TBlogPublicSection {
  id: string
  title: string
  description: string
  imageUrl: string | null
  sortOrder: number
}

export interface TBlogPublicProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  image: string | null
  brand: {
    id: string
    name: string
    slug?: string
  } | null
  category: {
    id: string
    name: string
    slug?: string
  } | null
}

export interface TBlogPublicCard {
  id: string
  title: string
  slug: string
  summary: string
  coverImage: string
  isFeatured: boolean
  viewCount: number
  publishedAt?: string
  readingMinutes: number
}

export interface TBlogPublicDetail extends TBlogPublicCard {
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  sections: TBlogPublicSection[]
  products: TBlogPublicProduct[]
}

export interface TBlogPublicListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TBlogPublicListData {
  items: TBlogPublicCard[]
  meta: TBlogPublicListMeta
}

export interface TBlogPublicDetailData {
  blog: TBlogPublicDetail
  relatedBlogs: TBlogPublicCard[]
}

export interface TBlogPublicListQuery {
  search?: string
  page?: number
  limit?: number
  isFeatured?: boolean
}
