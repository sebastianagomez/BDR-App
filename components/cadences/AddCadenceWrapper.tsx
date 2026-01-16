'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CadenceBuilderModal } from './CadenceBuilderModal'
import { Template } from '@/lib/actions/template-actions'

export function AddCadenceWrapper({ templates }: { templates: Template[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                New Cadence
            </button>

            {isModalOpen && (
                <CadenceBuilderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    templates={templates}
                />
            )}
        </>
    )
}
