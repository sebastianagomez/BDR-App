'use client'

import { getAccountStatsByAE } from '@/lib/actions/account-actions'
import { useEffect, useState } from 'react'
import { Loader2, Users, Building, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

export function AEStatsWidget() {
    const [stats, setStats] = useState<Record<string, any> | null>(null)

    useEffect(() => {
        getAccountStatsByAE().then(setStats)
    }, [])

    if (!stats) {
        return (
            <div className="card min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
        )
    }

    const aes = Object.entries(stats).sort((a, b) => b[1].totalContacts - a[1].totalContacts)

    if (aes.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance by AE</h3>
                <p className="text-slate-500 text-sm">No account data available.</p>
            </div>
        )
    }

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance by AE</h3>

            <div className="space-y-4">
                {aes.map(([ae, data]) => (
                    <div key={ae} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                                ae === 'Unassigned' ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"
                            )}>
                                {ae.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900">{ae}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Building className="w-3 h-3" /> {data.totalAccounts} accs
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {data.totalContacts} contacts
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {data.tier1 > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800" title="Tier 1 Accounts">
                                    {data.tier1} T1
                                </span>
                            )}
                            {data.tier2 > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600" title="Tier 2 Accounts">
                                    {data.tier2} T2
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
