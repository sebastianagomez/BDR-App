'use client'

import { Cadence } from '@/lib/actions/cadence-actions'
import { Card } from '@/components/ui/Card'
import { Repeat, Play, Pause, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'

export function CadenceList({ cadences }: { cadences: Cadence[] }) {
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
        <div className="grid grid-cols-1 gap-6">
            {cadences.map((cadence) => (
                <Card key={cadence.id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                <Repeat className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center">
                                    <h3 className="text-lg font-semibold text-slate-900 mr-2">{cadence.name}</h3>
                                    <span className={clsx(
                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                        cadence.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                    )}>
                                        {cadence.is_active ? 'Active' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-slate-500 mt-1">{cadence.description || 'No description'}</p>

                                {/* Steps Visualization */}
                                <div className="mt-4 flex items-center space-x-2">
                                    {cadence.steps?.map((step, idx) => (
                                        <div key={step.id} className="flex items-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600" title={step.title}>
                                                    {step.day_offset}d
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 capitalize">{step.action_type.split('_')[0]}</span>
                                            </div>
                                            {idx < (cadence.steps?.length || 0) - 1 && (
                                                <div className="h-0.5 w-6 bg-slate-200 mx-1 mb-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button className="text-slate-400 hover:text-[#00A1E0]">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    )
}
