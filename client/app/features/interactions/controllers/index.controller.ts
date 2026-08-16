import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { InteractionsService } from '../services/index.service'

import type {
  TComment,
  TCommentListData,
  TCommentListQuery,
  TCommentPayload,
  TLikeStatusQuery,
  TLikeTogglePayload,
  TLikeToggleResult
} from '../types/index.type'

class InteractionsController extends BaseController<InteractionsService> {
  constructor() {
    super(new InteractionsService())
  }

  public async toggleLike(
    payload: TLikeTogglePayload
  ): Promise<ControllerResponse<TLikeToggleResult>> {
    const response: ServerResponse<TLikeToggleResult>
      = await this.service.toggleLike(payload)
    return this.handleResponse(response)
  }

  public async getLikeStatus(
    query: TLikeStatusQuery
  ): Promise<ControllerResponse<boolean>> {
    const response: ServerResponse<boolean>
      = await this.service.getLikeStatus(query)
    return this.handleResponse(response)
  }

  public async getComments(
    query: TCommentListQuery
  ): Promise<ControllerResponse<TCommentListData>> {
    const response: ServerResponse<TCommentListData>
      = await this.service.getComments(query)
    return this.handleResponse(response)
  }

  public async createComment(
    payload: TCommentPayload
  ): Promise<ControllerResponse<TComment>> {
    const response: ServerResponse<TComment>
      = await this.service.createComment(payload)
    return this.handleResponse(response)
  }
}

export const interactionsController = new InteractionsController()
