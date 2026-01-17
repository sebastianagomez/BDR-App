import { getContactById } from '@/lib/actions/contact-actions'
import { ActivityTimeline } from '@/components/contacts/ActivityTimeline'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Mail, Phone, Linkedin, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Correct handling of params in Next.js 15+ (if strictly async params are enforced in newer versions, 
// using await params is safer, but standard page props usually work fine as { params: { id: string } })
// Let's assume standard Next.js App Router behavior.

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
    const contact = await getContactById(params.id)

    if (!contact) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/contacts" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{contact.name}</h1>
                    <p className="text-slate-500">{contact.title} @ {contact.accounts?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="font-medium text-slate-900 mb-4">Contact Details</h3>
                        <div className="space-y-3">
                            {contact.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline overflow-hidden text-ellipsis">{contact.email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <a href={`tel:${contact.phone}`} className="text-slate-700 hover:text-slate-900">{contact.phone}</a>
                                </div>
                            )}
                            {contact.linkedin_url && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Linkedin className="w-4 h-4 text-slate-400" />
                                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
                                </div>
                            )}
                            {contact.accounts && (
                                <div className="flex items-center gap-3 text-sm pt-2 border-t border-slate-100 mt-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-700">{contact.accounts.name}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                        {contact.accounts.tier}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {contact.notes && (
                        <Card>
                            <h3 className="font-medium text-slate-900 mb-2">Notes</h3>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{contact.notes}</p>
                        </Card>
                    )}
                </div>

                {/* Right Column: Timeline & Cadence */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Cadence Status */}
                    {contact.active_cadence && (
                        <Card className="bg-slate-50 border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">Active Cadence: {contact.active_cadence.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Step {contact.active_cadence.current_step} of {contact.active_cadence.total_steps}
                                    </p>
                                </div>
                                {contact.next_task && (
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next Step</span>
                                        <p className="text-sm font-medium text-blue-600">
                                            {contact.next_task.action_type.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Due {new Date(contact.next_task.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <h3 className="font-medium text-slate-900 mb-6">Activity Timeline</h3>
                        <ActivityTimeline history={contact.history} />
                    </Card>
                </div>
            </div>
        </div>
    )
}
