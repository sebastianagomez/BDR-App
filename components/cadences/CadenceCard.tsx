'use client'

import { Cadence } from '@/lib/actions/cadence-actions'
import { Card } from '@/components/ui/Card'
import { Repeat, MoreHorizontal, Pencil, Trash2, Users, Mail, Phone, Linkedin, MessageSquare, CheckSquare, Clock } from 'lucide-react'
import clsx from 'clsx'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CadenceCardProps {
    cadence: Cadence
    onEdit: (cadence: Cadence) => void
    onDelete: (id: string, name: string) => void
    onViewContacts: (cadence: Cadence) => void
}

export function CadenceCard({ cadence, onEdit, onDelete, onViewContacts }: CadenceCardProps) {

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone className="w-3.5 h-3.5" />;
            case 'email': return <Mail className="w-3.5 h-3.5" />;
            case 'linkedin_message':
            case 'linkedin_connection': return <Linkedin className="w-3.5 h-3.5" />;
            case 'whatsapp': return <MessageSquare className="w-3.5 h-3.5" />;
            default: return <CheckSquare className="w-3.5 h-3.5" />;
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <Repeat className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">{cadence.name}</h3>
                            <span className={clsx(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                cadence.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            )}>
                                {cadence.is_active ? 'Active' : 'Draft'}
                            </span>
                            {cadence.active_contacts_count !== undefined && (
                                <button
                                    onClick={() => onViewContacts(cadence)}
                                    className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <Users className="w-3 h-3" />
                                    <span className="font-medium">{cadence.active_contacts_count} active</span>
                                </button>
                            )}
                        </div>
                        <p className="text-slate-500 mt-1 text-sm">{cadence.description || 'No description'}</p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="text-slate-400 hover:text-[#00A1E0] p-1 rounded hover:bg-slate-50 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(cadence)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(cadence.id, cadence.name)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Visual Timeline */}
            <div className="relative pt-2 pb-2">
                {/* Connecting Line - simplified for now as a background line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden md:block" />

                <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 relative z-10 scrollbar-hide">
                    {cadence.steps?.sort((a, b) => a.step_number - b.step_number).map((step, idx) => (
                        <div key={step.id} className="flex-shrink-0 flex flex-col items-center group relative p-2 min-w-[60px]">
                            {/* Step Bubble */}
                            <div className={clsx(
                                "w-8 h-8 rounded-full border flex items-center justify-center transition-colors bg-white",
                                "border-slate-200 text-slate-500 group-hover:border-[#00A1E0] group-hover:text-[#00A1E0]"
                            )} title={step.title}>
                                {getStepIcon(step.action_type)}
                            </div>

                            {/* Step Info */}
                            <div className="mt-2 text-center">
                                <span className="block text-[10px] font-medium text-slate-500 group-hover:text-slate-700">
                                    Day {step.day_offset}
                                </span>
                                <span className="text-[10px] text-slate-400 capitalize whitespace-nowrap hidden md:block">
                                    {step.action_type.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Connector (Mobile/Overflow) - if we want more explicit connection, but absolute line behind handles it for desktop. */}
                        </div>
                    ))}

                    {/* Add Step Button Placeholder (Visual only) */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[60px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Could be an 'add' button if we supported inline editing here */}
                    </div>
                </div>
            </div>
        </Card>
    )
}
