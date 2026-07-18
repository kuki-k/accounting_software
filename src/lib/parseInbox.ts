import type { Attachment, FamilyMember, ItemTag } from '../types'
import type { NewParsedItem } from './parseInbox.types'
import { toDateString } from './timeHorizon'

export type { NewParsedItem }

const TAG_KEYWORDS: Array<{ pattern: RegExp; tag: ItemTag }> = [
  {
    pattern: /サブスク|解約|Netflix|ネットフリ|Amazon\s*プライム|プライム/i,
    tag: 'サブスク',
  },
  { pattern: /誕生日|バースデイ/, tag: '誕生日' },
  { pattern: /幼稚園|保育園/, tag: '幼稚園' },
  {
    pattern: /学校|小学校|中学校|運動会|授業参観|懇談|プリント/,
    tag: '学校',
  },
  { pattern: /子ども|子供|息子|娘|長男|長女/, tag: '子ども' },
  {
    pattern: /親戚|祖母|祖父|おじい|おばあ|叔父|叔母|おじさん|おばさん|いとこ/,
    tag: '親戚',
  },
  { pattern: /お年玉|おとしだま/, tag: 'お年玉' },
  { pattern: /旅行|出張|帰省|ホテル|宿/, tag: '旅行' },
  {
    pattern: /税金|納付|資金|給料|振込|支払|お金|家計/,
    tag: '資金繰り',
  },
  { pattern: /掃除|洗濯|料理|買い物/, tag: '家事' },
]

const PERSON_PATTERNS = [
  /([一-龯ぁ-んァ-ンA-Za-z]{1,12})さん/,
  /(おじいちゃん|おばあちゃん|祖父|祖母|おじさん|おばさん|叔父|叔母|いとこ)/,
  /(長男|長女|次男|次女|息子|娘)/,
]

const URL_PATTERN = /https?:\/\/[^\s]+/gi

export function parseInboxText(
  text: string,
  attachments: Attachment[] = [],
  now = new Date(),
): NewParsedItem[] {
  const trimmed = text.trim()
  const urls = trimmed.match(URL_PATTERN) ?? []
  const withoutUrls = trimmed.replace(URL_PATTERN, ' ').trim()

  const linkAttachments: Attachment[] = urls.map((href, index) => ({
    id: `att-link-${index}-${hash(href)}`,
    kind: href.toLowerCase().includes('.pdf') ? 'pdf' : 'link',
    name: href,
    href,
  }))

  const allAttachments = [...attachments, ...linkAttachments]
  const chunks = splitIntoChunks(withoutUrls)

  if (chunks.length === 0 && allAttachments.length > 0) {
    return [
      {
        title: allAttachments[0]?.name || '添付ファイル',
        tags: inferTags('プリント 添付'),
        assignee: 'みんな',
        note: '添付から取り込み（内容メモがあれば追記してください）',
        attachments: allAttachments,
      },
    ]
  }

  return chunks.map((chunk, index) => {
    const amount = extractAmount(chunk)
    const date = extractDate(chunk, now)
    const person = extractPerson(chunk)
    const tags = inferTags(chunk)
    const assignee = inferAssignee(chunk)
    const title = cleanTitle(chunk)

    return {
      title: title || fallbackTitle(person, amount, date, index),
      tags,
      assignee,
      date,
      amount,
      person,
      note: shouldKeepNote(chunk, title) ? chunk : undefined,
      attachments: index === 0 ? allAttachments : undefined,
    }
  })
}

function splitIntoChunks(text: string): string[] {
  if (!text) return []

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s・\-*•●○]+/, '').trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    const bySentence = text
      .split(/[。！？\n]+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 2)
    return bySentence.length > 1 ? bySentence : [text.trim()]
  }

  return lines
}

function extractAmount(text: string): number | undefined {
  const yenMark = /[¥￥]\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/.exec(text)
  if (yenMark?.[1]) return Number(yenMark[1].replace(/,/g, ''))

  const yenWord = /([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*円/.exec(text)
  if (yenWord?.[1]) return Number(yenWord[1].replace(/,/g, ''))

  const man = /([0-9]+(?:\.[0-9]+)?)\s*万\s*円?/.exec(text)
  if (man?.[1]) return Math.round(Number(man[1]) * 10000)

  return undefined
}

function extractDate(text: string, now: Date): string | undefined {
  const iso = /(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})日?/.exec(text)
  if (iso) {
    return normalizeYmd(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  }

  const md = /(\d{1,2})月(\d{1,2})日/.exec(text)
  if (md) {
    const month = Number(md[1])
    const day = Number(md[2])
    let year = now.getFullYear()
    const candidate = new Date(year, month - 1, day)
    if (candidate < startOfDay(now)) year += 1
    return normalizeYmd(year, month, day)
  }

  if (/今月末|今月中/.test(text)) {
    return toDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  }

  if (/来月末/.test(text)) {
    return toDateString(new Date(now.getFullYear(), now.getMonth() + 2, 0))
  }

  if (/来月/.test(text)) {
    return toDateString(
      new Date(now.getFullYear(), now.getMonth() + 1, Math.min(now.getDate(), 28)),
    )
  }

  if (/来週/.test(text)) {
    const next = new Date(now)
    next.setDate(now.getDate() + 7)
    return toDateString(next)
  }

  if (/再来月|3ヶ月後|三ヶ月後/.test(text)) {
    return toDateString(
      new Date(now.getFullYear(), now.getMonth() + 3, Math.min(now.getDate(), 28)),
    )
  }

  return undefined
}

function extractPerson(text: string): string | undefined {
  for (const pattern of PERSON_PATTERNS) {
    const match = pattern.exec(text)
    if (match?.[1]) return match[1]
  }
  return undefined
}

function inferTags(text: string): ItemTag[] {
  const tags = new Set<ItemTag>()
  for (const { pattern, tag } of TAG_KEYWORDS) {
    if (pattern.test(text)) tags.add(tag)
  }
  return Array.from(tags)
}

function inferAssignee(text: string): FamilyMember {
  if (/パパ|父|お父さん|旦那/.test(text)) return 'パパ'
  if (/ママ|母|お母さん|妻/.test(text)) return 'ママ'
  if (/子ども|子供|息子|娘|幼稚園|学校/.test(text)) return '子ども'
  return 'みんな'
}

function cleanTitle(text: string): string {
  return text
    .replace(/\d{4}[/\-年]\d{1,2}[/\-月]\d{1,2}日?/g, ' ')
    .replace(/\d{1,2}月\d{1,2}日/g, ' ')
    .replace(/(?:今月末|今月中|来月末|来月|来週|再来月|3ヶ月後|三ヶ月後)/g, ' ')
    .replace(/[¥￥]\s*[0-9,]+/g, ' ')
    .replace(/[0-9,]+\s*円/g, ' ')
    .replace(/[0-9.]+\s*万\s*円?/g, ' ')
    .replace(/は(?=まで)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[はをがにでと]\s*$/g, '')
    .trim()
    .slice(0, 80)
}

function fallbackTitle(
  person: string | undefined,
  amount: number | undefined,
  date: string | undefined,
  index: number,
): string {
  if (person) return `${person}の予定`
  if (amount !== undefined) return `金額メモ ${amount}円`
  if (date) return `${date} の予定`
  return `メモ ${index + 1}`
}

function shouldKeepNote(chunk: string, title: string): boolean {
  return chunk.length > title.length + 8
}

function normalizeYmd(
  year: number,
  month: number,
  day: number,
): string | undefined {
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return toDateString(date)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function hash(value: string): string {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}
