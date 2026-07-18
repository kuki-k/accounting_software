export type TaskCategory = '掃除' | '買い物' | '料理' | 'その他'

export type FamilyMember = 'みんな' | 'パパ' | 'ママ' | '子ども'

export type TaskStatus = 'todo' | 'done'

export interface FamilyTask {
  id: string
  title: string
  category: TaskCategory
  assignee: FamilyMember
  status: TaskStatus
  createdAt: string
  dueDate?: string
  note?: string
}

export interface FamilySpace {
  id: string
  name: string
  description: string
  createdAt: string
  tasks: FamilyTask[]
}

export const CATEGORIES: TaskCategory[] = ['掃除', '買い物', '料理', 'その他']
export const MEMBERS: FamilyMember[] = ['みんな', 'パパ', 'ママ', '子ども']
