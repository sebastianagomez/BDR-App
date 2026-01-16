'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AccountModal } from './AccountModal'

export function AddAccountWrapper() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                New Account
            </button>

            {isModalOpen && (
                <AccountModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    )
}
