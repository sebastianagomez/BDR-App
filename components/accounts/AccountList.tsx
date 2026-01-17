'use client'

import { Account } from '@/lib/actions/account-actions'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, Filter } from 'lucide-react'
import { AccountRow } from './AccountRow'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function AccountList({ accounts }: { accounts: Account[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const filterTier = searchParams.get('tier') || 'all'

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

    if (accounts.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BadgeCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No accounts found</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by adding your first target account.</p>
            </Card>
        )
    }

    const filteredAccounts = accounts.filter(account => {
        if (filterTier === 'all') return true
        return account.tier === filterTier
    })

    return (
        <>
            <div className="flex justify-end mb-4 gap-3 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Filters:</span>
                </div>
                <select
                    className="block w-40 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#00A1E0] sm:text-sm sm:leading-6"
                    value={filterTier}
                    onChange={(e) => updateFilter('tier', e.target.value)}
                >
                    <option value="all">All Tiers</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                </select>
            </div>

            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tier</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Portfolio</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No accounts match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <AccountRow key={account.id} account={account} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}
