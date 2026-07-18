import { useMemo, useState, type FormEvent } from 'react'
import type { NewItemInput } from '../hooks/useFamilySpace'
import {
  MEMBERS,
  SUGGESTED_TAGS,
  normalizeTag,
  parseTags,
  type FamilyMember,
  type ItemTag,
} from '../types'

interface ItemFormProps {
  existingTags: ItemTag[]
  onAdd: (input: NewItemInput) => void
}

export function ItemForm({ existingTags, onAdd }: ItemFormProps) {
  const [title, setTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState<ItemTag[]>([])
  const [customTag, setCustomTag] = useState('')
  const [assignee, setAssignee] = useState<FamilyMember>('みんな')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(true)

  const tagChoices = useMemo(() => {
    return [...new Set([...SUGGESTED_TAGS, ...existingTags, ...selectedTags])]
  }, [existingTags, selectedTags])

  function toggleTag(tag: ItemTag) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  function addCustomTags() {
    const next = parseTags(customTag)
    if (next.length === 0) return
    setSelectedTags((current) => [...new Set([...current, ...next])])
    setCustomTag('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    const pendingCustom = parseTags(customTag)
    const tags = [...new Set([...selectedTags, ...pendingCustom])]
      .map(normalizeTag)
      .filter(Boolean)

    const parsedAmount = amount.trim() === '' ? undefined : Number(amount)

    onAdd({
      title,
      tags,
      assignee,
      date,
      amount:
        parsedAmount !== undefined && !Number.isNaN(parsedAmount)
          ? parsedAmount
          : undefined,
      note,
    })

    setTitle('')
    setSelectedTags([])
    setCustomTag('')
    setAssignee('みんな')
    setDate('')
    setAmount('')
    setNote('')
  }

  return (
    <section className="task-form-panel" aria-labelledby="add-item-heading">
      <div className="task-form-panel__bar">
        <h2 id="add-item-heading">項目を追加</h2>
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
              placeholder="例: 動画サブスクの解約検討 / 運動会 / 夏旅行の予約"
              required
              autoFocus
            />
          </label>

          <div className="field">
            <span>ラベル（自由追加可）</span>
            <div className="filter-options tag-picker">
              {tagChoices.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={
                    selectedTags.includes(tag)
                      ? 'filter-chip is-active'
                      : 'filter-chip'
                  }
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="custom-tag-row">
              <input
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="新しいラベル（カンマ区切り可）"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addCustomTags()
                  }
                }}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={addCustomTags}
              >
                追加
              </button>
            </div>
          </div>

          <div className="field-row">
            <label className="field">
              <span>担当</span>
              <select
                value={assignee}
                onChange={(event) =>
                  setAssignee(event.target.value as FamilyMember)
                }
              >
                {MEMBERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>日付</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <label className="field">
              <span>金額（任意）</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="例: 1490"
              />
            </label>
          </div>

          <label className="field">
            <span>メモ（任意）</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="解約期限の目安、持ち物、支払いメモなど"
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
