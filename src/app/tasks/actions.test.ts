import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelectSingle = vi.fn()
const mockSelectTasks = vi.fn()
const mockGetUser = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSelectSingle,
          })),
        })),
      })),
    }
  }
  return {
    insert: mockInsert,
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: mockUpdate,
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: mockDelete,
        })),
      })),
    })),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createTask, updateTask, updateTaskStatus, deleteTask } from './actions'

const USER = { id: 'user-123', email: 'a@b.com' }
const PROJECT_ID = 'proj-123'
const TASK_ID = 'task-123'
const VALID = { title: 'Test Task' }
const GENERIC_ERROR = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
const AUTH_ERROR = 'Du musst eingeloggt sein.'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: USER } })
  mockSelectSingle.mockResolvedValue({ data: { id: PROJECT_ID } })
})

describe('Task Server Actions', () => {
  describe('createTask', () => {
    it('erstellt Aufgabe und gibt kein error zurück', async () => {
      mockInsert.mockResolvedValue({ error: null })
      const result = await createTask(PROJECT_ID, VALID)
      expect(result.error).toBeUndefined()
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Task', user_id: USER.id, project_id: PROJECT_ID }),
      )
    })

    it('gibt AUTH_ERROR zurück wenn kein User', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await createTask(PROJECT_ID, VALID)
      expect(result.error).toBe(AUTH_ERROR)
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('gibt GENERIC_ERROR bei fremdem Projekt zurück', async () => {
      mockSelectSingle.mockResolvedValue({ data: null })
      const result = await createTask(PROJECT_ID, VALID)
      expect(result.error).toBe(GENERIC_ERROR)
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('gibt GENERIC_ERROR bei DB-Fehler zurück', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'db error' } })
      const result = await createTask(PROJECT_ID, VALID)
      expect(result.error).toBe(GENERIC_ERROR)
    })

    it('gibt Validierungsfehler bei leerem Title zurück', async () => {
      const result = await createTask(PROJECT_ID, { title: '' })
      expect(result.error).toBeTruthy()
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('updateTask', () => {
    it('aktualisiert Aufgabe', async () => {
      mockUpdate.mockResolvedValue({ error: null, data: [{ id: TASK_ID }] })
      const result = await updateTask(TASK_ID, PROJECT_ID, VALID)
      expect(result.error).toBeUndefined()
    })

    it('gibt GENERIC_ERROR wenn Aufgabe nicht gefunden', async () => {
      mockUpdate.mockResolvedValue({ error: null, data: [] })
      const result = await updateTask(TASK_ID, PROJECT_ID, VALID)
      expect(result.error).toBe(GENERIC_ERROR)
    })

    it('gibt AUTH_ERROR zurück wenn kein User', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await updateTask(TASK_ID, PROJECT_ID, VALID)
      expect(result.error).toBe(AUTH_ERROR)
    })
  })

  describe('updateTaskStatus', () => {
    it('aktualisiert Status', async () => {
      mockUpdate.mockResolvedValue({ error: null, data: [{ id: TASK_ID }] })
      const result = await updateTaskStatus(TASK_ID, PROJECT_ID, { status: 'done' })
      expect(result.error).toBeUndefined()
    })

    it('gibt GENERIC_ERROR bei ungültigem Status', async () => {
      const result = await updateTaskStatus(TASK_ID, PROJECT_ID, { status: 'invalid' as any })
      expect(result.error).toBeTruthy()
    })
  })

  describe('deleteTask', () => {
    it('löscht Aufgabe', async () => {
      mockDelete.mockResolvedValue({ error: null })
      const result = await deleteTask(TASK_ID, PROJECT_ID)
      expect(result.error).toBeUndefined()
    })

    it('gibt AUTH_ERROR bei keinem User', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await deleteTask(TASK_ID, PROJECT_ID)
      expect(result.error).toBe(AUTH_ERROR)
    })

    it('gibt GENERIC_ERROR bei fremdem Projekt', async () => {
      mockSelectSingle.mockResolvedValue({ data: null })
      const result = await deleteTask(TASK_ID, PROJECT_ID)
      expect(result.error).toBe(GENERIC_ERROR)
    })
  })
})
