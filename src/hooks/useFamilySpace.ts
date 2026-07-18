import { useEffect, useState } from 'react'
import { createFamilyTaskSpace, FAMILY_SPACE_ID } from '../data/seedSpace'
import type {
  FamilyMember,
  FamilySpace,
  FamilyTask,
  TaskCategory,
  TaskStatus,
} from '../types'

const STORAGE_KEY = 'accounting_software.family_task_space.v1'

export interface NewTaskInput {
  title: string
  category: TaskCategory
  assignee: FamilyMember
  dueDate?: string
  note?: string
}

function loadSpace(): FamilySpace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createFamilyTaskSpace()
    const parsed = JSON.parse(raw) as FamilySpace
    if (parsed?.id !== FAMILY_SPACE_ID || !Array.isArray(parsed.tasks)) {
      return createFamilyTaskSpace()
    }
    return parsed
  } catch {
    return createFamilyTaskSpace()
  }
}

export function useFamilySpace() {
  const [space, setSpace] = useState<FamilySpace>(() => loadSpace())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(space))
  }, [space, ready])

  function addTask(input: NewTaskInput) {
    const title = input.title.trim()
    if (!title) return

    const task: FamilyTask = {
      id: `task-${crypto.randomUUID()}`,
      title,
      category: input.category,
      assignee: input.assignee,
      status: 'todo',
      createdAt: new Date().toISOString(),
      dueDate: input.dueDate || undefined,
      note: input.note?.trim() || undefined,
    }

    setSpace((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
    }))
  }

  function toggleTask(taskId: string) {
    setSpace((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: (task.status === 'done' ? 'todo' : 'done') as TaskStatus,
            }
          : task,
      ),
    }))
  }

  function removeTask(taskId: string) {
    setSpace((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }))
  }

  function resetSpace() {
    const next = createFamilyTaskSpace()
    setSpace(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return {
    space,
    ready,
    addTask,
    toggleTask,
    removeTask,
    resetSpace,
  }
}
