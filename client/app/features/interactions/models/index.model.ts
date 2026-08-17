import type {
  TComment,
  TCommentUser,
  TInteractionTargetType
} from '../types/index.type'

class CommentUserModel implements TCommentUser {
  id: string
  fristname?: string
  lastname?: string
  avatarUrl?: string

  constructor(data?: Partial<TCommentUser>) {
    this.id = data?.id ?? ''
    this.fristname = data?.fristname ?? ''
    this.lastname = data?.lastname ?? ''
    this.avatarUrl = data?.avatarUrl ?? ''
  }

  get displayName(): string {
    return [this.fristname, this.lastname].filter(Boolean).join(' ') || 'کاربر'
  }
}

export class CommentModel implements TComment {
  id: string
  userId: string
  entityType: TInteractionTargetType
  entityId: string
  content: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
  user?: CommentUserModel

  constructor(data?: Partial<TComment>) {
    this.id = data?.id ?? ''
    this.userId = data?.userId ?? ''
    this.entityType = data?.entityType as TInteractionTargetType
    this.entityId = data?.entityId ?? ''
    this.content = data?.content ?? ''
    this.createdAt = data?.createdAt ?? ''
    this.updatedAt = data?.updatedAt ?? ''
    this.deletedAt = data?.deletedAt ?? null
    this.user = data?.user ? new CommentUserModel(data.user) : undefined
  }

  get authorName(): string {
    return this.user?.displayName || 'کاربر'
  }
}
