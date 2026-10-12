import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { ADMIN_ROUTE_PERMISSIONS } from '~/config/navigation'
import { profileAdminController } from '~/features/profile/admin/controllers/index.controller'
import { useAdminDS } from '~/dataStore'
import { fullPermissions } from '~/features/permissions/types/index.type'

export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path
  const matchedKey = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(prefix => path === prefix || path.startsWith(`${prefix}/`))

  if (!matchedKey) return

  const resource = ADMIN_ROUTE_PERMISSIONS[matchedKey]
  const adminDS = useAdminDS()

  if (!adminDS.getAdmin.id) {
    await profileAdminController.getAdminProfile({ silent: true })
  }

  const admin = adminDS.getAdmin
  if (!admin.id) {
    return navigateTo('/auth/login')
  }

  if (admin.role === 'super_admin') return

  const permissions = admin.permissions ?? {}
  const allowed = Boolean(permissions?.[resource]?.view)

  // Fallback: if permissions empty after profile load, deny non-super
  if (!allowed) {
    const hasAny = Object.values(permissions).some(item => item?.view)
    if (!hasAny && admin.role === 'super_admin') {
      adminDS.setAdmin({ ...admin, permissions: fullPermissions() })
      return
    }
    return navigateTo('/admin/dashboard')
  }
})
