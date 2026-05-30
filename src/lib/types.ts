export type ParticipantStatus =
  | 'registered'
  | 'approved'
  | 'confirmed'
  | 'bib_collected'
  | 'certified'

export interface Participant {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  age: number | null
  tshirt_size: string | null
  status: ParticipantStatus
  bib_number: number | null
  distance: string | null
  role: string | null
  finish_time: string | null
  approved_at: string | null
  confirmed_at: string | null
  certified_at: string | null
}

// ── Task management ──────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export const TASK_CATEGORIES = [
  'Sponsors',
  'T-Shirt',
  'BIB',
  'Volunteers',
  'Logistics',
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]

export interface ChecklistItem {
  text: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  category: string | null
  assignee: string | null
  deadline: string | null
  checklist: ChecklistItem[] | null
  status: TaskStatus
}
