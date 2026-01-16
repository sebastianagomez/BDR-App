'use client'

import { useState, useTransition } from 'react'
import { assignContactToCadence, Cadence } from '@/lib/actions/cadence-actions'
import { X, Loader2, Play } from 'lucide-react'

interface AddToCadenceModalProps {
    isOpen: boolean
    onClose: () => void
    cadences: Cadence[]
    contactId: string // For MVP single contact assignment
}

export function AddToCadenceModal({ isOpen, onClose, cadences, contactId }: AddToCadenceModalProps) {
    const [isPending, startTransition] = useTransition()
    const [selectedCadenceId, setSelectedCadenceId] = useState('')

    const handleSave = () => {
        if (!selectedCadenceId) return
        startTransition(async () => {
            try {
                await assignContactToCadence(contactId, selectedCadenceId)
                onClose()
            } catch (e) {
                alert('Failed to assign cadence')
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">Add to Cadence</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Cadence</label>
                        <select
                            className="input-field"
                            value={selectedCadenceId}
                            onChange={e => setSelectedCadenceId(e.target.value)}
                        >
                            <option value="">Choose a cadence...</option>
                            {cadences.filter(c => c.is_active).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            Starting this cadence will schedule the first step immediately.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex items-center"
                            disabled={!selectedCadenceId || isPending}
                        >
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Start Cadence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
