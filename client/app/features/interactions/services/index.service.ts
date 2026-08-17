import type { ServerResponse } from '~/types/common'

import { BaseApp } from '~/core/BaseApp'

import type {
  TComment,
  TCommentListData,
  TCommentListQuery,
  TCommentPayload,
  TLikeStatusQuery,
  TLikeTogglePayload,
  TLikeToggleResult
} from '../types/index.type'

export class InteractionsService extends BaseApp<TComment> {
  constructor() {
    super('interactions')
  }

  public async toggleLike(
    payload: TLikeTogglePayload
  ): Promise<ServerResponse<TLikeToggleResult>> {
    return this.executeRequest<TLikeToggleResult>(async () => {
      return await this.Post<ServerResponse<TLikeToggleResult>>(
        '/likes/toggle',
        payload
      )
    })
  }

  public async getLikeStatus(
    query: TLikeStatusQuery
  ): Promise<ServerResponse<boolean>> {
    return this.executeRequest<boolean>(async () => {
      return await this.Get<ServerResponse<boolean>>('/likes/status', query)
    })
  }

  public async getComments(
    query: TCommentListQuery
  ): Promise<ServerResponse<TCommentListData>> {
    return this.executeRequest<TCommentListData>(async () => {
      return await this.Get<ServerResponse<TCommentListData>>(
        '/comments',
        query
      )
    })
  }

  public async createComment(
    payload: TCommentPayload
  ): Promise<ServerResponse<TComment>> {
    return this.executeRequest<TComment>(async () => {
      return await this.Post<ServerResponse<TComment>>('/comments', payload)
    })
  }
}
