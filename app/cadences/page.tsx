import { getCadences } from '@/lib/actions/cadence-actions'
import { getTemplates } from '@/lib/actions/template-actions'
import { CadenceList } from '@/components/cadences/CadenceList'
import { AddCadenceWrapper } from '@/components/cadences/AddCadenceWrapper'

export default async function CadencesPage() {
    const cadences = await getCadences()
    const templates = await getTemplates() // Needed for the builder

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Cadences</h1>
                    <p className="text-slate-500 mt-1">Design your outreach sequences.</p>
                </div>

                <AddCadenceWrapper templates={templates} />
            </div>

            <CadenceList cadences={cadences} templates={templates} />
        </div>
    )
}
