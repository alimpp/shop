import { computed } from 'vue'
import { useAdminDS } from '~/dataStore'
import type {
  TPermissionAction,
  TPermissionResource
} from '~/features/permissions/types/index.type'
import { fullPermissions } from '~/features/permissions/types/index.type'

export function useAdminPermissions() {
  const adminDS = useAdminDS()

  const admin = computed(() => adminDS.getAdmin)
  const isSuperAdmin = computed(() => admin.value.role === 'super_admin')
  const permissions = computed(() => {
    if (isSuperAdmin.value) return fullPermissions()
    return admin.value.permissions ?? {}
  })

  function can(
    resource: TPermissionResource,
    action: TPermissionAction = 'view'
  ): boolean {
    if (isSuperAdmin.value) return true
    return Boolean(permissions.value?.[resource]?.[action])
  }

  function canAny(
    resource: TPermissionResource,
    actions: TPermissionAction[]
  ): boolean {
    return actions.some(action => can(resource, action))
  }

  return {
    admin,
    isSuperAdmin,
    permissions,
    can,
    canAny
  }
}
