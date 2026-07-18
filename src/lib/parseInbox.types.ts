import type { Attachment, FamilyMember, ItemTag } from '../types'

export type { Attachment }

export interface NewParsedItem {
  title: string
  tags: ItemTag[]
  assignee: FamilyMember
  date?: string
  amount?: number
  person?: string
  note?: string
  attachments?: Attachment[]
}
