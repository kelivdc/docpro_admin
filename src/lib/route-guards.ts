import { redirect } from '@tanstack/react-router'
import { isAuthenticated } from '#/lib/auth-session'
import { getCurrentAdminClient } from '#/lib/admin-rpc'
import { hasPermission, type CurrentAdmin } from '#/lib/admin-types'
import type { AdminPermission } from '#/lib/mock-data'

export async function requirePermissionRoute(perm: AdminPermission): Promise<CurrentAdmin | null> {
  if (!(await isAuthenticated())) {
    throw redirect({ to: '/login' })
  }
  const admin = await getCurrentAdminClient()
  if (!admin || !hasPermission(admin, perm)) {
    throw redirect({ to: '/dashboard' })
  }
  return admin
}
