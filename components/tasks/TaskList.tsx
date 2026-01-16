'use client'

import { DailyTask, completeTask } from '@/lib/actions/task-actions'
import { Card } from '@/components/ui/Card'
import { Phone, Mail, Linkedin, Check, ChevronRight, FileText } from 'lucide-react'
import { useState, useTransition } from 'react'
import clsx from 'clsx'

export function TaskList({ tasks }: { tasks: DailyTask[] }) {
    return (
        <div className="space-y-4">
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} />
            ))}
        </div>
    )
}

function TaskItem({ task }: { task: DailyTask }) {
    const [isPending, startTransition] = useTransition()
    const [expanded, setExpanded] = useState(false)

    const handleComplete = () => {
        startTransition(async () => {
            try {
                await completeTask(
                    task.id,
                    task.contact_cadence_id,
                    task.contact_cadences.current_step
                )
            } catch (e) {
                alert('Failed to complete task')
            }
        })
    }

    const getIcon = (type: string) => {
        if (type.includes('email')) return <Mail className="w-5 h-5" />
        if (type.includes('linkedin')) return <Linkedin className="w-5 h-5" />
        if (type.includes('call')) return <Phone className="w-5 h-5" />
        return <CheckSquare className="w-5 h-5" />
    }

    // Replace variables in template body
    const contact = task.contact_cadences.contacts
    const account = contact.accounts

    let templateBody = task.cadence_steps.templates?.body || ''
    if (templateBody) {
        templateBody = templateBody
            .replace(/{{first_name}}/g, contact.name.split(' ')[0])
            .replace(/{{company_name}}/g, account.name)
            .replace(/{{title}}/g, contact.title || '')
            .replace(/{{my_name}}/g, 'Sebastian') // Static for now
    }

    return (
        <Card noPadding className={clsx("transition-all border-l-4",
            isPending ? 'opacity-50' : 'opacity-100',
            task.cadence_steps.action_type.includes('call') ? 'border-l-purple-500' :
                task.cadence_steps.action_type.includes('email') ? 'border-l-blue-500' :
                    'border-l-sky-500'
        )}>
            <div className="p-4 flex items-start">
                <div className="mr-4 mt-1">
                    <div className={clsx("p-2 rounded-full text-white",
                        task.cadence_steps.action_type.includes('call') ? 'bg-purple-500' :
                            task.cadence_steps.action_type.includes('email') ? 'bg-blue-500' :
                                'bg-sky-500'
                    )}>
                        {getIcon(task.cadence_steps.action_type)}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900">
                                {task.contact_cadences.contacts.name}
                                <span className="text-slate-400 font-normal mx-2">from</span>
                                {task.contact_cadences.contacts.accounts.name}
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium text-xs">
                                    {task.contact_cadences.contacts.accounts.tier}
                                </span>
                                <span>{task.cadence_steps.action_type.replace('_', ' ').toUpperCase()}</span>
                                <span>•</span>
                                <span>Day {task.cadence_steps.day_offset}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleComplete}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center shadow-sm transition-colors"
                        >
                            {isPending ? 'Completing...' : (
                                <>
                                    <Check className="w-4 h-4 mr-2" /> Complete
                                </>
                            )}
                        </button>
                    </div>

                    {/* Template Preview */}
                    {templateBody && (
                        <div className="mt-4">
                            {!expanded ? (
                                <button
                                    onClick={() => setExpanded(true)}
                                    className="text-sm text-[#00A1E0] hover:underline flex items-center"
                                >
                                    <FileText className="w-3 h-3 mr-1" /> View Template Script
                                </button>
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Script Sugesstion</p>
                                        <button onClick={() => setExpanded(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                                    </div>
                                    {task.cadence_steps.templates?.subject && (
                                        <p className="text-sm font-medium mb-2">Subject: {task.cadence_steps.templates.subject}</p>
                                    )}
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                                        {templateBody}
                                    </p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(templateBody)}
                                        className="mt-3 text-xs text-[#00A1E0] hover:underline"
                                    >
                                        Copy to clipboard
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
import { CheckSquare } from 'lucide-react'
