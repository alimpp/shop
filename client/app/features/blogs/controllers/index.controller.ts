import type { ControllerResponse, ServerResponse } from "~/types/common";
import { BaseController } from "~/core/BaseController";
import { BlogsDS } from "../data/index.store";
import { BlogsService } from "../services/index.service";
import type { TBlog, TBlogPayload } from "../types/index.type";

class BlogsController extends BaseController<BlogsService> {
  constructor() {
    super(new BlogsService());
  }

  private readonly blogsDS = BlogsDS.getInstance();

  public async getBlogs(): Promise<ControllerResponse<TBlog[]>> {
    this.blogsDS.setLoading(true);

    const response: ServerResponse<TBlog[]> = await this.service.getBlogs();

    if (response.success) {
      this.blogsDS.setBlogs(response.data);
    }

    this.blogsDS.setLoading(false);
    return this.handleResponse(response);
  }

  public async createBlog(payload: TBlogPayload): Promise<ControllerResponse<TBlog>> {
    this.blogsDS.setSubmitting(true);

    const response: ServerResponse<TBlog> = await this.service.createBlog(payload);

    if (response.success) {
      this.blogsDS.upsertBlog(response.data);
    }

    this.blogsDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateBlog(id: string, payload: TBlogPayload): Promise<ControllerResponse<TBlog>> {
    this.blogsDS.setSubmitting(true);

    const response: ServerResponse<TBlog> = await this.service.updateBlog(id, payload);

    if (response.success) {
      this.blogsDS.upsertBlog(response.data);
      this.blogsDS.setSelectedBlog(response.data);
    }

    this.blogsDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteBlog(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.blogsDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteBlog(id);

    if (response.success) {
      this.blogsDS.removeBlog(id);
      if (this.blogsDS.getSelectedBlog?.id === id) {
        this.blogsDS.setSelectedBlog(null);
      }
    }

    this.blogsDS.setSubmitting(false);
    return this.handleResponse(response);
  }
}

export const blogsController = new BlogsController();
