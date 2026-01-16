'use client'

import { useState, useTransition } from 'react'
import { createCadence } from '@/lib/actions/cadence-actions'
import { Template } from '@/lib/actions/template-actions'
import { X, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface CadenceBuilderModalProps {
    isOpen: boolean
    onClose: () => void
    templates: Template[]
}

type StepDraft = {
    step_number: number
    day_offset: number
    action_type: 'call' | 'email' | 'whatsapp' | 'linkedin_message' | 'linkedin_connection'
    title: string
    description: string
    template_id: string
}

export function CadenceBuilderModal({ isOpen, onClose, templates }: CadenceBuilderModalProps) {
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [steps, setSteps] = useState<StepDraft[]>([
        { step_number: 1, day_offset: 1, action_type: 'call', title: 'Intro Call', description: '', template_id: '' }
    ])

    const addStep = () => {
        const lastStep = steps[steps.length - 1]
        setSteps([
            ...steps,
            {
                step_number: steps.length + 1,
                day_offset: lastStep ? lastStep.day_offset + 2 : 1,
                action_type: 'email',
                title: `Step ${steps.length + 1}`,
                description: '',
                template_id: ''
            }
        ])
    }

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index)
        // Re-index step numbers
        const reindexedStats = newSteps.map((s, i) => ({ ...s, step_number: i + 1 }))
        setSteps(reindexedStats)
    }

    const updateStep = (index: number, field: keyof StepDraft, value: any) => {
        const newSteps = [...steps]
        newSteps[index] = { ...newSteps[index], [field]: value }
        setSteps(newSteps)
    }

    const handleSave = () => {
        if (!name) return alert('Name is required')

        startTransition(async () => {
            try {
                // Clean up template_id logic (empty string -> null)
                const cleanSteps = steps.map(s => ({
                    ...s,
                    template_id: s.template_id || null
                }))

                await createCadence(name, description, cleanSteps)
                onClose()
            } catch (e) {
                alert('Failed to save cadence')
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Cadence Builder</h2>
                        <p className="text-sm text-slate-500">Define your outreach steps</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                    {/* Header Info */}
                    <Card className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cadence Name *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Enterprise Tier 1 Outbound"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Targeting VP level..."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Steps Builder */}
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm relative group">
                                <div className="absolute left-2 top-4 text-slate-300">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="pl-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                    {/* Day Offset */}
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Day</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="input-field px-1 text-center"
                                            value={step.day_offset}
                                            onChange={(e) => updateStep(index, 'day_offset', parseInt(e.target.value))}
                                        />
                                    </div>

                                    {/* Action & Title */}
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Action Type</label>
                                        <select
                                            className="input-field"
                                            value={step.action_type}
                                            onChange={(e) => updateStep(index, 'action_type', e.target.value)}
                                        >
                                            <option value="call">Call</option>
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="linkedin_message">LinkedIn Message</option>
                                            <option value="linkedin_connection">LinkedIn Connection</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Step Title</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={step.title}
                                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                                            placeholder="Step Title"
                                        />
                                    </div>

                                    {/* Template */}
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Template (Optional)</label>
                                        <select
                                            className="input-field"
                                            value={step.template_id}
                                            onChange={(e) => updateStep(index, 'template_id', e.target.value)}
                                        >
                                            <option value="">No Template</option>
                                            {templates.filter(t =>
                                                // Simple channel matching
                                                (step.action_type.includes('email') && t.channel === 'email') ||
                                                (step.action_type.includes('linkedin') && t.channel === 'linkedin') ||
                                                (step.action_type === 'whatsapp' && t.channel === 'whatsapp')
                                            ).map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Delete */}
                                    <div className="md:col-span-1 pt-6 text-right">
                                        <button
                                            onClick={() => removeStep(index)}
                                            className="text-slate-300 hover:text-red-500 disabled:opacity-50"
                                            disabled={steps.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addStep}
                            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-[#00A1E0] hover:text-[#00A1E0] hover:bg-white transition-all flex items-center justify-center font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Next Step
                        </button>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-slate-100 bg-white">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="btn-primary flex items-center"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Cadence
                    </button>
                </div>
            </div>
        </div>
    )
}
