'use client'

import { Contact, deleteContact } from '@/lib/actions/contact-actions'
import { Cadence } from '@/lib/actions/cadence-actions'
import { Account } from '@/lib/actions/account-actions'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, Filter, Trash2, X } from 'lucide-react'
import { ContactRow } from './ContactRow'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export function ContactList({ contacts, cadences, accounts }: { contacts: Contact[], cadences: Cadence[], accounts: Account[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const statusFilter = searchParams.get('status') || 'all'
    const tierFilter = searchParams.get('tier') || 'all'
    const cadenceFilter = searchParams.get('cadence') || 'all'

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === 'all' || !value) {
                params.delete(name)
            } else {
                params.set(name, value)
            }
            return params.toString()
        },
        [searchParams]
    )

    const updateFilter = (name: string, value: string) => {
        router.push(pathname + '?' + createQueryString(name, value))
    }

    const filteredContacts = contacts.filter(contact => {
        if (statusFilter !== 'all' && contact.status !== statusFilter) return false
        if (tierFilter !== 'all' && contact.accounts?.tier !== tierFilter) return false
        if (cadenceFilter !== 'all') {
            if (cadenceFilter === 'none') {
                if (contact.active_cadence) return false
            } else {
                if (contact.active_cadence?.name !== cadenceFilter) return false
            }
        }
        return true
    })

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredContacts.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredContacts.map(c => c.id)))
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} contacts?`)) return

        // Sequential delete for now, could be improved with bulk delete server action
        for (const id of Array.from(selectedIds)) {
            await deleteContact(id)
        }
        setSelectedIds(new Set())
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

    return (
        <>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                {/* Bulk Action Bar */}
                {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-4 bg-blue-50 px-4 py-1.5 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
                        <div className="h-4 w-px bg-blue-200" />
                        <button
                            onClick={handleBulkDelete}
                            className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-slate-400 hover:text-slate-600 ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Filters:</span>
                    </div>
                )}

                <div className="flex gap-3 ml-auto">
                    <select
                        className="block w-40 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#00A1E0] sm:text-sm sm:leading-6"
                        value={statusFilter}
                        onChange={(e) => updateFilter('status', e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="not_contacted">Not Contacted</option>
                        <option value="in_cadence">In Cadence</option>
                        <option value="contacted">Contacted</option>
                        <option value="meeting_booked">Meeting Booked</option>
                        <option value="lost">Lost</option>
                    </select>

                    <select
                        className="block w-32 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#00A1E0] sm:text-sm sm:leading-6"
                        value={tierFilter}
                        onChange={(e) => updateFilter('tier', e.target.value)}
                    >
                        <option value="all">All Tiers</option>
                        <option value="Tier 1">Tier 1</option>
                        <option value="Tier 2">Tier 2</option>
                        <option value="Tier 3">Tier 3</option>
                    </select>

                    <select
                        className="block w-48 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#00A1E0] sm:text-sm sm:leading-6"
                        value={cadenceFilter}
                        onChange={(e) => updateFilter('cadence', e.target.value)}
                    >
                        <option value="all">All Cadences</option>
                        {cadences.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        <option value="none">No Active Cadence</option>
                    </select>
                </div>
            </div>

            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="pl-6 py-3 text-left w-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                                        checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Cadence</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">Last Activity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Action</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                                        No contacts match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <ContactRow
                                        key={contact.id}
                                        contact={contact}
                                        cadences={cadences}
                                        accounts={accounts}
                                        selected={selectedIds.has(contact.id)}
                                        onSelect={() => toggleSelect(contact.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}
