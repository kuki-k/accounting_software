import { useState } from 'react'
import { ItemForm } from './components/ItemForm'
import { ItemList } from './components/ItemList'
import { useFamilySpace } from './hooks/useFamilySpace'
import type { FamilyMember, ItemStatus, ItemTag } from './types'
import './App.css'

function App() {
  const { space, allTags, addItem, toggleItem, removeItem, resetSpace } =
    useFamilySpace()
  const [filterTag, setFilterTag] = useState<ItemTag | 'すべて'>('すべて')
  const [filterMember, setFilterMember] = useState<FamilyMember | 'すべて'>(
    'すべて',
  )
  const [filterStatus, setFilterStatus] = useState<ItemStatus | 'すべて'>('open')

  const openCount = space.items.filter((item) => item.status === 'open').length
  const doneCount = space.items.filter((item) => item.status === 'done').length
  const moneyTotal = space.items
    .filter((item) => item.status === 'open' && typeof item.amount === 'number')
    .reduce((sum, item) => sum + (item.amount ?? 0), 0)

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />

      <header className="space-hero">
        <p className="space-kicker">accounting software</p>
        <h1 className="space-brand">{space.name}</h1>
        <p className="space-lead">{space.description}</p>
        <div className="space-cta">
          <a className="primary-button" href="#items">
            一覧を見る
          </a>
          <button type="button" className="ghost-button" onClick={resetSpace}>
            初期サンプルに戻す
          </button>
        </div>
      </header>

      <main id="items" className="space-main">
        <section className="space-summary" aria-label="スペース概要">
          <div>
            <strong>{openCount}</strong>
            <span>未対応</span>
          </div>
          <div>
            <strong>{doneCount}</strong>
            <span>済</span>
          </div>
          <div>
            <strong>{formatCompactYen(moneyTotal)}</strong>
            <span>未対応の金額合計</span>
          </div>
        </section>

        <ItemForm existingTags={allTags} onAdd={addItem} />

        <ItemList
          items={space.items}
          availableTags={allTags}
          filterTag={filterTag}
          filterMember={filterMember}
          filterStatus={filterStatus}
          onFilterTag={setFilterTag}
          onFilterMember={setFilterMember}
          onFilterStatus={setFilterStatus}
          onToggle={toggleItem}
          onRemove={removeItem}
        />
      </main>
    </div>
  )
}

function formatCompactYen(value: number): string {
  if (value === 0) return '¥0'
  if (value >= 10000) {
    const man = value / 10000
    return `¥${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万`
  }
  return `¥${value.toLocaleString('ja-JP')}`
}

export default App
