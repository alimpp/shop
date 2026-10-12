import { emptyPermissions } from '~/features/permissions/types/index.type'
import type { TAdminPermissionsMap } from '~/features/permissions/types/index.type'
import type { TAdmin } from '../types/index.type'

export class AdminModel implements TAdmin {
  id: string
  username: string
  role: string
  displayName: string | null
  email: string | null
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  permissions: TAdminPermissionsMap
  createdAt?: string
  updatedAt?: string

  constructor(data?: Partial<TAdmin>) {
    this.id = data?.id ?? ''
    this.username = data?.username ?? ''
    this.role = data?.role ?? ''
    this.displayName = data?.displayName ?? null
    this.email = data?.email ?? null
    this.phone = data?.phone ?? null
    this.avatarUrl = data?.avatarUrl ?? null
    this.isActive = data?.isActive ?? true
    this.permissions = data?.permissions ?? emptyPermissions()
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
  }

  static empty(): AdminModel {
    return new AdminModel()
  }
}
