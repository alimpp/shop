import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { InteractionsDS } from '../data/index.store'
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

  private readonly interactionsDS = InteractionsDS.getInstance()

  public async toggleLike(
    payload: TLikeTogglePayload
  ): Promise<ControllerResponse<TLikeToggleResult>> {
    this.interactionsDS.setEntity(payload.entityType, payload.entityId)
    this.interactionsDS.setLikeLoading(true)

    const response: ServerResponse<TLikeToggleResult>
      = await this.service.toggleLike(payload)

    if (response.success && response.data) {
      this.interactionsDS.setLikeStatus(
        response.data.liked,
        response.data.likeCount
      )
    }

    this.interactionsDS.setLikeLoading(false)
    return this.handleResponse(response)
  }

  public async getLikeStatus(
    query: TLikeStatusQuery
  ): Promise<ControllerResponse<boolean>> {
    this.interactionsDS.setEntity(query.entityType, query.entityId)

    const response: ServerResponse<boolean>
      = await this.service.getLikeStatus(query)

    if (response.success) {
      this.interactionsDS.setLiked(Boolean(response.data))
    }

    return this.handleResponse(response)
  }

  public async getComments(
    query: TCommentListQuery
  ): Promise<ControllerResponse<TCommentListData>> {
    this.interactionsDS.setEntity(query.entityType, query.entityId)
    this.interactionsDS.setCommentsLoading(true)

    const response: ServerResponse<TCommentListData>
      = await this.service.getComments(query)

    if (response.success && response.data) {
      const append = Boolean(query.page && query.page > 1)
      this.interactionsDS.setComments(response.data, append)
    }

    this.interactionsDS.setCommentsLoading(false)
    return this.handleResponse(response)
  }

  public async createComment(
    payload: TCommentPayload
  ): Promise<ControllerResponse<TComment>> {
    this.interactionsDS.setEntity(payload.entityType, payload.entityId)
    this.interactionsDS.setCommentSubmitting(true)

    const response: ServerResponse<TComment>
      = await this.service.createComment(payload)

    if (response.success && response.data) {
      this.interactionsDS.addComment(response.data)
    }

    this.interactionsDS.setCommentSubmitting(false)
    return this.handleResponse(response)
  }
}

export const interactionsController = new InteractionsController()
