import { getContacts } from '@/lib/actions/contact-actions'
import { getAccounts } from '@/lib/actions/account-actions'
import { getCadences } from '@/lib/actions/cadence-actions'
import { ContactList } from '@/components/contacts/ContactList'
import { AddContactWrapper } from '@/components/contacts/AddContactWrapper'

export default async function ContactsPage() {
    const contacts = await getContacts()
    const accounts = await getAccounts()
    const cadences = await getCadences()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
                    <p className="text-slate-500 mt-1">Manage all your prospect details.</p>
                </div>

                <AddContactWrapper accounts={accounts} />
            </div>

            <ContactList contacts={contacts} cadences={cadences} />
        </div>
    )
}
