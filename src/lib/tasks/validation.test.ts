import { describe, it, expect } from 'vitest'
import { taskSchema, taskStatusSchema } from './validation'

describe('taskSchema', () => {
  it('akzeptiert gültigen Titel', () => {
    expect(taskSchema.safeParse({ title: 'Test' }).success).toBe(true)
  })

  it('akzeptiert Titel mit optionaler Beschreibung', () => {
    const r = taskSchema.safeParse({ title: 'Test', description: 'Desc' })
    expect(r.success).toBe(true)
  })

  it('lehnt leeren Titel ab', () => {
    expect(taskSchema.safeParse({ title: '' }).success).toBe(false)
  })

  it('lehnt nur-Leerzeichen-Titel ab', () => {
    expect(taskSchema.safeParse({ title: '   ' }).success).toBe(false)
  })

  it('akzeptiert Titel mit genau 200 Zeichen', () => {
    expect(taskSchema.safeParse({ title: 'a'.repeat(200) }).success).toBe(true)
  })

  it('lehnt Titel > 200 Zeichen ab', () => {
    expect(taskSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(false)
  })

  it('lehnt Beschreibung > 1000 Zeichen ab', () => {
    expect(taskSchema.safeParse({ title: 'Test', description: 'a'.repeat(1001) }).success).toBe(false)
  })
})

describe('taskStatusSchema', () => {
  it('akzeptiert "todo"', () => {
    expect(taskStatusSchema.safeParse({ status: 'todo' }).success).toBe(true)
  })

  it('akzeptiert "in_progress"', () => {
    expect(taskStatusSchema.safeParse({ status: 'in_progress' }).success).toBe(true)
  })

  it('akzeptiert "done"', () => {
    expect(taskStatusSchema.safeParse({ status: 'done' }).success).toBe(true)
  })

  it('lehnt ungültigen Status ab', () => {
    expect(taskStatusSchema.safeParse({ status: 'invalid' }).success).toBe(false)
  })
})
