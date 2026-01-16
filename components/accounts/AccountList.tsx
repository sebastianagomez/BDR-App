'use client'

import { Account } from '@/lib/actions/account-actions'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'

export function AccountList({ accounts }: { accounts: Account[] }) {
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

    return (
        <Card noPadding className="overflow-hidden">
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
                    {accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-slate-900">{account.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={clsx(
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    account.tier === 'Tier 1' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                )}>
                                    {account.tier}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                    {account.portfolio?.map((p) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {account.industry || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-slate-400 hover:text-[#00A1E0]">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    )
}
