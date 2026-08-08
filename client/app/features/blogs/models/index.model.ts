import type { TBlog, TBlogProductRef, TBlogSection } from "../types/index.type";

export class BlogModel implements TBlog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  status: TBlog["status"];
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

  constructor(data?: Partial<TBlog>) {
    this.id = data?.id ?? "";
    this.title = data?.title ?? "";
    this.slug = data?.slug ?? "";
    this.summary = data?.summary ?? "";
    this.coverImage = data?.coverImage ?? "";
    this.status = data?.status ?? "draft";
    this.isActive = data?.isActive ?? true;
    this.isFeatured = data?.isFeatured ?? false;
    this.viewCount = data?.viewCount ?? 0;
    this.publishedAt = data?.publishedAt ?? "";
    this.metaTitle = data?.metaTitle ?? "";
    this.metaDescription = data?.metaDescription ?? "";
    this.keywords = data?.keywords ?? "";
    this.canonical = data?.canonical ?? "";
    this.ogImage = data?.ogImage ?? "";
    this.sections = data?.sections ?? [];
    this.products = data?.products ?? [];
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}
