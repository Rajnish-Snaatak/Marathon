'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  TASK_CATEGORIES,
  type Task,
  type TaskStatus,
  type ChecklistItem,
} from '@/lib/types'

const COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: 'todo',        label: 'To Do',       accent: 'border-gray-300'   },
  { key: 'in_progress', label: 'In Progress', accent: 'border-blue-400'   },
  { key: 'done',        label: 'Done',        accent: 'border-green-400'  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Sponsors:   'bg-purple-100 text-purple-700',
  'T-Shirt':  'bg-pink-100 text-pink-700',
  BIB:        'bg-amber-100 text-amber-700',
  Volunteers: 'bg-teal-100 text-teal-700',
  Logistics:  'bg-blue-100 text-blue-700',
}

const EMPTY_FORM = {
  id: '',
  title: '',
  category: 'Logistics',
  assignee: '',
  deadline: '',
  status: 'todo' as TaskStatus,
  checklistText: '', // newline-separated in the editor
}

type FormState = typeof EMPTY_FORM

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<string>('All')
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const visible = tasks.filter(t => filter === 'All' || t.category === filter)

  // ── Move a task between columns ─────────────────────────────────────────────
  const moveTask = async (task: Task, status: TaskStatus) => {
    const prev = tasks
    setTasks(ts => ts.map(t => (t.id === task.id ? { ...t, status } : t)))
    const { error } = await supabase.from('tasks').update({ status }).eq('id', task.id)
    if (error) {
      toast.error('Move failed: ' + error.message)
      setTasks(prev)
    }
  }

  // ── Toggle a checklist item ─────────────────────────────────────────────────
  const toggleChecklist = async (task: Task, index: number) => {
    const checklist = (task.checklist ?? []).map((c, i) =>
      i === index ? { ...c, done: !c.done } : c
    )
    const prev = tasks
    setTasks(ts => ts.map(t => (t.id === task.id ? { ...t, checklist } : t)))
    const { error } = await supabase.from('tasks').update({ checklist }).eq('id', task.id)
    if (error) {
      toast.error('Update failed: ' + error.message)
      setTasks(prev)
    }
  }

  // ── Open editor ─────────────────────────────────────────────────────────────
  const openCreate = () => setEditing({ ...EMPTY_FORM })
  const openEdit = (task: Task) =>
    setEditing({
      id: task.id,
      title: task.title,
      category: task.category ?? 'Logistics',
      assignee: task.assignee ?? '',
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      status: task.status,
      checklistText: (task.checklist ?? []).map(c => c.text).join('\n'),
    })

  // ── Save (create or update) ─────────────────────────────────────────────────
  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!editing.title.trim()) { toast.error('Title is required.'); return }
    setSaving(true)

    // Preserve done-state of existing checklist items by text where possible
    const existing = editing.id ? tasks.find(t => t.id === editing.id)?.checklist ?? [] : []
    const checklist: ChecklistItem[] = editing.checklistText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(text => ({
        text,
        done: existing.find(c => c.text === text)?.done ?? false,
      }))

    const payload = {
      title: editing.title.trim(),
      category: editing.category,
      assignee: editing.assignee.trim() || null,
      deadline: editing.deadline || null,
      status: editing.status,
      checklist,
    }

    try {
      if (editing.id) {
        const { data, error } = await supabase
          .from('tasks').update(payload).eq('id', editing.id).select().single()
        if (error) throw error
        setTasks(ts => ts.map(t => (t.id === editing.id ? (data as Task) : t)))
        toast.success('Task updated')
      } else {
        const { data, error } = await supabase
          .from('tasks').insert(payload).select().single()
        if (error) throw error
        setTasks(ts => [...ts, data as Task])
        toast.success('Task created')
      }
      setEditing(null)
    } catch (err) {
      toast.error('Save failed: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {['All', ...TASK_CATEGORIES].map(cat => (
            <button
              key={cat}
              data-testid={`filter-${cat}`}
              onClick={() => setFilter(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          data-testid="new-task-button"
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="task-board">
        {COLUMNS.map(col => {
          const colTasks = visible.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="bg-gray-100 rounded-2xl p-3" data-testid={`column-${col.key}`}>
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <h2 className="text-sm font-bold text-gray-700">{col.label}</h2>
                <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[60px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    accent={col.accent}
                    onMove={moveTask}
                    onToggle={toggleChecklist}
                    onEdit={openEdit}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Editor modal */}
      {editing && (
        <TaskEditor
          form={editing}
          saving={saving}
          onChange={setEditing}
          onSubmit={saveTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task, accent, onMove, onToggle, onEdit,
}: {
  task: Task
  accent: string
  onMove: (t: Task, s: TaskStatus) => void
  onToggle: (t: Task, i: number) => void
  onEdit: (t: Task) => void
}) {
  const checklist = task.checklist ?? []
  const doneCount = checklist.filter(c => c.done).length
  const overdue =
    task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()

  const order: TaskStatus[] = ['todo', 'in_progress', 'done']
  const idx = order.indexOf(task.status)

  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-3`} data-testid="task-card">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-gray-800 leading-snug">{task.title}</p>
        <button
          onClick={() => onEdit(task)}
          className="text-gray-300 hover:text-indigo-500 text-xs shrink-0"
          data-testid="edit-task-button"
        >
          ✏️
        </button>
      </div>

      {task.category && (
        <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          CATEGORY_COLORS[task.category] ?? 'bg-gray-100 text-gray-600'
        }`}>
          {task.category}
        </span>
      )}

      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
        {task.assignee && <p>👤 {task.assignee}</p>}
        {task.deadline && (
          <p className={overdue ? 'text-red-500 font-medium' : ''}>
            📅 {new Date(task.deadline).toLocaleDateString()}{overdue ? ' (overdue)' : ''}
          </p>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2 space-y-1">
          <p className="text-[10px] text-gray-400 font-medium">
            Checklist {doneCount}/{checklist.length}
          </p>
          {checklist.map((item, i) => (
            <label key={i} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(task, i)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className={item.done ? 'line-through text-gray-300' : ''}>{item.text}</span>
            </label>
          ))}
        </div>
      )}

      {/* Move controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <button
          disabled={idx === 0}
          onClick={() => onMove(task, order[idx - 1])}
          className="text-xs text-gray-400 enabled:hover:text-indigo-600 disabled:opacity-30"
          data-testid="move-left"
        >
          ← Move
        </button>
        <button
          disabled={idx === order.length - 1}
          onClick={() => onMove(task, order[idx + 1])}
          className="text-xs text-gray-400 enabled:hover:text-indigo-600 disabled:opacity-30"
          data-testid="move-right"
        >
          Move →
        </button>
      </div>
    </div>
  )
}

// ── Editor modal ──────────────────────────────────────────────────────────────

function TaskEditor({
  form, saving, onChange, onSubmit, onClose,
}: {
  form: FormState
  saving: boolean
  onChange: (f: FormState) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  const set = (k: keyof FormState, v: string) => onChange({ ...form, [k]: v })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        data-testid="task-editor"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {form.id ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              data-testid="task-title-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                data-testid="task-category-select"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                data-testid="task-status-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
              <input
                data-testid="task-assignee-input"
                value={form.assignee}
                onChange={e => set('assignee', e.target.value)}
                placeholder="Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
              <input
                data-testid="task-deadline-input"
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Checklist <span className="text-gray-400">(one item per line)</span>
            </label>
            <textarea
              data-testid="task-checklist-input"
              value={form.checklistText}
              onChange={e => set('checklistText', e.target.value)}
              rows={4}
              placeholder={'Confirm vendor\nSend invoice\nFollow up'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="task-save-button"
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saving…' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
