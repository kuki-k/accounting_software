import { useState } from 'react'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useFamilySpace } from './hooks/useFamilySpace'
import type { FamilyMember, TaskStatus } from './types'
import './App.css'

function App() {
  const { space, addTask, toggleTask, removeTask, resetSpace } = useFamilySpace()
  const [filterMember, setFilterMember] = useState<FamilyMember | 'すべて'>('すべて')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'すべて'>('todo')

  const todoCount = space.tasks.filter((task) => task.status === 'todo').length
  const doneCount = space.tasks.filter((task) => task.status === 'done').length

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />

      <header className="space-hero">
        <p className="space-kicker">accounting software</p>
        <h1 className="space-brand">{space.name}</h1>
        <p className="space-lead">{space.description}</p>
        <div className="space-cta">
          <a className="primary-button" href="#tasks">
            タスクを見る
          </a>
          <button type="button" className="ghost-button" onClick={resetSpace}>
            初期サンプルに戻す
          </button>
        </div>
      </header>

      <main id="tasks" className="space-main">
        <section className="space-summary" aria-label="スペース概要">
          <div>
            <strong>{todoCount}</strong>
            <span>未完了</span>
          </div>
          <div>
            <strong>{doneCount}</strong>
            <span>完了</span>
          </div>
          <div>
            <strong>{space.tasks.length}</strong>
            <span>合計</span>
          </div>
        </section>

        <TaskForm onAdd={addTask} />

        <TaskList
          tasks={space.tasks}
          filterMember={filterMember}
          filterStatus={filterStatus}
          onFilterMember={setFilterMember}
          onFilterStatus={setFilterStatus}
          onToggle={toggleTask}
          onRemove={removeTask}
        />
      </main>
    </div>
  )
}

export default App
