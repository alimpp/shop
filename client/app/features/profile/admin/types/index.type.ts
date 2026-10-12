import type { TAdminPermissionsMap } from '~/features/permissions/types/index.type'

export interface TAdmin {
  id: string
  role: 'admin' | 'super_admin' | string
  username: string
  displayName?: string | null
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  isActive?: boolean
  permissions?: TAdminPermissionsMap
  createdAt?: string
  updatedAt?: string
}

export interface TAdminProfileUpdatePayload {
  displayName?: string | null
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  currentPassword?: string
  newPassword?: string
}
