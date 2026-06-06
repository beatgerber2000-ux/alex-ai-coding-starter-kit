import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase-Server-Client mocken
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockGetUser = vi.fn()

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: (_col: string) => mockUpdate(),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: mockDelete,
    })),
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createProject, renameProject, deleteProject } from './actions'

const USER = { id: 'user-123', email: 'a@b.com' }
const VALID = { name: 'Test Projekt' }
const GENERIC_ERROR = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
const AUTH_ERROR = 'Du musst eingeloggt sein.'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: USER } })
})

describe('createProject', () => {
  it('legt Projekt an und gibt kein error zurück', async () => {
    mockInsert.mockResolvedValue({ error: null })
    const result = await createProject(VALID)
    expect(result.error).toBeUndefined()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Projekt', user_id: USER.id }),
    )
  })

  it('trimmt den Namen serverseitig', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await createProject({ name: '  Mein Projekt  ' })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Mein Projekt' }),
    )
  })

  it('gibt AUTH_ERROR zurück wenn kein User', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await createProject(VALID)
    expect(result.error).toBe(AUTH_ERROR)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('gibt GENERIC_ERROR bei DB-Fehler zurück', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'db error' } })
    const result = await createProject(VALID)
    expect(result.error).toBe(GENERIC_ERROR)
  })

  it('gibt Validierungsfehler bei leerem Namen zurück', async () => {
    const result = await createProject({ name: '' })
    expect(result.error).toBeTruthy()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('sendet user_id niemals vom Client — immer aus Session', async () => {
    mockInsert.mockResolvedValue({ error: null })
    await createProject(VALID)
    const call = mockInsert.mock.calls[0][0]
    expect(call.user_id).toBe(USER.id)
  })
})

describe('renameProject', () => {
  it('benennt Projekt um', async () => {
    mockUpdate.mockResolvedValue({ error: null, data: [{ id: 'proj-1' }] })
    const result = await renameProject('proj-1', { name: 'Neu' })
    expect(result.error).toBeUndefined()
  })

  it('gibt AUTH_ERROR zurück wenn kein User', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await renameProject('proj-1', VALID)
    expect(result.error).toBe(AUTH_ERROR)
  })

  it('gibt GENERIC_ERROR wenn Projekt nicht gefunden (data leer)', async () => {
    mockUpdate.mockResolvedValue({ error: null, data: [] })
    const result = await renameProject('other-proj', VALID)
    expect(result.error).toBe(GENERIC_ERROR)
  })

  it('gibt Validierungsfehler bei leerem Namen zurück', async () => {
    const result = await renameProject('proj-1', { name: '' })
    expect(result.error).toBeTruthy()
  })
})

describe('deleteProject', () => {
  it('löscht Projekt und gibt kein error zurück', async () => {
    mockDelete.mockResolvedValue({ error: null })
    const result = await deleteProject('proj-1')
    expect(result.error).toBeUndefined()
  })

  it('gibt AUTH_ERROR zurück wenn kein User', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await deleteProject('proj-1')
    expect(result.error).toBe(AUTH_ERROR)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('gibt GENERIC_ERROR bei DB-Fehler zurück', async () => {
    mockDelete.mockResolvedValue({ error: { message: 'db error' } })
    const result = await deleteProject('proj-1')
    expect(result.error).toBe(GENERIC_ERROR)
  })

  it('schlägt lautlos fehl wenn Projekt bereits gelöscht (kein DB-Error)', async () => {
    // Supabase DELETE ohne .eq-Match gibt kein error zurück — korrekt, doppeltes Löschen ok
    mockDelete.mockResolvedValue({ error: null })
    const result = await deleteProject('already-deleted')
    expect(result.error).toBeUndefined()
  })
})
