
'use client'


import { Cadence, deleteCadence } from '@/lib/actions/cadence-actions'
import { Template } from '@/lib/actions/template-actions'
import { Card } from '@/components/ui/Card'
import { Repeat, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { CadenceBuilderModal } from './CadenceBuilderModal'
import { ActiveContactsModal } from './ActiveContactsModal'
import { CadenceCard } from './CadenceCard'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CadenceList({ cadences, templates }: { cadences: Cadence[], templates: Template[] }) {
    const [editingCadence, setEditingCadence] = useState<Cadence | undefined>(undefined)
    const [viewingContactsCadence, setViewingContactsCadence] = useState<Cadence | undefined>(undefined)

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
            await deleteCadence(id)
        }
    }

    if (cadences.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Repeat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No cadences found</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Create a cadence to start automating your workflow.</p>
            </Card>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6">
                {cadences.map((cadence) => (
                    <CadenceCard
                        key={cadence.id}
                        cadence={cadence}
                        onEdit={setEditingCadence}
                        onDelete={handleDelete}
                        onViewContacts={setViewingContactsCadence}
                    />
                ))}
            </div>

            {/* Edit Modal */}
            <CadenceBuilderModal
                isOpen={!!editingCadence}
                onClose={() => setEditingCadence(undefined)}
                templates={templates}
                initialCadence={editingCadence}
            />

            {/* Active Contacts Modal */}
            <ActiveContactsModal
                isOpen={!!viewingContactsCadence}
                onClose={() => setViewingContactsCadence(undefined)}
                cadenceId={viewingContactsCadence?.id || ''}
                cadenceName={viewingContactsCadence?.name || ''}
            />
        </>
    )
}
