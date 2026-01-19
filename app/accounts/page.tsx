import { getAccounts } from '@/lib/actions/account-actions'
import { AccountList } from '@/components/accounts/AccountList'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
    const accounts = await getAccounts()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Accounts</h1>
                    <p className="text-slate-500 mt-1">Manage your target accounts and portfolios.</p>
                </div>

                {/* We'll use a Client Component for the "New Account" button to toggle the modal, 
            or a Link to a separate page if we prefer. Given the requirements, "Modal: Nueva/Editar Cuenta",
            so we need a Client Component that contains the "New Account" button and the Modal.
        */}
                <AddAccountWrapper />
            </div>

            <Suspense fallback={<div>Loading accounts...</div>}>
                <AccountList accounts={accounts} />
            </Suspense>
        </div>
    )
}

// Simple wrapper to keep the main page server-rendered but allow client interaction
import { AddAccountWrapper } from '@/components/accounts/AddAccountWrapper'
