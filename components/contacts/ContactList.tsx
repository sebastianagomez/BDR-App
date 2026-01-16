'use client'

import { Contact } from '@/lib/actions/contact-actions'
import { Cadence } from '@/lib/actions/cadence-actions'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, MoreHorizontal, Linkedin, Mail, Phone, Play } from 'lucide-react'
import { AddToCadenceModal } from '@/components/cadences/AddToCadenceModal'
import { useState } from 'react'
import clsx from 'clsx'

export function ContactList({ contacts, cadences }: { contacts: Contact[], cadences: Cadence[] }) {
    const [selectedContactForCadence, setSelectedContactForCadence] = useState<string | null>(null)

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
        const styles = {
            'not_contacted': 'bg-slate-100 text-slate-600',
            'in_cadence': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'meeting_booked': 'bg-green-100 text-green-800',
            'lost': 'bg-red-100 text-red-800'
        }
        const labels = {
            'not_contacted': 'Not Contacted',
            'in_cadence': 'In Cadence',
            'contacted': 'Contacted',
            'meeting_booked': 'Meeting Booked',
            'lost': 'Lost'
        }
        // @ts-ignore
        return <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', styles[status] || styles['not_contacted'])}>{labels[status] || status}</span>
    }

    return (
        <Card noPadding className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channels</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {contacts.map((contact) => (
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
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(contact.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setSelectedContactForCadence(contact.id)}
                                        className="text-slate-400 hover:text-[#00A1E0] tooltip"
                                        title="Add to Cadence"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button className="text-slate-400 hover:text-[#00A1E0]">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
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
    )
}
