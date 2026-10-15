import { useRouter } from '@tanstack/react-router'
import { Languages, LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { LANGUAGES } from '@/i18n/config.ts'
import { authClient } from '@/lib/auth-client.ts'
import { resetSession } from '@/lib/session.ts'

export function AppHeader({ userName }: { userName: string }) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    resetSession()
    await router.navigate({ to: '/login' })
  }

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <span className="font-semibold">{t('app.name')}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">{userName}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('settings.theme')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <Sun /> {t('settings.light')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon /> {t('settings.dark')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor /> {t('settings.system')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="size-4" /> {t('settings.language')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={i18n.resolvedLanguage ?? 'en'}
            onValueChange={(code) => void i18n.changeLanguage(code)}
          >
            {LANGUAGES.map((language) => (
              <DropdownMenuRadioItem key={language.code} value={language.code}>
                {language.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void signOut()}>
            <LogOut /> {t('auth.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
