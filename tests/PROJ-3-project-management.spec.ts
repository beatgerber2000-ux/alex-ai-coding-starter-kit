import { test, expect, type Page } from '@playwright/test'

// PROJ-3: Projektverwaltung — E2E-Regressionssuite.
// Läuft gegen den Dev-Server mit echter Supabase-Verbindung.
// Legt echte Test-Nutzer und -Projekte an (qa-*@example.com / qa-proj-*).

const PASSWORD = 'supersecret123'

function uniqueEmail() {
  return `qa-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`
}

function uniqueProjectName() {
  return `qa-proj-${Date.now()}`
}

async function registerAndLogin(page: Page, email: string) {
  await page.goto('/register')
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Passwort bestätigen').fill(PASSWORD)
  await page.getByRole('button', { name: 'Registrieren' }).click()
  await expect(page).toHaveURL(/\/projects$/, { timeout: 15000 })
}

async function createProject(page: Page, name: string) {
  // Im Leerstate: „Erstes Projekt anlegen"; danach: „Neues Projekt" im Header.
  const newBtn = page.getByRole('button', { name: 'Neues Projekt' })
  const firstBtn = page.getByRole('button', { name: 'Erstes Projekt anlegen' })
  if (await newBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await newBtn.click()
  } else {
    await firstBtn.click()
  }
  await page.getByLabel('Projektname').fill(name)
  await page.getByRole('button', { name: 'Erstellen' }).click()
}

test.describe('PROJ-3 Projektverwaltung', () => {
  test('Angenommen nicht eingeloggt, wenn /projects aufgerufen wird, dann Redirect zu /login', async ({ page }) => {
    await page.goto('/projects')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('Angenommen eingeloggt, wenn /dashboard aufgerufen wird, dann Redirect zu /projects', async ({ page }) => {
    const email = uniqueEmail()
    await registerAndLogin(page, email)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/projects$/)
  })

  test('Angenommen keine Projekte, wenn /projects aufgerufen wird, dann Leerstate erscheint', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    await expect(page.getByText('Noch keine Projekte')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Erstes Projekt anlegen' })).toBeVisible()
  })

  test('Angenommen Neues-Projekt geklickt, wenn Dialog erscheint, dann Abbrechen schließt ihn ohne Änderung', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    await page.getByRole('button', { name: 'Erstes Projekt anlegen' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Noch keine Projekte')).toBeVisible()
  })

  test('Angenommen gültiger Name, wenn Projekt erstellt wird, dann erscheint es in der Liste', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    const name = uniqueProjectName()
    await page.getByRole('button', { name: 'Erstes Projekt anlegen' }).click()
    await page.getByLabel('Projektname').fill(name)
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(name)).toBeVisible()
  })

  test('Angenommen leerer Name, wenn Projekt erstellt wird, dann Fehlermeldung erscheint', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    await page.getByRole('button', { name: 'Erstes Projekt anlegen' }).click()
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('Projektname ist erforderlich.')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Angenommen Name > 100 Zeichen, wenn Projekt erstellt wird, dann Fehlermeldung erscheint', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    await page.getByRole('button', { name: 'Erstes Projekt anlegen' }).click()
    await page.getByLabel('Projektname').fill('a'.repeat(101))
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('Projektname darf maximal 100 Zeichen lang sein.')).toBeVisible()
  })

  test('Angenommen Stift-Icon geklickt, wenn Dialog erscheint, dann Name ist vorausgefüllt', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    const name = uniqueProjectName()
    await createProject(page, name)
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: `${name} umbenennen` }).click()
    const input = page.getByLabel('Projektname')
    await expect(input).toHaveValue(name)
  })

  test('Angenommen gültiger neuer Name, wenn Umbenennen bestätigt wird, dann Name aktualisiert', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    const oldName = uniqueProjectName()
    const newName = `${uniqueProjectName()}-neu`
    await createProject(page, oldName)
    await expect(page.getByText(oldName)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: `${oldName} umbenennen` }).click()
    await page.getByLabel('Projektname').fill(newName)
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(newName, { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(oldName, { exact: true })).not.toBeVisible({ timeout: 10000 })
  })

  test('Angenommen Löschen-Icon geklickt, wenn Bestätigungsdialog erscheint, dann Abbrechen behält Projekt', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    const name = uniqueProjectName()
    await createProject(page, name)
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: `${name} löschen` }).click()
    await expect(page.getByText('dauerhaft gelöscht')).toBeVisible()
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByText(name)).toBeVisible()
  })

  test('Angenommen Löschen bestätigt, dann Projekt verschwindet aus der Liste', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail())
    const name = uniqueProjectName()
    await createProject(page, name)
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: `${name} löschen` }).click()
    await page.getByRole('button', { name: 'Endgültig löschen' }).click()
    await expect(page.getByText(name)).not.toBeVisible({ timeout: 10000 })
  })
})
