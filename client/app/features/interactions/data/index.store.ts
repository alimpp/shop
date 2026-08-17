import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { CommentModel } from '../models/index.model'

import type {
  TComment,
  TCommentListData,
  TInteractionTargetType
} from '../types/index.type'

interface ICommentsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface IInteractionsState {
  comments: CommentModel[]
  commentsMeta: ICommentsMeta
  liked: boolean
  likeCount: number
  entityType: TInteractionTargetType | null
  entityId: string | null
  likeLoading: boolean
  commentsLoading: boolean
  commentSubmitting: boolean
  commentsLoaded: boolean
}

const emptyMeta = (): ICommentsMeta => ({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
})

export class InteractionsDS extends BaseStore<IInteractionsState> {
  private static _instance: InteractionsDS

  public static getInstance(): InteractionsDS {
    if (!InteractionsDS._instance) {
      InteractionsDS._instance = new InteractionsDS()
    }
    return InteractionsDS._instance
  }

  private constructor() {
    super('interactions', {
      comments: [],
      commentsMeta: emptyMeta(),
      liked: false,
      likeCount: 0,
      entityType: null,
      entityId: null,
      likeLoading: false,
      commentsLoading: false,
      commentSubmitting: false,
      commentsLoaded: false
    })
    StoreManager.register(this)
  }

  public get getComments(): CommentModel[] {
    return this._state.comments
  }

  public get getCommentsMeta(): ICommentsMeta {
    return this._state.commentsMeta
  }

  public get getLiked(): boolean {
    return this._state.liked
  }

  public get getLikeCount(): number {
    return this._state.likeCount
  }

  public get getLikeLoading(): boolean {
    return this._state.likeLoading
  }

  public get getCommentsLoading(): boolean {
    return this._state.commentsLoading
  }

  public get getCommentSubmitting(): boolean {
    return this._state.commentSubmitting
  }

  public get getCommentsLoaded(): boolean {
    return this._state.commentsLoaded
  }

  public get getHasMoreComments(): boolean {
    return this._state.commentsMeta.page < this._state.commentsMeta.totalPages
  }

  public setEntity(
    entityType: TInteractionTargetType,
    entityId: string
  ): void {
    if (
      this._state.entityType === entityType
      && this._state.entityId === entityId
    ) {
      return
    }

    this._state.entityType = entityType
    this._state.entityId = entityId
    this._state.comments = []
    this._state.commentsMeta = emptyMeta()
    this._state.liked = false
    this._state.likeCount = 0
    this._state.commentsLoaded = false
  }

  public setLikeLoading(loading: boolean): void {
    this._state.likeLoading = loading
  }

  public setCommentsLoading(loading: boolean): void {
    this._state.commentsLoading = loading
  }

  public setCommentSubmitting(submitting: boolean): void {
    this._state.commentSubmitting = submitting
  }

  public setLiked(liked: boolean): void {
    this._state.liked = liked
  }

  public setLikeCount(count: number): void {
    this._state.likeCount = count
  }

  public setLikeStatus(liked: boolean, likeCount?: number): void {
    this._state.liked = liked
    if (typeof likeCount === 'number') {
      this._state.likeCount = likeCount
    }
  }

  public setComments(data: TCommentListData, append = false): void {
    const models = (data.items ?? []).map(item => new CommentModel(item))
    this._state.comments = append
      ? [...this._state.comments, ...models]
      : models
    this._state.commentsMeta = {
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      totalPages: data.totalPages ?? 0
    }
    this._state.commentsLoaded = true
  }

  public addComment(comment: TComment): void {
    this._state.comments = [new CommentModel(comment), ...this._state.comments]
    this._state.commentsMeta.total += 1
  }

  public reset(): void {
    this._state.comments = []
    this._state.commentsMeta = emptyMeta()
    this._state.liked = false
    this._state.likeCount = 0
    this._state.entityType = null
    this._state.entityId = null
    this._state.likeLoading = false
    this._state.commentsLoading = false
    this._state.commentSubmitting = false
    this._state.commentsLoaded = false
  }
}

export const useInteractionsDS = () => InteractionsDS.getInstance()
