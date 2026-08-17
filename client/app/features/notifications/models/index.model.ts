import type {
  TNotification,
  TNotificationType
} from '../types/index.type'
import { NOTIFICATION_TYPE_LABELS } from '../types/index.type'

export class NotificationModel implements TNotification {
  id: string
  userId: string
  title: string
  description: string
  type: TNotificationType
  seen: boolean
  created_at: string

  constructor(data?: Partial<TNotification>) {
    this.id = data?.id ?? ''
    this.userId = data?.userId ?? ''
    this.title = data?.title ?? ''
    this.description = data?.description ?? ''
    this.type = data?.type ?? 'message'
    this.seen = data?.seen ?? false
    this.created_at = data?.created_at ?? ''
  }

  get typeLabel(): string {
    return NOTIFICATION_TYPE_LABELS[this.type] || this.type
  }

  get formattedDate(): string {
    if (!this.created_at) return ''
    return new Date(this.created_at).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export class NotificationUserModel {
  id: string
  fristname: string
  lastname: string
  phone: string

  constructor(data?: Partial<NotificationUserModel>) {
    this.id = data?.id ?? ''
    this.fristname = data?.fristname ?? ''
    this.lastname = data?.lastname ?? ''
    this.phone = data?.phone ?? ''
  }

  get displayLabel(): string {
    const name = [this.fristname, this.lastname].filter(Boolean).join(' ')
    return name ? `${name} — ${this.phone}` : this.phone || this.id
  }
}
