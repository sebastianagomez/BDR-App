import { getDailyTasks } from '@/lib/actions/task-actions'
import { TaskList } from '@/components/tasks/TaskList'
import { Card } from '@/components/ui/Card'
import { CheckSquare } from 'lucide-react'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
    const tasks = await getDailyTasks()

    // Fetch completed count for today
    const { count: completedCount } = await supabaseServer
        .from('daily_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date().toISOString().split('T')[0])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Tasks</h1>
                    <p className="text-slate-500 mt-1">Focus on these actions today.</p>
                </div>
            </div>

            <TaskList initialTasks={tasks} completedCount={completedCount || 0} />
        </div>
    )
}
