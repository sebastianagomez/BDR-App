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
            <tr className={clsx("hover:bg-slate-50 group transition-colors", selected && "bg-blue-50/50 hover:bg-blue-50")}>
                <td className="pl-6 py-4 whitespace-nowrap w-4">
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                        checked={selected}
                        onChange={onSelect}
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/contacts/${contact.id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {contact.name}
                    </Link>
                    <div className="text-xs text-slate-500 md:hidden">{contact.title}</div>
                    <div className="flex gap-2 mt-1 md:hidden">
                        {contact.email && <Mail className="h-3 w-3 text-gray-400" />}
                        {contact.phone && <Phone className="h-3 w-3 text-gray-400" />}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-medium">{contact.accounts?.name || '-'}</div>
                    {contact.accounts?.tier && (
                        <span className={clsx(
                            "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset mt-1",
                            contact.accounts.tier === 'Tier 1' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                        )}>
                            {contact.accounts.tier}
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                    {contact.title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    {contact.active_cadence ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{contact.active_cadence.name}</span>
                            <span className="text-xs text-slate-500">
                                Step {contact.active_cadence.current_step}/{contact.active_cadence.total_steps}
                            </span>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">-</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    {contact.active_cadence?.last_action_date ? (
                        <span className="text-sm text-slate-600">
                            {new Date(contact.active_cadence.last_action_date).toLocaleDateString()}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-xs">No activity</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {contact.next_task ? (
                        <div className="flex items-center text-sm text-slate-700">
                            <div className={clsx("w-2 h-2 rounded-full mr-2",
                                new Date(contact.next_task.due_date) < new Date() ? 'bg-red-500' : 'bg-blue-500'
                            )} />
                            {contact.next_task.action_type.replace('_', ' ')}
                            <span className="text-xs text-slate-500 ml-1">
                                ({new Date(contact.next_task.due_date).toLocaleDateString()})
                            </span>
                        </div>
                    ) : (
                        !contact.active_cadence && (
                            <button
                                onClick={() => setIsCadenceOpen(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                                + Add to Cadence
                            </button>
                        )
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contact.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1 mr-2">
                            {contact.email && <a href={`mailto:${contact.email}`} className="text-slate-400 hover:text-slate-600 p-1"><Mail className="h-4 w-4" /></a>}
                            {contact.phone && <a href={`tel:${contact.phone}`} className="text-slate-400 hover:text-slate-600 p-1"><Phone className="h-4 w-4" /></a>}
                            {contact.linkedin_url && (
                                <a
                                    href={contact.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                        </div>

                        {!contact.active_cadence && (
                            <button
                                onClick={() => setIsCadenceOpen(true)}
                                className="text-slate-400 hover:text-[#00A1E0] tooltip p-1 rounded-full hover:bg-slate-100 transition-colors"
                                title="Add to Cadence"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </td>
            </tr>

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
        </>
    )
}
