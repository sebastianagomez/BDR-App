'use client'

import { Template } from '@/lib/actions/template-actions'
import { Card } from '@/components/ui/Card'
import { FileText, Mail, Linkedin, Phone, Trash2 } from 'lucide-react'
import { deleteTemplate } from '@/lib/actions/template-actions'
import clsx from 'clsx'

export function TemplateList({ templates }: { templates: Template[] }) {
    if (templates.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No templates found</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Create templates to speed up your outreach.</p>
            </Card>
        )
    }

    const getIcon = (channel: string) => {
        switch (channel) {
            case 'email': return <Mail className="w-4 h-4" />
            case 'linkedin': return <Linkedin className="w-4 h-4" />
            case 'whatsapp': return <Phone className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
                <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                            <div className={clsx(
                                'p-2 rounded-lg',
                                template.channel === 'email' ? 'bg-blue-100 text-blue-600' :
                                    template.channel === 'linkedin' ? 'bg-sky-100 text-sky-700' :
                                        'bg-green-100 text-green-600'
                            )}>
                                {getIcon(template.channel)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 line-clamp-1">{template.name}</h3>
                                <p className="text-xs text-slate-500 capitalize">{template.category.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => deleteTemplate(template.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded p-3 mb-4 overflow-hidden">
                        {template.subject && (
                            <p className="text-xs font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-1">
                                Subject: {template.subject}
                            </p>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">
                            {template.body}
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-slate-100">
                        <span>{template.variables?.length || 0} variables</span>
                        <button className="text-[#00A1E0] hover:underline font-medium">Edit</button>
                    </div>
                </Card>
            ))}
        </div>
    )
}
