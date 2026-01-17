'use client'

import { Card } from '@/components/ui/Card'
import { AlertCircle, ArrowRight, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface SmartInsightsProps {
    overdueCount: number
    stuckContactsCount?: number // Contacts in cadence but no future tasks/activity?
    missedCadenceStepCount?: number
}

export function SmartInsights({ overdueCount, stuckContactsCount = 0 }: SmartInsightsProps) {
    // If everything is good, show a positive message or nothing
    if (overdueCount === 0 && stuckContactsCount === 0) {
        return (
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-900">All systems go!</h3>
                        <p className="text-sm text-emerald-700 mt-1">
                            You are fully caught up. Consider adding more prospects to your cadences to keep the pipeline full.
                        </p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Smart Insights</h3>
            </div>

            <div className="space-y-3">
                {overdueCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{overdueCount} tasks are overdue</span>
                        </div>
                        <Link href="/tasks" className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center">
                            View Actions <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                )}

                {/* Placeholder logic for stuck contacts if we implemented query */}
                {stuckContactsCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-md border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{stuckContactsCount} contacts seem stuck</span>
                        </div>
                        <Link href="/contacts" className="text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center">
                            Review <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                )}
            </div>
        </Card>
    )
}
