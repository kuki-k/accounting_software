import type { FamilySpace } from '../types'

export const FAMILY_SPACE_ID = 'space-family-tasks'

export function createFamilyTaskSpace(): FamilySpace {
  const now = new Date().toISOString()

  return {
    id: FAMILY_SPACE_ID,
    name: '家庭タスク',
    description: '家族で共有する日々の家事・用事をまとめるスペースです。',
    createdAt: now,
    tasks: [
      {
        id: 'task-1',
        title: 'リビングの掃除機がけ',
        category: '掃除',
        assignee: 'みんな',
        status: 'todo',
        createdAt: now,
        dueDate: todayOffset(0),
      },
      {
        id: 'task-2',
        title: '週末の食材を買う',
        category: '買い物',
        assignee: 'パパ',
        status: 'todo',
        createdAt: now,
        dueDate: todayOffset(1),
        note: '牛乳・卵・野菜',
      },
      {
        id: 'task-3',
        title: '夕食の下ごしらえ',
        category: '料理',
        assignee: 'ママ',
        status: 'todo',
        createdAt: now,
        dueDate: todayOffset(0),
      },
    ],
  }
}

function todayOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
