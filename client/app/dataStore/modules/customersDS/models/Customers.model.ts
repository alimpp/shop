import type { TCustomer } from "../../../../types/customers/index";

export class CustomerModel {
  id: number
  fullName: string
  mobile: string
  email: string
  userType: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  avatar: string | null

  constructor(data: TCustomer) {
    this.id = data.id
    this.fullName = data.fullName
    this.mobile = data.mobile
    this.email = data.email
    this.userType = data.userType
    this.isActive = data.isActive === 1
    this.lastLoginAt = data.lastLoginAt ?? null
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.avatar = data.avatar ?? null
  }
}