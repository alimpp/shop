import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app'
import { ADMIN_ROUTE_PERMISSIONS } from '~/config/navigation'
import { useAdminDS } from '~/dataStore'
import { profileAdminController } from '~/features/profile/admin/controllers/index.controller'

export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('token')
  if (!token.value) {
    return navigateTo('/auth/login')
  }

  if (!to.path.startsWith('/admin')) {
    return
  }

  const matchedKey = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(prefix => to.path === prefix || to.path.startsWith(`${prefix}/`))

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

  const allowed = Boolean(admin.permissions?.[resource]?.view)
  if (!allowed) {
    if (resource !== 'dashboard' && admin.permissions?.dashboard?.view) {
      return navigateTo('/admin/dashboard')
    }
    return navigateTo('/auth/login')
  }
})
