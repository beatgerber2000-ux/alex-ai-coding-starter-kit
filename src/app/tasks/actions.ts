'use server'

import type { TaskInput, TaskStatusInput } from '@/lib/tasks/validation'

// Server Actions für PROJ-4 — Seam zum Backend.
// Echte Supabase-Logik (DB-Abfrage, Eigentumscheck, RLS) kommt in /backend.
//
// Sicherheitsvorgaben (siehe Spec Tech Design):
// - user_id NIEMALS vom Client; immer aus auth.uid()
// - project_id und Projekteigentumscheck serverseitig prüfen
// - Keine task_id/project_id/user_id in Fehlermeldungen

export type TaskActionState = {
  error?: string
}

const NOT_WIRED: TaskActionState = {
  error: 'Aufgabendienst noch nicht verbunden. (Wird in /backend fertiggestellt.)',
}

export async function createTask(
  _projectId: string,
  _input: TaskInput,
): Promise<TaskActionState> {
  // TODO(/backend): Projekteigentumscheck + Zod + INSERT mit user_id aus Session
  return NOT_WIRED
}

export async function updateTask(
  _taskId: string,
  _projectId: string,
  _input: TaskInput,
): Promise<TaskActionState> {
  // TODO(/backend): Projekteigentumscheck + Zod + UPDATE
  return NOT_WIRED
}

export async function updateTaskStatus(
  _taskId: string,
  _projectId: string,
  _input: TaskStatusInput,
): Promise<TaskActionState> {
  // TODO(/backend): Projekteigentumscheck + Zod + UPDATE status
  return NOT_WIRED
}

export async function deleteTask(
  _taskId: string,
  _projectId: string,
): Promise<TaskActionState> {
  // TODO(/backend): Projekteigentumscheck + DELETE
  return NOT_WIRED
}
