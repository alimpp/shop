export interface TFaq {
  id: string
  question: string
  answer: string
  category?: string | null
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface TFaqListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TFaqListData {
  items: TFaq[]
  meta: TFaqListMeta
}

export interface TFaqListQuery {
  search?: string
  category?: string
  isActive?: boolean
  isFeatured?: boolean
  page?: number
  limit?: number
}

export interface TFaqPayload {
  question: string
  answer: string
  category?: string
  sortOrder?: number
  isActive?: boolean
  isFeatured?: boolean
}
