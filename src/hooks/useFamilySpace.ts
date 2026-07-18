import { useEffect, useMemo, useState } from 'react'
import { createFamilyTaskSpace, FAMILY_SPACE_ID } from '../data/seedSpace'
import type {
  FamilyItem,
  FamilyMember,
  FamilySpace,
  ItemStatus,
  ItemTag,
} from '../types'
import { normalizeTag } from '../types'

const STORAGE_KEY = 'accounting_software.family_life_space.v2'
const LEGACY_STORAGE_KEY = 'accounting_software.family_task_space.v1'

export interface NewItemInput {
  title: string
  tags: ItemTag[]
  assignee: FamilyMember
  date?: string
  amount?: number
  note?: string
}

function loadSpace(): FamilySpace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as FamilySpace
      if (isValidSpace(parsed)) return normalizeSpace(parsed)
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const migrated = migrateLegacy(JSON.parse(legacy))
      if (migrated) return migrated
    }

    return createFamilyTaskSpace()
  } catch {
    return createFamilyTaskSpace()
  }
}

function isValidSpace(value: unknown): value is FamilySpace {
  if (!value || typeof value !== 'object') return false
  const space = value as FamilySpace
  return (
    typeof space.id === 'string' &&
    typeof space.name === 'string' &&
    Array.isArray(space.items)
  )
}

function normalizeSpace(space: FamilySpace): FamilySpace {
  return {
    ...space,
    id: FAMILY_SPACE_ID,
    items: space.items.map((item) => ({
      ...item,
      tags: (item.tags ?? []).map(normalizeTag).filter(Boolean),
      status: item.status === 'done' ? 'done' : 'open',
    })),
  }
}

function migrateLegacy(raw: unknown): FamilySpace | null {
  if (!raw || typeof raw !== 'object') return null
  const legacy = raw as {
    tasks?: Array<{
      id: string
      title: string
      category?: string
      assignee?: FamilyMember
      status?: string
      createdAt?: string
      dueDate?: string
      note?: string
    }>
  }

  if (!Array.isArray(legacy.tasks)) return null

  const base = createFamilyTaskSpace()
  return {
    ...base,
    items: legacy.tasks.map((task) => ({
      id: task.id || `item-${crypto.randomUUID()}`,
      title: task.title,
      tags: task.category ? [normalizeTag(task.category)] : [],
      assignee: task.assignee ?? 'みんな',
      status: task.status === 'done' ? 'done' : 'open',
      createdAt: task.createdAt ?? new Date().toISOString(),
      date: task.dueDate,
      note: task.note,
    })),
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

  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of space.items) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
      .map(([tag]) => tag)
  }, [space.items])

  function addItem(input: NewItemInput) {
    const title = input.title.trim()
    if (!title) return

    const item: FamilyItem = {
      id: `item-${crypto.randomUUID()}`,
      title,
      tags: input.tags.map(normalizeTag).filter(Boolean),
      assignee: input.assignee,
      status: 'open',
      createdAt: new Date().toISOString(),
      date: input.date || undefined,
      amount:
        typeof input.amount === 'number' && !Number.isNaN(input.amount)
          ? input.amount
          : undefined,
      note: input.note?.trim() || undefined,
    }

    setSpace((current) => ({
      ...current,
      items: [item, ...current.items],
    }))
  }

  function toggleItem(itemId: string) {
    setSpace((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: (item.status === 'done' ? 'open' : 'done') as ItemStatus,
            }
          : item,
      ),
    }))
  }

  function removeItem(itemId: string) {
    setSpace((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId),
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
    allTags,
    addItem,
    toggleItem,
    removeItem,
    resetSpace,
  }
}
