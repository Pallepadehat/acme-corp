import { createAuthClient } from 'better-auth/react'

// The only Better Auth client. Same origin as the page (Vite proxies /api).
export const authClient = createAuthClient()
