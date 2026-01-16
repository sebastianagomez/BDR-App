import { getDailyTasks } from '@/lib/actions/task-actions'
import { TaskList } from '@/components/tasks/TaskList'
import { Card } from '@/components/ui/Card'
import { CheckSquare } from 'lucide-react'

export default async function TasksPage() {
    const tasks = await getDailyTasks()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Tasks</h1>
                    <p className="text-slate-500 mt-1">Focus on these actions today.</p>
                </div>
            </div>

            {tasks.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">No pending tasks for today. Go find some new prospects!</p>
                </Card>
            ) : (
                <TaskList tasks={tasks} />
            )}
        </div>
    )
}
