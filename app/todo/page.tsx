import { PersonalTaskList } from '@/components/todo/PersonalTaskList'
import { getPersonalTasks, autoMoveOverdueTasks } from '@/lib/actions/personal-task-actions'
import { Card } from '@/components/ui/Card'

export default async function TodoPage() {
    // Auto-move overdue tasks on page load (simple trigger)
    await autoMoveOverdueTasks()

    const tasks = await getPersonalTasks()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Personal To-Do List</h1>
                    <p className="text-slate-500 mt-1">Keep track of your extra tasks and goals.</p>
                </div>
            </div>

            <PersonalTaskList initialTasks={tasks} />
        </div>
    )
}
