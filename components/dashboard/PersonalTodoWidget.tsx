'use client'

import { useState, useTransition } from 'react'
import { createPersonalTask, togglePersonalTask, PersonalTask } from '@/lib/actions/personal-task-actions'
import { Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

export function PersonalTodoWidget({ tasks }: { tasks: PersonalTask[] }) {
    const [newTask, setNewTask] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleQuickAdd = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTask.trim()) {
            e.preventDefault()
            const formData = new FormData()
            formData.append('title', newTask)
            formData.append('due_date', new Date().toISOString().split('T')[0])
            formData.append('priority', 'medium')

            try {
                // Optimistic update could happen here, but for simplicity we rely on revalidation
                setNewTask('') // Clear immediately
                await createPersonalTask(formData)
            } catch (error) {
                console.error('Failed to create task', error)
                // Restore text if failed (optional, keeping simple for now)
            }
        }
    }

    const handleToggle = async (task: PersonalTask) => {
        try {
            await togglePersonalTask(task.id, task.status)
        } catch (error) {
            console.error('Failed to toggle task', error)
        }
    }

    return (
        <div className="card h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Personal To-Do</h2>
                <Link href="/todo" className="btn-icon">
                    <Plus className="h-4 w-4" />
                </Link>
            </div>

            {/* Quick Add */}
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Add a quick task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={handleQuickAdd}
                    className="input-field pr-8"
                    disabled={isPending}
                />
                {isPending && (
                    <div className="absolute right-2 top-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                )}
                <p className="text-xs text-slate-400 mt-1">
                    Press Enter to add for today
                </p>
            </div>

            {/* Today Tasks */}
            <div className="space-y-2 flex-1 overflow-y-auto min-h-[150px]">
                <h3 className="text-sm font-medium text-slate-600 mb-2">TODAY</h3>
                {tasks.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-400">No tasks for today. Enjoy! ✨</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="task-item-compact group cursor-pointer" onClick={() => handleToggle(task)}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={task.status === 'done'}
                                    readOnly
                                    className="rounded border-slate-300 text-salesforce-blue focus:ring-salesforce-blue h-4 w-4 cursor-pointer"
                                />
                                <span className={clsx(
                                    "text-sm group-hover:text-salesforce-blue transition-colors",
                                    task.status === 'done' && "line-through text-slate-400"
                                )}>
                                    {task.title}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View All Link */}
            <div className="pt-4 mt-auto border-t border-slate-100">
                <Link href="/todo" className="btn-link block text-center text-sm">
                    View full list →
                </Link>
            </div>
        </div>
    )
}
