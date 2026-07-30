import { createFileRoute, redirect } from '@tanstack/react-router'

import { isDemoAuthenticated } from '#/lib/auth-session.ts'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (isDemoAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/login' })
  },
})
