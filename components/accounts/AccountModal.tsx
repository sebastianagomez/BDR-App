'use client'

import { useState, useTransition, useEffect } from 'react'
import { createAccount, updateAccount, Account } from '@/lib/actions/account-actions'
import { X, Loader2 } from 'lucide-react'

interface AccountModalProps {
    isOpen: boolean
    onClose: () => void
    account?: Account | null
}

export function AccountModal({ isOpen, onClose, account }: AccountModalProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [portfolioState, setPortfolioState] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && account) {
            setPortfolioState(account.portfolio || [])
        } else if (isOpen && !account) {
            setPortfolioState([])
        }
    }, [isOpen, account])

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            try {
                if (account) {
                    await updateAccount(account.id, formData)
                } else {
                    await createAccount(formData)
                }
                onClose()
            } catch (e) {
                setError(`Failed to ${account ? 'update' : 'create'} account. Please try again.`)
            }
        })
    }

    if (!isOpen) return null

    const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (e.target.checked) {
            setPortfolioState([...portfolioState, value])
        } else {
            setPortfolioState(portfolioState.filter(p => p !== value))
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">{account ? 'Edit Account' : 'Add New Account'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Account Name *</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            defaultValue={account?.name || ''}
                            className="input-field"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div>
                        <label htmlFor="tier" className="block text-sm font-medium text-slate-700 mb-1">Tier *</label>
                        <select
                            name="tier"
                            id="tier"
                            required
                            defaultValue={account?.tier || 'Tier 2'}
                            className="input-field"
                        >
                            <option value="Tier 1">Tier 1</option>
                            <option value="Tier 2">Tier 2</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio</label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="portfolio"
                                    value="Marketing Cloud"
                                    onChange={handlePortfolioChange}
                                    checked={portfolioState.includes("Marketing Cloud")}
                                    className="rounded text-[#00A1E0] focus:ring-[#00A1E0]"
                                />
                                <span className="ml-2 text-sm text-slate-600">Marketing Cloud</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="portfolio"
                                    value="Commerce Cloud"
                                    onChange={handlePortfolioChange}
                                    checked={portfolioState.includes("Commerce Cloud")}
                                    className="rounded text-[#00A1E0] focus:ring-[#00A1E0]"
                                />
                                <span className="ml-2 text-sm text-slate-600">Commerce Cloud</span>
                            </label>
                            {/* Hidden inputs to make sure we send all values if doing standard form post, 
                                but since createAccount uses getAll('portfolio'), checked checkboxes are enough. 
                                React state is just for UI control here. 
                            */}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                        <input
                            type="text"
                            name="industry"
                            id="industry"
                            defaultValue={account?.industry || ''}
                            className="input-field"
                            placeholder="e.g. Retail"
                        />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            defaultValue={account?.notes || ''}
                            className="input-field"
                            placeholder="Strategic notes..."
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
                            {account ? 'Update Account' : 'Save Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
