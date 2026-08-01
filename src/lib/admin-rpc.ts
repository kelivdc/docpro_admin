import { createServerFn } from '@tanstack/react-start'
import { getCurrentAdmin } from '#/lib/admin-auth'

export const getCurrentAdminClient = createServerFn().handler(async () => {
  return await getCurrentAdmin()
})
