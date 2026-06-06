'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { taskSchema, taskStatusSchema, type TaskInput, type TaskStatusInput } from '@/lib/tasks/validation'

export type TaskActionState = {
  error?: string
}

const GENERIC_ERROR = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
const AUTH_ERROR = 'Du musst eingeloggt sein.'

async function checkProjectOwnership(projectId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()
  return !!data
}

export async function createTask(projectId: string, input: TaskInput): Promise<TaskActionState> {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  const ownsProject = await checkProjectOwnership(projectId, user.id)
  if (!ownsProject) return { error: GENERIC_ERROR }

  const { error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
    })

  if (error) return { error: GENERIC_ERROR }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function updateTask(taskId: string, projectId: string, input: TaskInput): Promise<TaskActionState> {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  const ownsProject = await checkProjectOwnership(projectId, user.id)
  if (!ownsProject) return { error: GENERIC_ERROR }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .eq('id', taskId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .select('id')

  if (error || !data?.length) return { error: GENERIC_ERROR }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function updateTaskStatus(taskId: string, projectId: string, input: TaskStatusInput): Promise<TaskActionState> {
  const parsed = taskStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  const ownsProject = await checkProjectOwnership(projectId, user.id)
  if (!ownsProject) return { error: GENERIC_ERROR }

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: parsed.data.status })
    .eq('id', taskId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .select('id')

  if (error || !data?.length) return { error: GENERIC_ERROR }

  revalidatePath(`/projects/${projectId}`)
  return {}
}

export async function deleteTask(taskId: string, projectId: string): Promise<TaskActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: AUTH_ERROR }

  const ownsProject = await checkProjectOwnership(projectId, user.id)
  if (!ownsProject) return { error: GENERIC_ERROR }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) return { error: GENERIC_ERROR }

  revalidatePath(`/projects/${projectId}`)
  return {}
}
