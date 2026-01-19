'use client'

import { DailyTask } from '@/lib/actions/task-actions'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, CalendarDays } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskStats } from './TaskStats'
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal'

export function TaskList({ initialTasks, completedCount }: { initialTasks: DailyTask[], completedCount: number }) {
    const [selectedTemplate, setSelectedTemplate] = useState<{ name: string, subject: string, body: string } | null>(null)
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

    // Filters
    const [typeFilter, setTypeFilter] = useState('all')
    const [tierFilter, setTierFilter] = useState('all')

    // Filter Logic
    const filteredTasks = initialTasks.filter(task => {
        if (typeFilter !== 'all') {
            if (typeFilter === 'call' && task.cadence_steps.action_type !== 'call') return false
            if (typeFilter === 'email' && task.cadence_steps.action_type !== 'email') return false
            if (typeFilter === 'linkedin') {
                if (!task.cadence_steps.action_type.includes('linkedin')) return false
            }
        }
        if (tierFilter !== 'all') {
            if (task.contact_cadences.contacts.accounts.tier !== tierFilter) return false
        }
        return true
    })

    // Grouping
    const today = new Date().toISOString().split('T')[0]
    const overdueTasks = filteredTasks.filter(t => t.due_date < today)
    const todayTasks = filteredTasks.filter(t => t.due_date === today)
    const upcomingTasks = filteredTasks.filter(t => t.due_date > today)

    // Helper to extract template from task for preview
    const handleViewTemplate = (templateId: string) => {
        const taskWithTemplate = initialTasks.find(t => t.cadence_steps.template_id === templateId)
        if (taskWithTemplate && taskWithTemplate.cadence_steps.templates) {
            setSelectedTemplate(taskWithTemplate.cadence_steps.templates)
            setIsTemplateModalOpen(true)
        }
    }

    // Empty State
    if (initialTasks.length === 0) {
        return (
            <div className="empty-state-detailed">
                <div className="mx-auto h-16 w-16 text-emerald-100 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-200">
                    <BadgeCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto mb-8">
                    No pending tasks for today. Go find some new prospects!
                </p>
                <div className="flex gap-3 justify-center">
                    <a href="/contacts" className="btn-primary">
                        Add Contacts to Cadence
                    </a>
                    <a href="/cadences" className="btn-secondary">
                        View Cadences
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header with Filters */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    {/* Title is in page.tsx but we can add filter controls here or move title here. Keeping filters here. */}
                </div>
                <div className="flex gap-3">
                    <select
                        className="select-field"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="call">📞 Calls</option>
                        <option value="email">📧 Emails</option>
                        <option value="linkedin">💼 LinkedIn</option>
                    </select>
                    <select
                        className="select-field"
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                    >
                        <option value="all">All Accounts</option>
                        <option value="Tier 1">Tier 1 Only</option>
                        <option value="Tier 2">Tier 2 Only</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-mini">
                    <span className="label">Due Today</span>
                    <span className="value">{todayTasks.length}</span>
                </div>
                <div className="stat-mini">
                    <span className="label">Overdue</span>
                    <span className="value text-red-600">{overdueTasks.length}</span>
                </div>
                <div className="stat-mini">
                    <span className="label">Completed Today</span>
                    <span className="value text-green-600">{completedCount}</span>
                </div>
                <div className="stat-mini">
                    <span className="label">Upcoming</span>
                    <span className="value">{upcomingTasks.length}</span>
                </div>
            </div>

            {/* Task Lists */}
            <div className="space-y-8">
                {/* Overdue */}
                {overdueTasks.length > 0 && (
                    <div className="bg-red-50/50 rounded-lg p-6 border border-red-100">
                        <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 mr-2 text-xs text-red-700 font-bold">
                                {overdueTasks.length}
                            </span>
                            Overdue Tasks
                        </h3>
                        <div className="space-y-3">
                            {overdueTasks.map(task => (
                                <TaskCard key={task.id} task={task} viewTemplate={handleViewTemplate} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Today */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mr-2 text-xs text-blue-700 font-bold">
                            {todayTasks.length}
                        </span>
                        Due Today
                    </h3>
                    {todayTasks.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p className="text-slate-500">No tasks due today matching your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayTasks.map(task => (
                                <TaskCard key={task.id} task={task} viewTemplate={handleViewTemplate} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming */}
                {upcomingTasks.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-500 mb-4 flex items-center opacity-75">
                            <CalendarDays className="w-5 h-5 mr-2" />
                            Upcoming
                        </h3>
                        <div className="space-y-3 opacity-75">
                            {upcomingTasks.map(task => (
                                <TaskCard key={task.id} task={task} viewTemplate={handleViewTemplate} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <TemplatePreviewModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                template={selectedTemplate}
            />
        </div>
    )
}
