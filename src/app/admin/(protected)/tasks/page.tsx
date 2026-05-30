import { createClient } from '@/lib/supabase/server'
import TaskBoard from '@/components/TaskBoard'
import type { Task } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load tasks: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Board</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Organize event preparation across the team
        </p>
      </div>
      <TaskBoard initialTasks={(tasks ?? []) as Task[]} />
    </div>
  )
}
