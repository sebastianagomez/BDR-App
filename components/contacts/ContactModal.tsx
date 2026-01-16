'use client'

import { useState, useTransition } from 'react'
import { createContact } from '@/lib/actions/contact-actions'
import { X, Loader2 } from 'lucide-react'
import { Account } from '@/lib/actions/account-actions'

interface ContactModalProps {
    isOpen: boolean
    onClose: () => void
    accounts: Account[]
}

export function ContactModal({ isOpen, onClose, accounts }: ContactModalProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            try {
                await createContact(formData)
                onClose()
            } catch (e) {
                setError('Failed to create contact. Please try again.')
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900">Add New Contact</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label htmlFor="account_id" className="block text-sm font-medium text-slate-700 mb-1">Account *</label>
                        <select name="account_id" id="account_id" required className="input-field">
                            <option value="">Select Account...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="input-field"
                            placeholder="e.g. Jane Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="input-field"
                            placeholder="e.g. VP of Marketing"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="input-field"
                                placeholder="jane@company.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="input-field"
                                placeholder="+1 555..."
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="linkedin_url" className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                        <input
                            type="url"
                            name="linkedin_url"
                            id="linkedin_url"
                            className="input-field"
                            placeholder="https://linkedin.com/in/jane-doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select name="status" id="status" className="input-field">
                            <option value="not_contacted">Not Contacted</option>
                            <option value="in_cadence">In Cadence</option>
                            <option value="contacted">Contacted</option>
                            <option value="meeting_booked">Meeting Booked</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            id="notes"
                            rows={2}
                            className="input-field"
                            placeholder="Additional notes..."
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex items-center"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
