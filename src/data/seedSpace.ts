import type { FamilySpace } from '../types'

export const FAMILY_SPACE_ID = 'space-family-life'

export function createFamilyTaskSpace(): FamilySpace {
  const now = new Date().toISOString()

  return {
    id: FAMILY_SPACE_ID,
    name: '家庭ライフ',
    description:
      'サブスク解約の目安、誕生日、子どもの行事、旅行、資金繰りなど、家庭で忘れずに押さえたいことをまとめるスペースです。ラベルは自由に増やせます。',
    createdAt: now,
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
        note: '欲しいものリストを聞く',
      },
      {
        id: 'item-3',
        title: '運動会の持ち物確認',
        tags: ['子ども', '学校'],
        assignee: 'ママ',
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
  if (date < now) {
    date.setFullYear(now.getFullYear() + 1)
  }
  return toDateString(date)
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
