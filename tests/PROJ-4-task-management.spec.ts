import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'supersecret123'

function uniqueEmail() {
  return `qa-task-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`
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
  const newBtn = page.getByRole('button', { name: 'Neues Projekt' })
  const firstBtn = page.getByRole('button', { name: 'Erstes Projekt anlegen' })
  if (await newBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await newBtn.click()
  } else {
    await firstBtn.click()
  }
  await page.getByLabel('Projektname').fill(name)
  await page.getByRole('button', { name: 'Erstellen' }).click()
  await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
}

test.describe('PROJ-4 Aufgabenverwaltung', () => {
  test('Routing-Schutz: nicht eingeloggt → /login', async ({ page }) => {
    await page.goto('/projects/invalid-id')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('Kompletter CRUD-Flow: Register → Projekt → Aufgabe CRUD', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`
    const task1 = 'Erste Aufgabe'
    const task1Desc = 'Beschreibung der ersten'
    const task2 = 'Zweite Aufgabe'

    // === Register & Projekt ===
    await registerAndLogin(page, email)
    await createProject(page, projName)

    // === Navigiere zu Projektdetailseite ===
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    // === TEST: Leerstate ===
    await expect(page.getByText('Noch keine Aufgaben')).toBeVisible()

    // === TEST: Aufgabe anlegen ===
    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByLabel('Titel').fill(task1)
    await page.getByLabel(/Beschreibung/i).fill(task1Desc)
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText(task1)).toBeVisible({ timeout: 5000 })

    // === TEST: Zweite Aufgabe ===
    await page.getByRole('button', { name: 'Neue Aufgabe' }).click()
    await page.getByLabel('Titel').fill(task2)
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText(task2)).toBeVisible({ timeout: 5000 })

    // === TEST: Sortierung (neueste zuerst) ===
    const allText = await page.textContent('body')
    const pos1 = allText?.indexOf(task1) ?? -1
    const pos2 = allText?.indexOf(task2) ?? -1
    expect(pos2).toBeLessThan(pos1)

    // === TEST: Bearbeiten ===
    await page.locator('[data-testid="edit-task"]').first().click()
    const titleInput = page.getByLabel('Titel')
    await expect(titleInput).toHaveValue(task2)
    await titleInput.fill('Geänderter Titel')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Geänderter Titel')).toBeVisible({ timeout: 5000 })

    // === TEST: Status-Änderung ===
    const statusSelect = page.locator('[data-testid="task-status-select"]').first()
    await statusSelect.click()
    await page.getByRole('option', { name: 'In Arbeit' }).click()
    await expect(statusSelect).toContainText('In Arbeit', { timeout: 5000 })

    // === TEST: Löschen ===
    await page.locator('[data-testid="delete-task"]').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /Löschen|Bestätig/i }).first().click()
    await expect(page.getByText('Geänderter Titel')).not.toBeVisible({ timeout: 5000 })

    // === Verify: Letzter Task noch da ===
    await expect(page.getByText(task1)).toBeVisible()
  })

  test('Validierung: Leerer Titel wird abgelehnt', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText(/erforderlich|Fehler/i)).toBeVisible({ timeout: 3000 })
  })

  test('Validierung: Titel > 200 Zeichen wird abgelehnt', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    const longTitle = 'a'.repeat(201)
    await page.getByLabel('Titel').fill(longTitle)
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText(/Fehler|zu lang/i)).toBeVisible({ timeout: 3000 })
  })

  test('Dialog-Abbrechen schließt ohne Änderung', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByLabel('Titel')).not.toBeVisible()
    await expect(page.getByText('Noch keine Aufgaben')).toBeVisible()
  })
})
