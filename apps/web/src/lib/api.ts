import { resetSession } from './session.ts'

/** A non-2xx answer from the API. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** `fetch` for our own JSON API: same origin, cookies included, errors thrown. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers },
  })
  if (response.status === 401) {
    // The session ended while the page was open: send them to sign in, then back here.
    resetSession()
    const here = window.location.pathname + window.location.search
    window.location.assign(`/login?redirect=${encodeURIComponent(here)}`)
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(response.status, body?.message ?? response.statusText)
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}
