'use client'

import { DailyTask } from '@/lib/actions/task-actions'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, CalendarDays } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskStats } from './TaskStats'
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal'

export function TaskList({ initialTasks }: { initialTasks: DailyTask[] }) {
    const [selectedTemplate, setSelectedTemplate] = useState<{ name: string, subject: string, body: string } | null>(null)
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

    // Separate tasks
    const today = new Date().toISOString().split('T')[0]

    // Sort tasks: Overdue (date < today), Today (date == today), Upcoming (date > today)
    const overdueTasks = initialTasks.filter(t => t.due_date < today)
    const todayTasks = initialTasks.filter(t => t.due_date === today)
    const upcomingTasks = initialTasks.filter(t => t.due_date > today)

    // Helper to extract template from task for preview
    const handleViewTemplate = (templateId: string) => {
        // Find template info from the task that has this templateId
        const taskWithTemplate = initialTasks.find(t => t.cadence_steps.template_id === templateId)
        if (taskWithTemplate && taskWithTemplate.cadence_steps.templates) {
            setSelectedTemplate(taskWithTemplate.cadence_steps.templates)
            setIsTemplateModalOpen(true)
        }
    }

    if (initialTasks.length === 0) {
        return (
            <Card className="text-center py-16">
                <div className="mx-auto h-16 w-16 text-slate-300 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <BadgeCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    You have no pending tasks for today. Check back tomorrow or add more contacts to your cadences.
                </p>
                <div className="mt-8">
                    <button onClick={() => window.location.reload()} className="text-sm text-[#00A1E0] hover:underline">
                        Refresh content
                    </button>
                </div>
            </Card>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Stats Bar */}
            <TaskStats tasks={[...overdueTasks, ...todayTasks]} overdueCount={overdueTasks.length} />

            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                        Overdue ({overdueTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {overdueTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                viewTemplate={handleViewTemplate}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Today Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-[#00A1E0] rounded-full mr-2"></span>
                    Due Today ({todayTasks.length})
                </h3>
                {todayTasks.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                        No tasks due today.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                viewTemplate={handleViewTemplate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming (Optimistic UI - if we had them) */}
            {upcomingTasks.length > 0 && (
                <div className="mb-8 opacity-75">
                    <h3 className="text-lg font-semibold text-slate-500 mb-4 flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Upcoming ({upcomingTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {upcomingTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                viewTemplate={handleViewTemplate}
                            />
                        ))}
                    </div>
                </div>
            )}

            <TemplatePreviewModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                template={selectedTemplate}
            />
        </div>
    )
}
