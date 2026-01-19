'use client'

import { Contact, deleteContact } from '@/lib/actions/contact-actions'
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Linkedin, Play } from 'lucide-react'
import { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ContactModal } from './ContactModal'
import { AddToCadenceModal } from '@/components/cadences/AddToCadenceModal'
import { Cadence } from '@/lib/actions/cadence-actions'
import { Account } from '@/lib/actions/account-actions'
import { clsx } from 'clsx'
import Link from 'next/link'

interface ContactRowProps {
    contact: Contact
    cadences: Cadence[]
    accounts: Account[]
    selected: boolean
    onSelect: () => void
}

export function ContactRow({ contact, cadences, accounts, selected, onSelect }: ContactRowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isCadenceOpen, setIsCadenceOpen] = useState(false)

    async function handleDelete() {
        if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
            await deleteContact(contact.id)
        }
    }

    function getStatusBadge(status: string) {
        const styles: Record<string, string> = {
            'not_contacted': 'bg-slate-100 text-slate-600',
            'in_cadence': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'meeting_booked': 'bg-green-100 text-green-800',
            'lost': 'bg-red-100 text-red-800'
        }
        const labels: Record<string, string> = {
            'not_contacted': 'Not Contacted',
            'in_cadence': 'In Cadence',
            'contacted': 'Contacted',
            'meeting_booked': 'Meeting Booked',
            'lost': 'Lost'
        }
        return <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', styles[status] || styles['not_contacted'])}>{labels[status] || status}</span>
    }

    return (
        <>
            <tr className={clsx("hover:bg-slate-50 group transition-colors border-b border-slate-100 last:border-0", selected && "bg-blue-50/50 hover:bg-blue-50")}>
                <td className="pl-6 py-4 whitespace-nowrap w-12">
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                        checked={selected}
                        onChange={onSelect}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                        <Link href={`/contacts/${contact.id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                            {contact.name}
                        </Link>
                        <div className="flex gap-2">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Mail className="h-3 w-3" />
                                </a>
                            )}
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Phone className="h-3 w-3" />
                                </a>
                            )}
                            {contact.linkedin_url && (
                                <a
                                    href={contact.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-[#0077b5] transition-colors"
                                >
                                    <Linkedin className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-slate-900 font-medium">{contact.accounts?.name || '-'}</span>
                        {contact.accounts?.tier && (
                            <span className={clsx(
                                "badge w-fit",
                                contact.accounts.tier === 'Tier 1' ? 'badge-success' : 'badge-blue'
                            )}>
                                {contact.accounts.tier}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                    {contact.title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    {contact.active_cadence ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-slate-700">{contact.active_cadence.name}</span>
                            <span className="text-xs text-slate-500">
                                Step {contact.active_cadence.current_step}/{contact.active_cadence.total_steps}
                            </span>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">—</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    {contact.active_cadence?.last_action_date ? (
                        <div className="flex items-center gap-2">
                            {/* Assuming check-circle for completed tasks generally, or logic based on action type if available in history. For simplicity: */}
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-600">
                                {new Date(contact.active_cadence.last_action_date).toLocaleDateString()}
                            </span>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">No activity</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {contact.next_task ? (
                        <div className="flex items-center gap-2">
                            {/* Icon based on action type */}
                            {contact.next_task.action_type === 'call' && <Phone className="w-3 h-3 text-purple-500" />}
                            {contact.next_task.action_type === 'email' && <Mail className="w-3 h-3 text-blue-500" />}
                            {contact.next_task.action_type.includes('linkedin') && <Linkedin className="w-3 h-3 text-sky-600" />}

                            <span className={clsx("text-xs",
                                new Date(contact.next_task.due_date) < new Date() ? "text-red-600 font-medium" : "text-slate-600"
                            )}>
                                {new Date(contact.next_task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    ) : (
                        !contact.active_cadence && (
                            <button
                                onClick={() => setIsCadenceOpen(true)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <Play className="w-3 h-3" /> Add to Cadence
                            </button>
                        )
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contact.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="btn-icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            {!contact.active_cadence && (
                                <DropdownMenuItem onClick={() => setIsCadenceOpen(true)}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Add to Cadence
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isEditOpen && (
                        <ContactModal
                            isOpen={isEditOpen}
                            onClose={() => setIsEditOpen(false)}
                            contact={contact}
                            accounts={accounts}
                        />
                    )}

                    {isCadenceOpen && (
                        <AddToCadenceModal
                            isOpen={isCadenceOpen}
                            onClose={() => setIsCadenceOpen(false)}
                            cadences={cadences}
                            contactId={contact.id}
                        />
                    )}
                </td>
            </tr>
        </>
    )
}
