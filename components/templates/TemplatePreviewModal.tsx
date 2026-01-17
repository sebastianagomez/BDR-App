'use client'

import { X, Copy, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useState } from 'react'

interface TemplatePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    template: {
        name: string
        subject: string
        body: string
    } | null
}

export function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
    const [copied, setCopied] = useState(false)

    if (!isOpen || !template) return null

    const handleCopy = () => {
        const text = `Subject: ${template.subject}\n\n${template.body}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleMailTo = () => {
        const subject = encodeURIComponent(template.subject)
        const body = encodeURIComponent(template.body)
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{template.name}</h2>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Email Template</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50">
                    <div className="bg-white border rounded shadow-sm p-6 space-y-4">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</span>
                            <div className="text-slate-900 font-medium mt-1 pb-2 border-b border-slate-100">
                                {template.subject}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Body</span>
                            <div className="text-slate-700 mt-2 whitespace-pre-wrap font-sans">
                                {template.body}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button
                        onClick={handleCopy}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button
                        onClick={handleMailTo}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Mail className="w-4 h-4" />
                        Open in Email App
                    </button>
                </div>
            </div>
        </div>
    )
}
