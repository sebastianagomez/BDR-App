'use client'

import { useState, useTransition } from 'react'
import { createTemplate } from '@/lib/actions/template-actions'
import { X, Loader2 } from 'lucide-react'

interface TemplateModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
    const [isPending, startTransition] = useTransition()
    const [channel, setChannel] = useState('email')

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                await createTemplate(formData)
                onClose()
            } catch (e) {
                alert('Failed to create template')
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">New Template</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input type="text" name="name" required className="input-field" placeholder="e.g. Intro Email v1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="category" className="input-field">
                                <option value="first_contact">First Contact</option>
                                <option value="follow_up">Follow Up</option>
                                <option value="meeting_request">Meeting Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
                        <div className="flex space-x-4">
                            {['email', 'linkedin', 'whatsapp'].map(c => (
                                <label key={c} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="channel"
                                        value={c}
                                        checked={channel === c}
                                        onChange={() => setChannel(c)}
                                        className="text-[#00A1E0] focus:ring-[#00A1E0]"
                                    />
                                    <span className="ml-2 capitalize text-sm text-slate-700">{c}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {channel === 'email' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input type="text" name="subject" className="input-field" placeholder="Subject line..." />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                        <div className="text-xs text-slate-500 mb-2">
                            Available variables: <code className="bg-slate-100 px-1 rounded">{'{{first_name}}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{{company_name}}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{{title}}'}</code>
                        </div>
                        <textarea
                            name="body"
                            required
                            rows={10}
                            className="input-field font-mono text-sm"
                            placeholder={`Hi {{first_name}},\n\nI noticed that {{company_name}} is...`}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
