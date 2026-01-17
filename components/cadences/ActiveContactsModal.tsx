'use client'

import { useState, useEffect } from 'react'
import { getCadenceContacts } from '@/lib/actions/cadence-actions'
import { X, Loader2, User, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

interface ActiveContactsModalProps {
    isOpen: boolean
    onClose: () => void
    cadenceId: string
    cadenceName: string
}

type CadenceContact = {
    contact: {
        id: string
        name: string
        company: string | null
        email: string | null
    }
    step: {
        step_number: number
        title: string
    }
    current_step: number
}

export function ActiveContactsModal({ isOpen, onClose, cadenceId, cadenceName }: ActiveContactsModalProps) {
    const [loading, setLoading] = useState(true)
    const [contacts, setContacts] = useState<CadenceContact[]>([])

    useEffect(() => {
        if (isOpen && cadenceId) {
            setLoading(true)
            getCadenceContacts(cadenceId).then((data: any) => {
                setContacts(data || [])
                setLoading(false)
            })
        }
    }, [isOpen, cadenceId])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Active Contacts</h2>
                        <p className="text-sm text-slate-500">In {cadenceName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0 bg-slate-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 text-[#00A1E0] animate-spin" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No active contacts in this cadence.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 bg-white border-t border-b border-slate-100">
                            {contacts.map((item, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                            {item.contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link href={`/contacts/${item.contact.id}`} className="font-medium text-slate-900 hover:text-[#00A1E0] hover:underline block">
                                                {item.contact.name}
                                            </Link>
                                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                                {item.contact.company && (
                                                    <span className="flex items-center mr-2">
                                                        <Building2 className="w-3 h-3 mr-1" />
                                                        {item.contact.company}
                                                    </span>
                                                )}
                                                <span className="text-slate-400">{item.contact.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Step</div>
                                        <div className="flex items-center">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                                Step {item.step?.step_number || item.current_step}: {item.step?.title || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-right text-xs text-slate-500">
                    Total: {contacts.length} contacts
                </div>
            </div>
        </div>
    )
}
