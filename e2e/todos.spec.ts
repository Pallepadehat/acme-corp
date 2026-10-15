import { expect, test } from '@playwright/test'

test('a signed-out visitor is sent to sign in', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('sign up, manage todos, sign out', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'No account yet? Create one' }).click()
  await page.getByLabel('Name').fill('Ada')
  await page.getByLabel('Email').fill(`ada-${test.info().testId}-${Date.now()}@example.com`)
  await page.getByLabel('Password').fill('correct-horse-battery')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()
  await page.getByRole('textbox', { name: 'What needs doing?' }).fill('Ship it')
  await page.keyboard.press('Enter')
  await expect(page.getByText('1 left')).toBeVisible()

  await page.getByRole('checkbox', { name: 'Ship it' }).click()
  await expect(page.getByText('0 left')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Ship it' })).toBeChecked()

  await page.getByRole('button', { name: 'Ada' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
})
