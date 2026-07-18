import type { FamilySpace } from '../types'
import { toDateString } from '../lib/timeHorizon'

export const FAMILY_SPACE_ID = 'space-family-life'

export function createFamilyTaskSpace(): FamilySpace {
  const now = new Date().toISOString()

  return {
    id: FAMILY_SPACE_ID,
    name: '家庭ライフ',
    description:
      'インボックスにメモを入れるだけで、今月・3ヶ月以内・今後へ整理します。プリント写真やPDFリンク、親戚の誕生日・お年玉などもメモのまま投げてください。',
    createdAt: now,
    inbox: [
      {
        id: 'inbox-sample-1',
        text: [
          '幼稚園の遠足 10月3日 お弁当持参',
          '祖母の誕生日は3月3日',
          'おじいちゃんからお年玉 1万円もらった',
          'Netflix解約は来月末までに判断',
          'https://example.com/kindergarten/print.pdf',
        ].join('\n'),
        attachments: [],
        createdAt: now,
        status: 'pending',
      },
    ],
    items: [
      {
        id: 'item-1',
        title: '動画サブスクの解約検討',
        tags: ['サブスク'],
        assignee: 'パパ',
        status: 'open',
        createdAt: now,
        date: todayOffset(20),
        amount: 1490,
        note: '無料期間終了の前日までに判断',
      },
      {
        id: 'item-2',
        title: '長男の誕生日プレゼントを用意',
        tags: ['誕生日', '子ども'],
        assignee: 'みんな',
        status: 'open',
        createdAt: now,
        date: monthDayThisYear(8, 12),
        person: '長男',
      },
      {
        id: 'item-3',
        title: '運動会の持ち物確認',
        tags: ['子ども', '学校'],
        assignee: '子ども',
        status: 'open',
        createdAt: now,
        date: todayOffset(14),
      },
      {
        id: 'item-4',
        title: '夏の家族旅行の予約',
        tags: ['旅行', '資金繰り'],
        assignee: 'パパ',
        status: 'open',
        createdAt: now,
        date: todayOffset(45),
        amount: 120000,
        note: '交通費・宿・食費の目安',
      },
      {
        id: 'item-5',
        title: '固定資産税の第2期納付',
        tags: ['資金繰り'],
        assignee: 'ママ',
        status: 'open',
        createdAt: now,
        date: todayOffset(30),
        amount: 85000,
      },
      {
        id: 'item-6',
        title: '叔母の誕生日を祝う',
        tags: ['誕生日', '親戚'],
        assignee: 'みんな',
        status: 'open',
        createdAt: now,
        date: monthDayThisYear(11, 20),
        person: '叔母',
        note: '名前: 由美子さん',
      },
    ],
  }
}

function todayOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

function monthDayThisYear(month: number, day: number): string {
  const now = new Date()
  const date = new Date(now.getFullYear(), month - 1, day)
  if (date < now) date.setFullYear(now.getFullYear() + 1)
  return toDateString(date)
}
