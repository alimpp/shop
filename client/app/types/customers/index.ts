export type UserType = 'internal' | 'external' | 'customer'

export interface TCustomer {
  id: number
  fullName: string
  mobile: string
  email: string
  userType: UserType
  isActive: 0 | 1
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  avatar?: string | null
}

export interface IPaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

export interface IPaginatedData<T> {
  meta: IPaginationMeta
  data: T[]
}

export interface TServerResponse<T> {
  success: boolean
  message: string
  data: T
}

export type GetCustomersResponse = TServerResponse<IPaginatedData<TCustomer>>

export interface TAddCustomerPayload {
  fullName: string
  mobile: string
  email: string
  password: string
  is_active: boolean
  role_ids: number[]
}

export interface TAddCustomerResponse {
  success: boolean
  message: string
  data: TCustomer
}