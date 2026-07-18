import { useState, type FormEvent } from 'react'
import type { NewTaskInput } from '../hooks/useFamilySpace'
import { CATEGORIES, MEMBERS, type FamilyMember, type TaskCategory } from '../types'

interface TaskFormProps {
  onAdd: (input: NewTaskInput) => void
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>('その他')
  const [assignee, setAssignee] = useState<FamilyMember>('みんな')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    onAdd({ title, category, assignee, dueDate, note })
    setTitle('')
    setCategory('その他')
    setAssignee('みんな')
    setDueDate('')
    setNote('')
    setOpen(false)
  }

  return (
    <section className="task-form-panel" aria-labelledby="add-task-heading">
      <div className="task-form-panel__bar">
        <h2 id="add-task-heading">タスクを追加</h2>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? '閉じる' : '開く'}
        </button>
      </div>

      {open && (
        <form className="task-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>内容</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: お風呂掃除"
              required
              autoFocus
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>カテゴリ</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TaskCategory)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>担当</span>
              <select
                value={assignee}
                onChange={(event) => setAssignee(event.target.value as FamilyMember)}
              >
                {MEMBERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>期限</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>メモ（任意）</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="買い物リストや補足"
            />
          </label>

          <button type="submit" className="primary-button">
            スペースに追加
          </button>
        </form>
      )}
    </section>
  )
}
