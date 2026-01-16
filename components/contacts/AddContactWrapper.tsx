'use client'

import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { ContactModal } from './ContactModal'
import { ImportContactsModal } from './ImportContactsModal'
import { Account } from '@/lib/actions/account-actions'

export function AddContactWrapper({ accounts }: { accounts: Account[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)

    return (
        <div className="flex space-x-3">
            <button
                onClick={() => setIsImportOpen(true)}
                className="btn-secondary flex items-center"
            >
                <Upload className="w-5 h-5 mr-2" />
                Import CSV
            </button>

            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                New Contact
            </button>

            {isModalOpen && (
                <ContactModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    accounts={accounts}
                />
            )}

            {isImportOpen && (
                <ImportContactsModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                />
            )}
        </div>
    )
}
