import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

const DEMO_SESSION_KEY = 'docpro_demo_session'

export function isDemoAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(DEMO_SESSION_KEY) === 'true'
}

export function setDemoSession(value: boolean): void {
  if (typeof window === 'undefined') return
  if (value) {
    sessionStorage.setItem(DEMO_SESSION_KEY, 'true')
  } else {
    sessionStorage.removeItem(DEMO_SESSION_KEY)
  }
}

export const checkAuthSession = createServerFn().handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  return session
})

export async function isAuthenticated(): Promise<boolean> {
  if (isDemoAuthenticated()) return true
  try {
    const session = await checkAuthSession()
    return session !== null
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  setDemoSession(false)
  try {
    await import('#/lib/auth-client.ts').then((m) => m.authClient.signOut())
  } catch {
    // ignore
  }
}
