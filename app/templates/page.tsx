import { getTemplates } from '@/lib/actions/template-actions'
import { TemplateList } from '@/components/templates/TemplateList'
import { AddTemplateWrapper } from '@/components/templates/AddTemplateWrapper'

export default async function TemplatesPage() {
    const templates = await getTemplates()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
                    <p className="text-slate-500 mt-1">Manage reusable messages for emails, LinkedIn, and WhatsApp.</p>
                </div>

                <AddTemplateWrapper />
            </div>

            <TemplateList templates={templates} />
        </div>
    )
}
