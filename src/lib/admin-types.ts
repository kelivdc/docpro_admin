import type { AdminLevel, AdminPermission } from '#/lib/mock-data'

export type CurrentAdmin = {
  id: string
  userId: string
  level: AdminLevel
  name: string
  email: string
  permissions: AdminPermission[]
}

export function hasPermission(admin: CurrentAdmin, perm: AdminPermission): boolean {
  if (admin.level === 'super') return true
  if (admin.permissions.includes('all')) return true
  if (admin.permissions.includes(perm)) return true
  if (perm === 'users.view' && admin.permissions.includes('users.manage')) return true
  if (perm === 'admins.view' && admin.permissions.includes('admins.manage')) return true
  if (perm === 'documents.view' && admin.permissions.includes('documents.manage')) return true
  return false
}
