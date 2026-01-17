'use client'

import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AccountModal } from './AccountModal'
import { ContactModal } from '@/components/contacts/ContactModal'
import { deleteAccount, Account } from '@/lib/actions/account-actions'
import { clsx } from 'clsx'

interface AccountRowProps {
    account: Account
}

export function AccountRow({ account }: AccountRowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isAddContactOpen, setIsAddContactOpen] = useState(false)

    async function handleDelete() {
        if (confirm(`Are you sure you want to delete ${account.name}?`)) {
            await deleteAccount(account.id)
        }
    }

    return (
        <>
            <tr className="hover:bg-slate-50">
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
                        {account.portfolio?.map((p: string) => (
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
                    <div className="flex justify-end items-center space-x-2">
                        <button
                            onClick={() => setIsAddContactOpen(true)}
                            className="text-slate-400 hover:text-[#00A1E0] p-1 rounded-full hover:bg-slate-100 transition-colors tooltip"
                            title="Add Contact"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </td>
            </tr>

            {isEditOpen && (
                <AccountModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    account={account}
                />
            )}

            {isAddContactOpen && (
                <ContactModal
                    isOpen={isAddContactOpen}
                    onClose={() => setIsAddContactOpen(false)}
                    accounts={[account]}
                />
            )}
        </>
    )
}
