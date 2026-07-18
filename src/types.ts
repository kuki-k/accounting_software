export type FamilyMember = 'みんな' | 'パパ' | 'ママ' | '子ども'

export type ItemStatus = 'open' | 'done'

export type ItemTag = string

export type TimeHorizon = 'this_month' | 'within_3_months' | 'later' | 'undated'

export type AttachmentKind = 'image' | 'pdf' | 'link' | 'file'

export interface Attachment {
  id: string
  kind: AttachmentKind
  name: string
  /** 外部URLや PDF リンク */
  href?: string
  mimeType?: string
}

export interface FamilyItem {
  id: string
  title: string
  tags: ItemTag[]
  assignee: FamilyMember
  status: ItemStatus
  createdAt: string
  date?: string
  amount?: number
  note?: string
  /** 関連する人物（親戚名・子どもの名前など） */
  person?: string
  sourceInboxId?: string
  attachments?: Attachment[]
}

export type InboxStatus = 'pending' | 'processed'

export interface InboxEntry {
  id: string
  text: string
  attachments: Attachment[]
  createdAt: string
  status: InboxStatus
  processedAt?: string
  producedItemIds?: string[]
}

export interface FamilySpace {
  id: string
  name: string
  description: string
  createdAt: string
  inbox: InboxEntry[]
  items: FamilyItem[]
}

export const MEMBERS: FamilyMember[] = ['みんな', 'パパ', 'ママ', '子ども']

export const SUGGESTED_TAGS: ItemTag[] = [
  'サブスク',
  '誕生日',
  '子ども',
  '幼稚園',
  '学校',
  '親戚',
  '旅行',
  '資金繰り',
  'お年玉',
  '家事',
]

export const HORIZON_LABELS: Record<TimeHorizon, string> = {
  this_month: '今月',
  within_3_months: '3ヶ月以内',
  later: '今後',
  undated: '日付なし・メモ',
}

export function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}
