export type FamilyMember = 'みんな' | 'パパ' | 'ママ' | '子ども'

export type ItemStatus = 'open' | 'done'

/** 自由入力のラベル。よく使う候補は SUGGESTED_TAGS にあるが、それ以外も追加できる。 */
export type ItemTag = string

export interface FamilyItem {
  id: string
  title: string
  tags: ItemTag[]
  assignee: FamilyMember
  status: ItemStatus
  createdAt: string
  /** 期限・予定日・解約目安日など、その項目の日付 */
  date?: string
  /** 資金繰り・旅行費・サブスク料金など（任意） */
  amount?: number
  note?: string
}

export interface FamilySpace {
  id: string
  name: string
  description: string
  createdAt: string
  items: FamilyItem[]
}

export const MEMBERS: FamilyMember[] = ['みんな', 'パパ', 'ママ', '子ども']

/** よく使う例。限定列挙ではなく、ユーザーが自由に追加できる。 */
export const SUGGESTED_TAGS: ItemTag[] = [
  'サブスク',
  '誕生日',
  '子ども',
  '旅行',
  '資金繰り',
  '家事',
  '学校',
  '買い物',
]

export function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function parseTags(raw: string): ItemTag[] {
  const separators = /[,\uFF0C\u3001]/
  const parts = raw.split(separators).map(normalizeTag).filter(Boolean)
  const unique = new Set<string>()
  for (const part of parts) unique.add(part)
  return Array.from(unique)
}
