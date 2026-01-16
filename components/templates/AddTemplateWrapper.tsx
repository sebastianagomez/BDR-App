'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TemplateModal } from './TemplateModal'

export function AddTemplateWrapper() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                New Template
            </button>

            {isModalOpen && (
                <TemplateModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    )
}
