import { createContext, useContext, type ReactNode } from 'react'
import type { CurrentAdmin } from '#/lib/admin-types'
import { hasPermission } from '#/lib/admin-types'
import type { AdminPermission } from '#/lib/mock-data'

const CurrentAdminContext = createContext<CurrentAdmin | null>(null)

export function CurrentAdminProvider({ admin, children }: { admin: CurrentAdmin | null; children: ReactNode }) {
  return (
    <CurrentAdminContext.Provider value={admin}>
      {children}
    </CurrentAdminContext.Provider>
  )
}

export function useCurrentAdmin(): CurrentAdmin | null {
  return useContext(CurrentAdminContext)
}

export function useHasPermission(perm: AdminPermission): boolean {
  const admin = useCurrentAdmin()
  return admin ? hasPermission(admin, perm) : false
}
