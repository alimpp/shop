export type TBlogStatus = "draft" | "published" | "archived";

export interface TBlogSection {
  id: string;
  blogId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface TBlogProductRef {
  id: string;
  name: string;
  slug?: string;
}

export interface TBlog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  status: TBlogStatus;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  sections: TBlogSection[];
  products: TBlogProductRef[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TBlogSectionPayload {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface TBlogPayload {
  title: string;
  slug?: string;
  summary: string;
  coverImage: string;
  status?: TBlogStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  sections?: TBlogSectionPayload[];
  productIds?: string[];
}
