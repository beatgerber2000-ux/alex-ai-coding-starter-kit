import { test, expect, type Page } from '@playwright/test'

// PROJ-2: Authentifizierung — E2E-Regressionssuite.
// Läuft gegen den Dev-Server (Playwright webServer) mit echter Supabase-Verbindung.
// Voraussetzung: Supabase "Confirm email" ist deaktiviert.
//
// Routing-Hinweis (PROJ-3): Login/Register leiten jetzt auf /projects weiter
// (war: /dashboard). /dashboard selbst leitet auf /projects weiter.
//
// Hinweis: Registrierungstests legen echte Test-Nutzer in Supabase an
// (eindeutige qa-*@example.com-Adressen). Für ein Übungsprojekt akzeptabel.

const PASSWORD = 'supersecret123'

function uniqueEmail() {
  return `qa-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`
}

async function fillRegister(
  page: Page,
  email: string,
  password = PASSWORD,
  confirm = password,
) {
  await page.goto('/register')
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort', { exact: true }).fill(password)
  await page.getByLabel('Passwort bestätigen').fill(confirm)
  await page.getByRole('button', { name: 'Registrieren' }).click()
}

async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login')
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Anmelden' }).click()
}

test.describe('PROJ-2 Authentifizierung', () => {
  test('Angenommen nicht eingeloggt, wenn /dashboard aufgerufen wird, dann Redirect zu /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('Angenommen gültige Daten, wenn registriert wird, dann sofort eingeloggt auf /projects', async ({ page }) => {
    await fillRegister(page, uniqueEmail())
    await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })
    await expect(page.getByText('Meine Projekte')).toBeVisible()
  })

  test('Angenommen registriert, wenn Logout → erneuter Login → Reload, dann bleibt die Session erhalten', async ({ page }) => {
    const email = uniqueEmail()

    await fillRegister(page, email)
    await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 15000 })

    // Nach Logout ist /projects nicht mehr erreichbar
    await page.goto('/projects')
    await expect(page).toHaveURL(/\/login$/)

    // Erneuter Login
    await login(page, email)
    await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })

    // Session bleibt über Reload bestehen
    await page.reload()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.getByText('Meine Projekte')).toBeVisible()
  })

  test('Angenommen eingeloggt, wenn /login aufgerufen wird, dann Redirect zu /projects', async ({ page }) => {
    await fillRegister(page, uniqueEmail())
    await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })
    await page.goto('/login')
    await expect(page).toHaveURL(/\/projects$/)
  })

  test('Angenommen leeres Registrierungsformular, wenn abgeschickt, dann feldbezogene Fehler', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Registrieren' }).click()
    await expect(page.getByText('E-Mail ist erforderlich.')).toBeVisible()
    await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein.')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('Angenommen Passwort < 8 Zeichen, wenn registriert, dann Mindestlängen-Fehler', async ({ page }) => {
    await fillRegister(page, uniqueEmail(), 'short', 'short')
    await expect(page.getByText('Das Passwort muss mindestens 8 Zeichen lang sein.')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('Angenommen Passwörter weichen ab, wenn registriert, dann Fehler am Bestätigungsfeld', async ({ page }) => {
    await fillRegister(page, uniqueEmail(), PASSWORD, 'anderspass123')
    await expect(page.getByText('Die Passwörter stimmen nicht überein.')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('Angenommen ungültiges E-Mail-Format, wenn registriert, dann Formatfehler', async ({ page }) => {
    await fillRegister(page, 'keine-mail', PASSWORD, PASSWORD)
    await expect(page.getByText('Bitte eine gültige E-Mail-Adresse eingeben.')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('Angenommen falsche Login-Kombination, wenn abgeschickt, dann generische Fehlermeldung', async ({ page }) => {
    await login(page, uniqueEmail(), 'falschespasswort')
    await expect(page.getByText('E-Mail oder Passwort falsch.')).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/\/login$/)
  })

  test('Angenommen E-Mail bereits registriert, wenn erneut registriert, dann neutrale Meldung', async ({ page }) => {
    const email = uniqueEmail()
    await fillRegister(page, email)
    await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })

    // Logout, damit /register nicht durch die Middleware umgeleitet wird
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 15000 })

    await fillRegister(page, email)
    await expect(
      page.getByText('Registrierung konnte nicht abgeschlossen werden. Bitte versuche es mit einer anderen E-Mail oder melde dich an.'),
    ).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/\/register$/)
  })
})
