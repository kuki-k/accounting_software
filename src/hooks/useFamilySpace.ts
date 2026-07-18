import { useEffect, useMemo, useState } from 'react'
import { createFamilyTaskSpace, FAMILY_SPACE_ID } from '../data/seedSpace'
import { parseInboxText } from '../lib/parseInbox'
import { getTimeHorizon } from '../lib/timeHorizon'
import type {
  Attachment,
  FamilyItem,
  FamilySpace,
  InboxEntry,
  ItemStatus,
  TimeHorizon,
} from '../types'
import { normalizeTag } from '../types'

const STORAGE_KEY = 'accounting_software.family_life_space.v3'
const LEGACY_V2_KEY = 'accounting_software.family_life_space.v2'
const LEGACY_V1_KEY = 'accounting_software.family_task_space.v1'

export interface DraftAttachmentInput {
  kind: Attachment['kind']
  name: string
  href?: string
  mimeType?: string
}

function loadSpace(): FamilySpace {
  try {
    for (const key of [STORAGE_KEY, LEGACY_V2_KEY]) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as FamilySpace
      if (isValidSpace(parsed)) return normalizeSpace(parsed)
    }

    const legacy = localStorage.getItem(LEGACY_V1_KEY)
    if (legacy) {
      const migrated = migrateLegacyV1(JSON.parse(legacy))
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
  const base = createFamilyTaskSpace()
  return {
    ...base,
    ...space,
    id: FAMILY_SPACE_ID,
    description: space.description || base.description,
    inbox: Array.isArray(space.inbox) ? space.inbox : [],
    items: space.items.map((item) => ({
      ...item,
      tags: (item.tags ?? []).map(normalizeTag).filter(Boolean),
      status: item.status === 'done' ? 'done' : 'open',
      attachments: item.attachments ?? [],
    })),
  }
}

function migrateLegacyV1(raw: unknown): FamilySpace | null {
  if (!raw || typeof raw !== 'object') return null
  const legacy = raw as {
    tasks?: Array<{
      id: string
      title: string
      category?: string
      assignee?: FamilyItem['assignee']
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
    inbox: [],
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

function materializeInboxEntry(entry: InboxEntry): {
  items: FamilyItem[]
  inboxEntry: InboxEntry
} {
  const parsed = parseInboxText(entry.text, entry.attachments)
  const createdAt = new Date().toISOString()
  const items: FamilyItem[] = parsed.map((part) => ({
    id: `item-${crypto.randomUUID()}`,
    title: part.title,
    tags: part.tags,
    assignee: part.assignee,
    status: 'open',
    createdAt,
    date: part.date,
    amount: part.amount,
    person: part.person,
    note: part.note,
    sourceInboxId: entry.id,
    attachments: part.attachments,
  }))

  return {
    items,
    inboxEntry: {
      ...entry,
      status: 'processed',
      processedAt: createdAt,
      producedItemIds: items.map((item) => item.id),
    },
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

  const pendingInbox = useMemo(
    () => space.inbox.filter((entry) => entry.status === 'pending'),
    [space.inbox],
  )

  const itemsByHorizon = useMemo(() => {
    const buckets: Record<TimeHorizon, FamilyItem[]> = {
      this_month: [],
      within_3_months: [],
      later: [],
      undated: [],
    }

    for (const item of space.items.filter((entry) => entry.status === 'open')) {
      buckets[getTimeHorizon(item.date)].push(item)
    }

    for (const key of Object.keys(buckets) as TimeHorizon[]) {
      buckets[key].sort((a, b) =>
        (a.date ?? '9999').localeCompare(b.date ?? '9999'),
      )
    }

    return buckets
  }, [space.items])

  function buildAttachments(
    draftAttachments: DraftAttachmentInput[],
  ): Attachment[] {
    return draftAttachments.map((file) => ({
      id: `att-${crypto.randomUUID()}`,
      kind: file.kind,
      name: file.name,
      href: file.href,
      mimeType: file.mimeType,
    }))
  }

  function queueInbox(text: string, draftAttachments: DraftAttachmentInput[] = []) {
    const body = text.trim()
    if (!body && draftAttachments.length === 0) return

    const entry: InboxEntry = {
      id: `inbox-${crypto.randomUUID()}`,
      text: body,
      attachments: buildAttachments(draftAttachments),
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    setSpace((current) => ({
      ...current,
      inbox: [entry, ...current.inbox],
    }))
  }

  function queueAndProcess(
    text: string,
    draftAttachments: DraftAttachmentInput[] = [],
  ) {
    const body = text.trim()
    const hasDraft = Boolean(body || draftAttachments.length > 0)

    setSpace((current) => {
      let inbox = current.inbox
      if (hasDraft) {
        const entry: InboxEntry = {
          id: `inbox-${crypto.randomUUID()}`,
          text: body,
          attachments: buildAttachments(draftAttachments),
          createdAt: new Date().toISOString(),
          status: 'pending',
        }
        inbox = [entry, ...current.inbox]
      }

      const newItems: FamilyItem[] = []
      const nextInbox = inbox.map((entry) => {
        if (entry.status !== 'pending') return entry
        const result = materializeInboxEntry(entry)
        newItems.push(...result.items)
        return result.inboxEntry
      })

      if (newItems.length === 0 && inbox === current.inbox) return current

      return {
        ...current,
        items: [...newItems, ...current.items],
        inbox: nextInbox,
      }
    })
  }

  function processInboxEntry(entryId: string) {
    let created = 0
    setSpace((current) => {
      const entry = current.inbox.find((item) => item.id === entryId)
      if (!entry || entry.status === 'processed') return current

      const result = materializeInboxEntry(entry)
      created = result.items.length
      return {
        ...current,
        items: [...result.items, ...current.items],
        inbox: current.inbox.map((inboxEntry) =>
          inboxEntry.id === entryId ? result.inboxEntry : inboxEntry,
        ),
      }
    })
    return created
  }

  function processAllPending() {
    let created = 0
    setSpace((current) => {
      const pending = current.inbox.filter((entry) => entry.status === 'pending')
      if (pending.length === 0) return current

      const newItems: FamilyItem[] = []
      const inbox = current.inbox.map((entry) => {
        if (entry.status !== 'pending') return entry
        const result = materializeInboxEntry(entry)
        newItems.push(...result.items)
        return result.inboxEntry
      })

      created = newItems.length
      return {
        ...current,
        items: [...newItems, ...current.items],
        inbox,
      }
    })
    return created
  }

  function removeInboxEntry(entryId: string) {
    setSpace((current) => ({
      ...current,
      inbox: current.inbox.filter((entry) => entry.id !== entryId),
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
    pendingInbox,
    itemsByHorizon,
    queueInbox,
    queueAndProcess,
    processInboxEntry,
    processAllPending,
    removeInboxEntry,
    toggleItem,
    removeItem,
    resetSpace,
  }
}
