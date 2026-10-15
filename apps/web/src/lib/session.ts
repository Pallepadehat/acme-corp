import type { authClient } from './auth-client.ts'

type Session = typeof authClient.$Infer.Session

declare global {
  interface Window {
    /** Started by the inline script in index.html, before any JavaScript bundle has loaded. */
    __session?: Promise<Session | null> | undefined
  }
}

let current: Promise<Session | null> | undefined

function fetchSession(): Promise<Session | null> {
  return fetch('/api/auth/get-session', { credentials: 'same-origin' })
    .then((response) => (response.ok ? (response.json() as Promise<Session | null>) : null))
    .catch(() => null)
}

/**
 * The signed-in user, or null. Asked once per page load and then remembered, so
 * moving between pages never waits on the network to learn who you are.
 *
 * This is a plain fetch on purpose: the Better Auth client is only needed to
 * sign in and out, and keeping it out of here keeps it out of the first bundle.
 */
export function getSession(): Promise<Session | null> {
  current ??= window.__session ?? fetchSession()
  window.__session = undefined
  return current
}

/** Call after signing in or out. */
export function resetSession(): void {
  current = undefined
}
