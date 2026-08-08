import type { ServerResponse } from "~/types/common";
import { BaseApp } from "~/core/BaseApp";
import type {
  TBlog,
  TBlogPayload,
  TBlogProductRef,
  TBlogSection,
} from "../types/index.type";

type TRawBlog = Record<string, any>;

export class BlogsService extends BaseApp<TBlog> {
  constructor() {
    super("blogs");
  }

  private normalizeSection(item: TRawBlog): TBlogSection {
    return {
      id: item.id ?? "",
      blogId: item.blogId ?? "",
      title: item.title ?? "",
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : Number(item.sortOrder) || 0,
    };
  }

  private normalizeProduct(item: TRawBlog): TBlogProductRef {
    return {
      id: item.id ?? "",
      name: item.name ?? "",
      slug: item.slug ?? "",
    };
  }

  private normalizeBlog(item: TRawBlog): TBlog {
    return {
      id: item.id ?? "",
      title: item.title ?? "",
      slug: item.slug ?? "",
      summary: item.summary ?? "",
      coverImage: item.coverImage ?? "",
      status: item.status ?? "draft",
      isActive: item.isActive ?? true,
      isFeatured: item.isFeatured ?? false,
      viewCount: typeof item.viewCount === "number" ? item.viewCount : Number(item.viewCount) || 0,
      publishedAt: item.publishedAt ?? "",
      metaTitle: item.metaTitle ?? "",
      metaDescription: item.metaDescription ?? "",
      keywords: item.keywords ?? "",
      canonical: item.canonical ?? "",
      ogImage: item.ogImage ?? "",
      sections: Array.isArray(item.sections)
        ? item.sections.map((section: TRawBlog) => this.normalizeSection(section))
        : [],
      products: Array.isArray(item.products)
        ? item.products.map((product: TRawBlog) => this.normalizeProduct(product))
        : [],
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? "",
    };
  }

  public async getBlogs(): Promise<ServerResponse<TBlog[]>> {
    return this.executeRequest<TBlog[]>(async () => {
      const response = await this.Get<ServerResponse<TRawBlog[]>>("/blogs");

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.normalizeBlog(item))
          : [],
      };
    });
  }

  public async createBlog(payload: TBlogPayload): Promise<ServerResponse<TBlog>> {
    return this.executeRequest<TBlog>(async () => {
      const response = await this.Post<ServerResponse<TRawBlog>>("/blogs", payload);

      return {
        ...response,
        data: this.normalizeBlog(response.data),
      };
    });
  }

  public async updateBlog(id: string, payload: TBlogPayload): Promise<ServerResponse<TBlog>> {
    return this.executeRequest<TBlog>(async () => {
      const response = await this.Patch<ServerResponse<TRawBlog>>(`/blogs/${id}`, payload);

      return {
        ...response,
        data: this.normalizeBlog(response.data),
      };
    });
  }

  public async deleteBlog(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(`/blogs/${id}`);

      return {
        ...response,
        data: { id },
      };
    });
  }
}
