import type { FamilyItem, FamilyMember, ItemStatus, ItemTag } from '../types'

interface ItemListProps {
  items: FamilyItem[]
  availableTags: ItemTag[]
  filterTag: ItemTag | 'すべて'
  filterMember: FamilyMember | 'すべて'
  filterStatus: ItemStatus | 'すべて'
  onFilterTag: (tag: ItemTag | 'すべて') => void
  onFilterMember: (member: FamilyMember | 'すべて') => void
  onFilterStatus: (status: ItemStatus | 'すべて') => void
  onToggle: (itemId: string) => void
  onRemove: (itemId: string) => void
}

const MEMBER_FILTERS: Array<FamilyMember | 'すべて'> = [
  'すべて',
  'みんな',
  'パパ',
  'ママ',
  '子ども',
]

export function ItemList({
  items,
  availableTags,
  filterTag,
  filterMember,
  filterStatus,
  onFilterTag,
  onFilterMember,
  onFilterStatus,
  onToggle,
  onRemove,
}: ItemListProps) {
  const visible = [...items]
    .filter((item) => {
      const tagOk = filterTag === 'すべて' || item.tags.includes(filterTag)
      const memberOk =
        filterMember === 'すべて' || item.assignee === filterMember
      const statusOk =
        filterStatus === 'すべて' || item.status === filterStatus
      return tagOk && memberOk && statusOk
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1
      return (a.date ?? '9999').localeCompare(b.date ?? '9999')
    })

  return (
    <section className="task-list-panel" aria-labelledby="item-list-heading">
      <div className="task-list-panel__header">
        <h2 id="item-list-heading">一覧</h2>
        <p>{visible.length} 件表示</p>
      </div>

      <div className="filters" role="group" aria-label="絞り込み">
        <div className="filter-group">
          <span className="filter-label">ラベル</span>
          <div className="filter-options">
            <button
              type="button"
              className={
                filterTag === 'すべて' ? 'filter-chip is-active' : 'filter-chip'
              }
              onClick={() => onFilterTag('すべて')}
            >
              すべて
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={
                  filterTag === tag ? 'filter-chip is-active' : 'filter-chip'
                }
                onClick={() => onFilterTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">担当</span>
          <div className="filter-options">
            {MEMBER_FILTERS.map((member) => (
              <button
                key={member}
                type="button"
                className={
                  filterMember === member
                    ? 'filter-chip is-active'
                    : 'filter-chip'
                }
                onClick={() => onFilterMember(member)}
              >
                {member}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">状態</span>
          <div className="filter-options">
            {(
              [
                ['すべて', 'すべて'],
                ['open', '未対応'],
                ['done', '済'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filterStatus === value
                    ? 'filter-chip is-active'
                    : 'filter-chip'
                }
                onClick={() => onFilterStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">表示できる項目がありません。</p>
      ) : (
        <ul className="task-list">
          {visible.map((item, index) => (
            <li
              key={item.id}
              className={`task-item ${item.status === 'done' ? 'is-done' : ''}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <button
                type="button"
                className="task-check"
                onClick={() => onToggle(item.id)}
                aria-pressed={item.status === 'done'}
                aria-label={
                  item.status === 'done'
                    ? `${item.title} を未対応に戻す`
                    : `${item.title} を済にする`
                }
              >
                <span aria-hidden="true">
                  {item.status === 'done' ? '✓' : ''}
                </span>
              </button>

              <div className="task-body">
                <div className="task-title-row">
                  <h3>{item.title}</h3>
                  {item.tags.map((tag) => (
                    <span key={tag} className="category-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="task-meta">
                  <span>{item.assignee}</span>
                  {item.date && <span>日付 {formatDate(item.date)}</span>}
                  {typeof item.amount === 'number' && (
                    <span className="amount-meta">
                      {formatAmount(item.amount)}
                    </span>
                  )}
                </div>
                {item.note && <p className="task-note">{item.note}</p>}
              </div>

              <button
                type="button"
                className="ghost-button task-remove"
                onClick={() => onRemove(item.id)}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${year}/${Number(month)}/${Number(day)}`
}

function formatAmount(value: number): string {
  return `¥${value.toLocaleString('ja-JP')}`
}
