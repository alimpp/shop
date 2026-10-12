import type {
  TAdminPermissionsMap,
  TPermissionAction,
  TPermissionResource
} from '~/features/permissions/types/index.type'

export interface TManagedAdmin {
  id: string
  username: string
  role: 'admin' | 'super_admin' | string
  displayName?: string | null
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  isActive: boolean
  permissions: TAdminPermissionsMap
  createdAt?: string
  updatedAt?: string
}

export interface TAdminPayload {
  username: string
  password?: string
  role?: 'admin' | 'super_admin'
  displayName?: string
  email?: string
  phone?: string
  avatarUrl?: string
  isActive?: boolean
  permissions?: TAdminPermissionsMap
}

export interface TPermissionCatalog {
  resources: Array<{ key: TPermissionResource, label: string }>
  actions: Array<{ key: TPermissionAction, label: string }>
}
