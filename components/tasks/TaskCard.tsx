'use client'

import { DailyTask, completeTask, skipTask, postponeTask } from '@/lib/actions/task-actions'
import { Card } from '@/components/ui/Card'
import { CheckSquare, Mail, Phone, Linkedin, MessageSquare, MoreHorizontal, Calendar, SkipForward, ArrowRight } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clsx } from 'clsx'
import { useTransition } from 'react'

interface TaskCardProps {
    task: DailyTask
    viewTemplate: (templateId: string) => void
}

export function TaskCard({ task, viewTemplate }: TaskCardProps) {
    const [isPending, startTransition] = useTransition()

    const handleComplete = () => {
        startTransition(async () => {
            try {
                await completeTask(task.id)
            } catch (e) {
                alert('Failed to complete task')
            }
        })
    }

    const handleSkip = () => {
        if (!confirm('Are you sure you want to skip this task?')) return
        startTransition(async () => {
            try {
                await skipTask(task.id, task.contact_cadence_id, task.cadence_steps.step_number)
            } catch (e) {
                alert('Failed to skip task')
            }
        })
    }

    const handlePostpone = () => {
        // Simple postpone for +1 day for now, can enhance with modal
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        startTransition(async () => {
            await postponeTask(task.id, tomorrow)
        })
    }

    const iconMap = {
        'call': <Phone className="w-4 h-4" />,
        'email': <Mail className="w-4 h-4" />,
        'linkedin_message': <Linkedin className="w-4 h-4" />,
        'linkedin_connection': <Linkedin className="w-4 h-4" />,
        'whatsapp': <MessageSquare className="w-4 h-4" />,
    }

    const contact = task.contact_cadences.contacts
    const step = task.cadence_steps

    return (
        <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 truncate">{contact.name}</span>
                        <span className="text-sm text-slate-500 truncate border-l pl-2">{contact.title}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-slate-700">{contact.accounts.name}</span>
                        {contact.accounts.tier && (
                            <span className={clsx(
                                "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] subpixel-antialiased font-medium ring-1 ring-inset",
                                contact.accounts.tier === 'Tier 1' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                            )}>
                                {contact.accounts.tier}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                            {iconMap[step.action_type] || <CheckSquare className="w-4 h-4" />}
                            <span className="font-medium">Day {step.day_offset}: {step.templates?.name || 'Manual Task'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    {step.template_id && (
                        <button
                            onClick={() => viewTemplate(step.template_id!)}
                            className="text-sm font-medium text-slate-600 hover:text-[#00A1E0] px-3 py-1.5 rounded hover:bg-slate-50 transition-colors"
                        >
                            View Template
                        </button>
                    )}

                    <button
                        onClick={handleComplete}
                        disabled={isPending}
                        className="btn-primary flex items-center gap-2 py-1.5 px-3"
                    >
                        {isPending ? '...' : <><CheckSquare className="w-4 h-4" /> Complete</>}
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleSkip}>
                                <SkipForward className="w-4 h-4 mr-2" /> Skip
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePostpone}>
                                <Calendar className="w-4 h-4 mr-2" /> Postpone (1 day)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
