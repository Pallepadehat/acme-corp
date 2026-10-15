import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header.tsx'
import { getSession } from '@/lib/session.ts'

// A pathless layout: every route under routes/_authed/ needs a signed-in user,
// and gets it from `Route.useRouteContext()`.
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login', search: { redirect: location.href } })
    return { user: session.user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user } = Route.useRouteContext()
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader userName={user.name} />
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
