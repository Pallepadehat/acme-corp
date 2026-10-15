import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { authClient } from '@/lib/auth-client.ts'
import { getSession, resetSession } from '@/lib/session.ts'

// Search params are validated, so `?redirect=` is typed everywhere it is read.
// A plain function rather than a Zod schema keeps Zod out of the first bundle.
function validateSearch(search: Record<string, unknown>): { redirect?: string } {
  return typeof search.redirect === 'string' ? { redirect: search.redirect } : {}
}

/** Only paths on this site: `?redirect=https://evil.example` must not work. */
function safeRedirect(target: string | undefined): string {
  return target?.startsWith('/') && !target.startsWith('//') ? target : '/todos'
}

export const Route = createFileRoute('/login')({
  validateSearch,
  beforeLoad: async ({ search }) => {
    if (await getSession()) throw redirect({ href: safeRedirect(search.redirect) })
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const search = Route.useSearch()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setPending(true)
    setError(false)
    const result =
      mode === 'signIn'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(form.get('name')) })
    setPending(false)
    if (result.error) {
      setError(true)
      return
    }
    resetSession()
    router.history.push(safeRedirect(search.redirect))
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>{mode === 'signIn' ? t('auth.signInTitle') : t('auth.signUpTitle')}</h1>
          </CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            {mode === 'signUp' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                required
              />
            </div>
            <p role="status" className="min-h-5 text-destructive text-sm">
              {error ? t('auth.failed') : ''}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {mode === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            >
              {mode === 'signIn' ? t('auth.switchToSignUp') : t('auth.switchToSignIn')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
