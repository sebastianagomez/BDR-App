'use client'

import { PersonalTask, createPersonalTask, togglePersonalTask, deletePersonalTask } from '@/lib/actions/personal-task-actions'
import { Card } from '@/components/ui/Card'
import { CheckSquare, Plus, Trash2, Calendar } from 'lucide-react'
import { useState, useTransition, useOptimistic } from 'react'
import clsx from 'clsx'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

export function PersonalTaskList({ initialTasks }: { initialTasks: PersonalTask[] }) {
    const [isPending, startTransition] = useTransition()
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDate, setNewTaskDate] = useState('')

    const handleCreate = () => {
        if (!newTaskTitle.trim()) return
        startTransition(async () => {
            const formData = new FormData()
            formData.append('title', newTaskTitle)
            if (newTaskDate) formData.append('due_date', newTaskDate)
            formData.append('priority', 'medium') // Default

            await createPersonalTask(formData)
            setNewTaskTitle('')
            setNewTaskDate('')
        })
    }

    const handleToggle = (id: string, status: 'pending' | 'completed') => {
        startTransition(async () => {
            await togglePersonalTask(id, status)
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm('Delete this task?')) return
        startTransition(async () => {
            await deletePersonalTask(id)
        })
    }

    // Group tasks
    const pendingTasks = initialTasks.filter(t => t.status === 'pending')
    const completedTasks = initialTasks.filter(t => t.status === 'completed')

    const overdue = pendingTasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)))
    const today = pendingTasks.filter(t => !t.due_date || isToday(parseISO(t.due_date))) // No date = Today by default preference? Or "Inbox"? Let's put in Today for focus.
    const tomorrow = pendingTasks.filter(t => t.due_date && isTomorrow(parseISO(t.due_date)))
    const later = pendingTasks.filter(t => t.due_date && !isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && !isTomorrow(parseISO(t.due_date)))

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Input Area */}
                <Card className="p-4 flex gap-4 items-center">
                    <button className="text-slate-400">
                        <Plus className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreate()
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            className="text-xs border rounded p-1 text-slate-500"
                            value={newTaskDate}
                            onChange={e => setNewTaskDate(e.target.value)}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!newTaskTitle.trim() || isPending}
                            className="text-[#00A1E0] font-medium text-sm hover:underline"
                        >
                            Add
                        </button>
                    </div>
                </Card>

                {/* Overdue Section */}
                {overdue.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-red-600 font-semibold text-sm uppercase tracking-wide">Overdue</h3>
                        {overdue.map(task => (
                            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} isPending={isPending} />
                        ))}
                    </div>
                )}

                {/* Today Section */}
                <div className="space-y-2">
                    <h3 className="text-slate-900 font-semibold text-sm uppercase tracking-wide">Today</h3>
                    {today.length === 0 && overdue.length === 0 && (
                        <p className="text-slate-500 text-sm italic">No tasks for today. Enjoy!</p>
                    )}
                    {today.map(task => (
                        <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} isPending={isPending} />
                    ))}
                </div>

                {/* Tomorrow Section */}
                {tomorrow.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wide">Tomorrow</h3>
                        {tomorrow.map(task => (
                            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} isPending={isPending} />
                        ))}
                    </div>
                )}
                {/* Later Section */}
                {later.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wide">Later</h3>
                        {later.map(task => (
                            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} isPending={isPending} />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <Card>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Completed</h3>
                    <div className="space-y-2">
                        {completedTasks.length === 0 && (
                            <p className="text-slate-400 text-sm">No completed tasks yet.</p>
                        )}
                        {completedTasks.map(task => (
                            <div key={task.id} className="flex items-center group opacity-60">
                                <button onClick={() => handleToggle(task.id, 'completed')} className="text-green-500 mr-3">
                                    <CheckSquare className="w-5 h-5" />
                                </button>
                                <span className="text-slate-500 line-through text-sm flex-1">{task.title}</span>
                                <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

function TaskRow({ task, onToggle, onDelete, isPending }: any) {
    return (
        <Card noPadding className="p-3 flex items-center group hover:shadow-md transition-shadow">
            <button
                onClick={() => onToggle(task.id, task.status)}
                disabled={isPending}
                className="text-slate-300 hover:text-[#00A1E0] mr-3"
            >
                <div className="w-5 h-5 border-2 border-slate-300 rounded hover:border-[#00A1E0]"></div>
            </button>
            <div className="flex-1">
                <p className="text-slate-900 font-medium">{task.title}</p>
                {task.due_date && (
                    <div className="flex items-center text-xs text-slate-400 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {task.due_date}
                    </div>
                )}
            </div>
            <button
                onClick={() => onDelete(task.id)}
                disabled={isPending}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </Card>
    )
}
