import type { FamilyItem, TimeHorizon } from '../types'
import { HORIZON_LABELS } from '../types'
import { formatAmount, formatDisplayDate } from '../lib/timeHorizon'

interface TimelineBoardProps {
  itemsByHorizon: Record<TimeHorizon, FamilyItem[]>
  onToggle: (itemId: string) => void
  onRemove: (itemId: string) => void
}

const ORDER: TimeHorizon[] = [
  'this_month',
  'within_3_months',
  'later',
  'undated',
]

export function TimelineBoard({
  itemsByHorizon,
  onToggle,
  onRemove,
}: TimelineBoardProps) {
  return (
    <section className="timeline-board" aria-label="時間軸で整理された項目">
      {ORDER.map((horizon) => {
        const items = itemsByHorizon[horizon]
        return (
          <div key={horizon} className="horizon-section">
            <div className="panel-heading compact">
              <h2>{HORIZON_LABELS[horizon]}</h2>
              <p>{items.length} 件</p>
            </div>

            {items.length === 0 ? (
              <p className="empty-state soft">まだありません</p>
            ) : (
              <ul className="task-list">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="task-item"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <button
                      type="button"
                      className="task-check"
                      onClick={() => onToggle(item.id)}
                      aria-label={`${item.title} を済にする`}
                    >
                      <span aria-hidden="true" />
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
                        {item.person && <span>人物 {item.person}</span>}
                        <span>{item.assignee}</span>
                        {item.date && (
                          <span>日付 {formatDisplayDate(item.date)}</span>
                        )}
                        {typeof item.amount === 'number' && (
                          <span className="amount-meta">
                            {formatAmount(item.amount)}
                          </span>
                        )}
                      </div>
                      {item.note && <p className="task-note">{item.note}</p>}
                      {item.attachments && item.attachments.length > 0 && (
                        <p className="task-note">
                          添付:{' '}
                          {item.attachments.map((attachment, attachmentIndex) =>
                            attachment.href ? (
                              <span key={attachment.id}>
                                {attachmentIndex > 0 ? ' / ' : ''}
                                <a
                                  href={attachment.href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {attachment.name}
                                </a>
                              </span>
                            ) : (
                              <span key={attachment.id}>
                                {attachmentIndex > 0 ? ' / ' : ''}
                                {attachment.name}
                              </span>
                            ),
                          )}
                        </p>
                      )}
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
          </div>
        )
      })}
    </section>
  )
}
