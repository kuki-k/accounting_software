import type { FamilyMember, FamilyTask, TaskStatus } from '../types'

interface TaskListProps {
  tasks: FamilyTask[]
  filterMember: FamilyMember | 'すべて'
  filterStatus: TaskStatus | 'すべて'
  onFilterMember: (member: FamilyMember | 'すべて') => void
  onFilterStatus: (status: TaskStatus | 'すべて') => void
  onToggle: (taskId: string) => void
  onRemove: (taskId: string) => void
}

const MEMBER_FILTERS: Array<FamilyMember | 'すべて'> = [
  'すべて',
  'みんな',
  'パパ',
  'ママ',
  '子ども',
]

export function TaskList({
  tasks,
  filterMember,
  filterStatus,
  onFilterMember,
  onFilterStatus,
  onToggle,
  onRemove,
}: TaskListProps) {
  const visible = tasks.filter((task) => {
    const memberOk = filterMember === 'すべて' || task.assignee === filterMember
    const statusOk = filterStatus === 'すべて' || task.status === filterStatus
    return memberOk && statusOk
  })

  return (
    <section className="task-list-panel" aria-labelledby="task-list-heading">
      <div className="task-list-panel__header">
        <h2 id="task-list-heading">タスク一覧</h2>
        <p>{visible.length} 件表示</p>
      </div>

      <div className="filters" role="group" aria-label="絞り込み">
        <div className="filter-group">
          <span className="filter-label">担当</span>
          <div className="filter-options">
            {MEMBER_FILTERS.map((member) => (
              <button
                key={member}
                type="button"
                className={
                  filterMember === member ? 'filter-chip is-active' : 'filter-chip'
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
                ['todo', '未完了'],
                ['done', '完了'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filterStatus === value ? 'filter-chip is-active' : 'filter-chip'
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
        <p className="empty-state">表示できるタスクがありません。</p>
      ) : (
        <ul className="task-list">
          {visible.map((task, index) => (
            <li
              key={task.id}
              className={`task-item ${task.status === 'done' ? 'is-done' : ''}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <button
                type="button"
                className="task-check"
                onClick={() => onToggle(task.id)}
                aria-pressed={task.status === 'done'}
                aria-label={
                  task.status === 'done'
                    ? `${task.title} を未完了に戻す`
                    : `${task.title} を完了にする`
                }
              >
                <span aria-hidden="true">{task.status === 'done' ? '✓' : ''}</span>
              </button>

              <div className="task-body">
                <div className="task-title-row">
                  <h3>{task.title}</h3>
                  <span className="category-tag">{task.category}</span>
                </div>
                <div className="task-meta">
                  <span>{task.assignee}</span>
                  {task.dueDate && <span>期限 {formatDate(task.dueDate)}</span>}
                </div>
                {task.note && <p className="task-note">{task.note}</p>}
              </div>

              <button
                type="button"
                className="ghost-button task-remove"
                onClick={() => onRemove(task.id)}
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
  return `${Number(month)}/${Number(day)}`
}
