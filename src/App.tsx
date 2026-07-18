import { Inbox } from './components/Inbox'
import { TimelineBoard } from './components/TimelineBoard'
import { useFamilySpace } from './hooks/useFamilySpace'
import './App.css'

function App() {
  const {
    space,
    pendingInbox,
    itemsByHorizon,
    queueInbox,
    queueAndProcess,
    processInboxEntry,
    processAllPending,
    removeInboxEntry,
    toggleItem,
    removeItem,
    resetSpace,
  } = useFamilySpace()

  const openCount = space.items.filter((item) => item.status === 'open').length
  const pendingCount = pendingInbox.length

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />

      <header className="space-hero">
        <p className="space-kicker">accounting software</p>
        <h1 className="space-brand">{space.name}</h1>
        <p className="space-lead">{space.description}</p>
        <ol className="howto">
          <li>インボックスにメモ・写真・PDFリンクを入れる</li>
          <li>「整理して反映」で読み取り、項目に分解する</li>
          <li>今月 / 3ヶ月以内 / 今後 に自動で振り分けられる</li>
        </ol>
        <div className="space-cta">
          <a className="primary-button" href="#inbox">
            インボックスへ
          </a>
          <button type="button" className="ghost-button" onClick={resetSpace}>
            初期サンプルに戻す
          </button>
        </div>
      </header>

      <main className="space-main">
        <section className="space-summary" aria-label="スペース概要">
          <div>
            <strong>{pendingCount}</strong>
            <span>未整理メモ</span>
          </div>
          <div>
            <strong>{openCount}</strong>
            <span>未対応</span>
          </div>
          <div>
            <strong>{itemsByHorizon.this_month.length}</strong>
            <span>今月</span>
          </div>
        </section>

        <div id="inbox">
          <Inbox
            pending={pendingInbox}
            onQueue={queueInbox}
            onQueueAndProcess={queueAndProcess}
            onProcessAll={processAllPending}
            onProcessOne={processInboxEntry}
            onRemove={removeInboxEntry}
          />
        </div>

        <TimelineBoard
          itemsByHorizon={itemsByHorizon}
          onToggle={toggleItem}
          onRemove={removeItem}
        />
      </main>
    </div>
  )
}

export default App
