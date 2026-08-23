import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { BlogsPublicService } from '../services/public.service'
import type {
  TBlogPublicDetailData,
  TBlogPublicListData,
  TBlogPublicListQuery
} from '../types/public.type'

class BlogsPublicController extends BaseController<BlogsPublicService> {
  constructor() {
    super(new BlogsPublicService())
  }

  public async getPublicBlogs(
    query?: TBlogPublicListQuery
  ): Promise<ControllerResponse<TBlogPublicListData>> {
    const response: ServerResponse<TBlogPublicListData> =
      await this.service.getPublicBlogs(query)

    return this.handleResponse(response)
  }

  public async getBlogBySlug(
    slug: string
  ): Promise<ControllerResponse<TBlogPublicDetailData>> {
    const response: ServerResponse<TBlogPublicDetailData> =
      await this.service.getBlogBySlug(slug)

    return this.handleResponse(response)
  }
}

export const blogsPublicController = new BlogsPublicController()
