'use client'

import { useState, useTransition } from 'react'
import { importContacts } from '@/lib/actions/contact-actions'
import { X, Loader2, Upload, FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

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
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
            complete: (results) => {
                const contacts = results.data
                    .map((row: any) => ({
                        name: row.name || row.Name || '',
                        company: row.company || row.Company || '',
                        title: row.title || row.Title || row.cargo || '',
                        email: row.email || row.Email || '',
                        phone: row.phone || row.Phone || row.telefono || '',
                        linkedin_url: row.linkedin_url || row['linkedin url'] || row.linkedin || ''
                    }))
                    .filter((c: any) => c.name.trim() && c.company.trim());

                if (contacts.length === 0) {
                    setError('No valid contacts. Name and Company required.');
                    setPreview([])
                    return;
                }

                // Match companies to existing accounts is tricky client-side without fetching all accounts.
                // The user code suggests: 
                // const { data: account } = await supabase.from('accounts')... inside map.
                // But this is async inside Papa.parse synchronous callback? No, complete is a callback.
                // But we can't await inside map easily for all rows without Promise.all.
                // The user provided logic:
                /*
                const contactsWithAccounts = await Promise.all(contacts.map(...))
                */
                // So I need to make the complete callback async or handle the promise inside.

                // Let's implement the matching logic if we have access to supabase client here.
                // Import supabase client? Using import { supabase } from '@/lib/supabase/client'

                startTransition(async () => {
                    // Since I cannot pass async to complete directly or it's void, I'll do the processing here.
                    // Wait, I can't await inside the sync callback easily unless I trigger a new async flow.
                    // I will run the async matching logic here.

                    const { createClient } = await import('@supabase/supabase-js')
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    const supabase = createClient(supabaseUrl, supabaseKey)

                    const contactsWithAccounts = await Promise.all(
                        contacts.map(async (contact: any) => {
                            const { data: account } = await supabase
                                .from('accounts')
                                .select('id')
                                .ilike('name', contact.company)
                                .single(); // ilike for case insensitive matching

                            return {
                                ...contact,
                                account_id: account?.id || null,
                                needs_new_account: !account
                            };
                        })
                    );

                    setPreview(contactsWithAccounts);
                    setError(null);
                })
            },
            error: (err) => {
                setError('Error parsing CSV: ' + err.message);
            }
        });
    }

    const handleImport = () => {
        if (!file || preview.length === 0) return

        startTransition(async () => {
            try {
                // Import all parsed contacts (preview contains all valid ones now)
                await importContacts(preview)
                onClose()
                // Reset state
                setFile(null)
                setPreview([])
            } catch (e) {
                setError("Failed to import contacts.")
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">Import Contacts</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
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
                                <button onClick={() => { setFile(null); setPreview([]); setError(null) }} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {preview.length > 0 && (
                                <div className="border border-slate-200 rounded overflow-hidden">
                                    <div className="bg-blue-50 p-3 text-xs text-blue-700 font-medium">
                                        Ready to import {preview.length} contacts
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Company</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Title</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {preview.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-900">{row.name}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{row.company}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{row.title}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {preview.length > 5 && (
                                        <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500 text-center border-t border-slate-200">
                                            ...and {preview.length - 5} more
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
                            disabled={!file || preview.length === 0 || isPending}
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
