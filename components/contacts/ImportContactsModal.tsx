'use client'

import { useState, useTransition } from 'react'
import { importContacts } from '@/lib/actions/contact-actions'
import { X, Loader2, Upload, FileText, AlertCircle } from 'lucide-react'

interface ImportContactsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ImportContactsModal({ isOpen, onClose }: ImportContactsModalProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            parseCSV(selectedFile)
        }
    }

    const parseCSV = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            // Simple CSV parser for MVP
            const lines = text.split('\n').filter(l => l.trim())
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

            // Expected headers like name, company, title, email
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                const entry: any = {}
                headers.forEach((h, i) => {
                    if (values[i]) {
                        // Determine field mapping
                        if (h.includes('name')) entry.name = values[i]
                        else if (h.includes('company') || h.includes('prospect account')) entry.company = values[i]
                        else if (h.includes('title') || h.includes('position')) entry.title = values[i]
                        else if (h.includes('email')) entry.email = values[i]
                        else if (h.includes('phone')) entry.phone = values[i]
                        else if (h.includes('linkedin')) entry.linkedin = values[i]
                    }
                })
                return entry
            }).filter(item => item.name && item.company) // Must have Name and Company

            setPreview(data.slice(0, 5)) // Show first 5
        }
        reader.readAsText(file)
    }

    const handleImport = () => {
        if (!file) return
        setError(null)

        // Check if we parsed anything valid
        // We need to re-parse all to send, since preview is slice
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const lines = text.split('\n').filter(l => l.trim())
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

            const allData = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                const entry: any = {}
                headers.forEach((h, i) => {
                    if (values[i]) {
                        if (h.includes('name')) entry.name = values[i]
                        else if (h.includes('company') || h.includes('account')) entry.company = values[i]
                        else if (h.includes('title')) entry.title = values[i]
                        else if (h.includes('email')) entry.email = values[i]
                        else if (h.includes('phone')) entry.phone = values[i]
                        else if (h.includes('linkedin')) entry.linkedin = values[i]
                    }
                })
                return entry
            }).filter(item => item.name && item.company)

            if (allData.length === 0) {
                setError("No valid contacts found. CSV must have headers Name and Company.")
                return
            }

            startTransition(async () => {
                try {
                    await importContacts(allData)
                    onClose()
                } catch (e) {
                    setError("Failed to import contacts.")
                }
            })
        }
        reader.readAsText(file)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">Import Contacts</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!file ? (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 mb-2">Drag and drop your CSV here, or click to browse</p>
                            <p className="text-xs text-slate-400">Required columns: Name, Company</p>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                id="csv-upload"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="csv-upload"
                                className="btn-secondary mt-4 inline-block cursor-pointer"
                            >
                                Select CSV File
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                                <div className="flex items-center">
                                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="font-medium text-sm">{file.name}</span>
                                </div>
                                <button onClick={() => { setFile(null); setPreview([]) }} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 font-medium">
                                Found columns: Name, Company, Title, Email...
                            </div>

                            {preview.length > 0 && (
                                <div className="border border-slate-200 rounded overflow-hidden">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Company</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Title</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {preview.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-900">{row.name}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{row.company}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{row.title}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {preview.length > 0 && (
                                        <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500 text-center border-t border-slate-200">
                                            Showing first {preview.length} rows...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                            <AlertCircle className="w-4 h-4" />
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
                            onClick={handleImport}
                            className="btn-primary flex items-center"
                            disabled={!file || isPending}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Import Contacts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
