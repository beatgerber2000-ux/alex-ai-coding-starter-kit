import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'supersecret123'

function uniqueEmail() {
  return `qa-proj5-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`
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

test.describe('PROJ-5 Aufgabenansicht nach Status', () => {
  test('Gruppierung & Empty-States: Tasks in korrekter Gruppe mit Anzahl und Leertext', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    // === TEST: Alle Gruppen leer ===
    await expect(page.getByText(/Noch keine to-do/i)).toBeVisible()
    await expect(page.getByText(/Noch keine in-arbeit/i)).toBeVisible()
    await expect(page.getByText(/Noch keine erledigt/i)).toBeVisible()

    // Erstelle 1 To Do Task
    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByLabel('Titel').fill('Task 1')
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('Task 1')).toBeVisible({ timeout: 5000 })

    // === TEST: To Do (1), andere (0) ===
    await expect(page.getByText(/To Do \(1\)/)).toBeVisible()
    await expect(page.getByText(/In Arbeit \(0\)/)).toBeVisible()
    await expect(page.getByText(/Erledigt \(0\)/)).toBeVisible()
    await expect(page.getByText(/Noch keine in-arbeit/i)).toBeVisible()
    await expect(page.getByText(/Noch keine erledigt/i)).toBeVisible()
  })

  test('Statuswechsel: Task wechselt in neue Gruppe, Anzahl aktualisiert', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    // Erstelle Task (default: To Do)
    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByLabel('Titel').fill('Moving Task')
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('Moving Task')).toBeVisible({ timeout: 5000 })

    // === TEST: Task startet in To Do (1) ===
    await expect(page.getByText(/To Do \(1\)/)).toBeVisible()

    // Wechsel zu In Arbeit
    const statusSelect = page.locator('[data-testid="task-status-select"]').first()
    await statusSelect.click()
    await page.getByRole('option', { name: 'In Arbeit' }).click()

    // === TEST: Task in In Arbeit, Anzahl aktualisiert ===
    await expect(page.getByText(/To Do \(0\)/)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/In Arbeit \(1\)/)).toBeVisible()
    await expect(page.getByText('Moving Task')).toBeVisible()

    // Wechsel zu Erledigt
    await statusSelect.click()
    await page.getByRole('option', { name: 'Erledigt' }).click()

    // === TEST: Task in Erledigt ===
    await expect(page.getByText(/In Arbeit \(0\)/)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Erledigt \(1\)/)).toBeVisible()
  })

  test('PROJ-4 Regression: Create/Edit/Delete funktioniert in gruppierter Ansicht', async ({ page }) => {
    const email = uniqueEmail()
    const projName = `proj-${Date.now()}`

    await registerAndLogin(page, email)
    await createProject(page, projName)
    await page.getByText(projName).click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 10000 })

    // === TEST: Erstellen ===
    await page.getByRole('button', { name: /Erste Aufgabe anlegen|Neue Aufgabe/ }).click()
    await page.getByLabel('Titel').fill('CRUD Task')
    await page.getByLabel(/Beschreibung/i).fill('Beschreibung')
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('CRUD Task')).toBeVisible({ timeout: 5000 })

    // === TEST: Bearbeiten ===
    await page.locator('[data-testid="edit-task"]').first().click()
    await page.getByLabel('Titel').fill('CRUD Task Updated')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('CRUD Task Updated')).toBeVisible({ timeout: 5000 })

    // === TEST: Löschen ===
    await page.locator('[data-testid="delete-task"]').first().click()
    await page.getByRole('button', { name: /Löschen|Bestätig/i }).first().click()
    await expect(page.getByText('CRUD Task Updated')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/To Do \(0\)/)).toBeVisible()
  })
})
