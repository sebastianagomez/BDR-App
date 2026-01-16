'use client'

import { Contact, deleteContact } from '@/lib/actions/contact-actions'
import { Cadence } from '@/lib/actions/cadence-actions'
import { Account } from '@/lib/actions/account-actions'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, Linkedin, Mail, Phone, Play } from 'lucide-react'
import { AddToCadenceModal } from '@/components/cadences/AddToCadenceModal'
import { ContactModal } from '@/components/contacts/ContactModal'
import { ActionDropdown } from '@/components/ui/ActionDropdown'
import { useState, useTransition } from 'react'
import clsx from 'clsx'

export function ContactList({ contacts, cadences, accounts }: { contacts: Contact[], cadences: Cadence[], accounts: Account[] }) {
    const [selectedContactForCadence, setSelectedContactForCadence] = useState<string | null>(null)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [isPending, startTransition] = useTransition()

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteContact(id)
            } catch (e) {
                alert('Failed to delete contact')
            }
        })
    }

    if (contacts.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BadgeCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No contacts found</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by adding contacts or importing a CSV.</p>
            </Card>
        )
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

    const filteredContacts = contacts.filter(contact => {
        if (filterStatus === 'all') return true
        return contact.status === filterStatus
    })

    return (
        <>
            <div className="flex justify-end mb-4">
                <select
                    className="block w-40 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#00A1E0] sm:text-sm sm:leading-6"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="not_contacted">Not Contacted</option>
                    <option value="in_cadence">In Cadence</option>
                    <option value="contacted">Contacted</option>
                    <option value="meeting_booked">Meeting Booked</option>
                    <option value="lost">Lost</option>
                </select>
            </div>

            <Card noPadding className="overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channels</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{contact.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600 font-medium">{contact.accounts?.name || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {contact.title || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2 text-slate-400">
                                        {contact.email && <Mail className="w-4 h-4 text-slate-500" />}
                                        {contact.phone && <Phone className="w-4 h-4 text-slate-500" />}
                                        {contact.linkedin_url && (
                                            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5]">
                                                <Linkedin className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate" title={contact.notes || ''}>
                                    {contact.notes || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(contact.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center space-x-2">
                                        <button
                                            onClick={() => setSelectedContactForCadence(contact.id)}
                                            className="text-slate-400 hover:text-[#00A1E0] tooltip p-1 rounded-full hover:bg-slate-100 transition-colors"
                                            title="Add to Cadence"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                        <ActionDropdown
                                            onEdit={() => setEditingContact(contact)}
                                            onDelete={() => handleDelete(contact.id)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedContactForCadence && (
                    <AddToCadenceModal
                        isOpen={!!selectedContactForCadence}
                        onClose={() => setSelectedContactForCadence(null)}
                        cadences={cadences}
                        contactId={selectedContactForCadence}
                    />
                )}
            </Card>

            <ContactModal
                isOpen={!!editingContact}
                onClose={() => setEditingContact(null)}
                contact={editingContact}
                accounts={accounts}
            />
        </>
    )
}
