'use client'

import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, Linkedin, CheckCircle2, Clock } from 'lucide-react'

interface Activity {
    id: string
    completed_at: string
    cadence_steps: {
        action_type: string
        title: string
    }
    cadences: {
        name: string
    }
}

export function ActivityTimeline({ history }: { history: Activity[] }) {
    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>No activity recorded yet.</p>
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone className="w-4 h-4 text-white" />
            case 'email': return <Mail className="w-4 h-4 text-white" />
            case 'linkedin_connect':
            case 'linkedin_message': return <Linkedin className="w-4 h-4 text-white" />
            default: return <CheckCircle2 className="w-4 h-4 text-white" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'call': return 'bg-emerald-500'
            case 'email': return 'bg-blue-500'
            case 'linkedin_connect':
            case 'linkedin_message': return 'bg-[#0077b5]'
            default: return 'bg-slate-400'
        }
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((activity, activityIdx) => (
                    <li key={activity.id}>
                        <div className="relative pb-8">
                            {activityIdx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getBgColor(activity.cadence_steps.action_type)}`}>
                                        {getIcon(activity.cadence_steps.action_type)}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-slate-900 font-medium">
                                            {activity.cadence_steps.title}
                                            <span className="text-slate-500 font-normal"> in </span>
                                            <span className="text-slate-700 font-medium">{activity.cadences.name}</span>
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-slate-500">
                                        <time dateTime={activity.completed_at}>{formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
