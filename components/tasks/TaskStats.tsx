'use client'

import { DailyTask } from '@/lib/actions/task-actions'
import { Card } from '@/components/ui/Card'
import { Phone, Mail, Linkedin, CheckSquare, AlertCircle } from 'lucide-react'

export function TaskStats({ tasks, overdueCount }: { tasks: DailyTask[], overdueCount: number }) {
    const counts = {
        call: tasks.filter(t => t.cadence_steps.action_type === 'call').length,
        email: tasks.filter(t => t.cadence_steps.action_type === 'email').length,
        linkedin: tasks.filter(t => t.cadence_steps.action_type?.includes('linkedin')).length,
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4 flex flex-col justify-center">
                <div className="text-sm text-slate-500 font-medium mb-1">Due Today</div>
                <div className="text-2xl font-bold text-slate-900">{tasks.length}</div>
                <div className="text-xs text-slate-400 mt-1">
                    {overdueCount > 0 && <span className="text-red-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {overdueCount} Overdue</span>}
                </div>
            </div>

            <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500 font-medium">Calls</div>
                    <div className="text-xl font-bold text-slate-900">{counts.call}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <Phone className="w-5 h-5" />
                </div>
            </div>

            <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500 font-medium">Emails</div>
                    <div className="text-xl font-bold text-slate-900">{counts.email}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-full text-purple-600">
                    <Mail className="w-5 h-5" />
                </div>
            </div>

            <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500 font-medium">LinkedIn</div>
                    <div className="text-xl font-bold text-slate-900">{counts.linkedin}</div>
                </div>
                <div className="bg-sky-50 p-2 rounded-full text-[#0077b5]">
                    <Linkedin className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}
