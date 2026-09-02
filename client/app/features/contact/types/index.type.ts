export interface TContactMessage {
  id: string
  name: string
  phone: string
  subject?: string | null
  message: string
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt?: string
}

export interface TCreateContactPayload {
  name: string
  phone: string
  subject?: string
  message: string
}

export interface TContactListQuery {
  filter?: 'all' | 'read' | 'unread'
  search?: string
  page?: number
  limit?: number
}

export interface TContactListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

export interface TContactListData {
  items: TContactMessage[]
  meta: TContactListMeta
}
