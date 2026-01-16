'use server'

import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export type Contact = {
    id: string
    account_id: string
    name: string
    title: string | null
    email: string | null
    phone: string | null
    linkedin_url: string | null
    status: 'not_contacted' | 'in_cadence' | 'contacted' | 'meeting_booked' | 'lost'
    notes: string | null
    created_at: string
    accounts?: {
        name: string
    }
}

export async function getContacts() {
    const { data, error } = await supabase
        .from('contacts')
        .select(`
      *,
      accounts (
        name
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching contacts:', error)
        return []
    }

    return data as Contact[]
}

export async function createContact(formData: FormData) {
    const account_id = formData.get('account_id') as string
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const linkedin_url = formData.get('linkedin_url') as string
    const notes = formData.get('notes') as string
    const status = formData.get('status') as string || 'not_contacted'

    const { error } = await supabase
        .from('contacts')
        .insert({
            account_id,
            name,
            title,
            email,
            phone,
            linkedin_url,
            notes,
            status
        })

    if (error) {
        console.error('Error creating contact:', error)
        throw new Error('Failed to create contact')
    }

    revalidatePath('/contacts')
}

export async function importContacts(contacts: any[]) {
    // This expects an array of objects to insert.
    // We need to handle account matching here or assume account_id is provided or derived?
    // For MVP, limit import to "importing into specific account" OR try to match by account name.
    // Let's implement logic to find account ID by name, or create if not exists?
    // Simplified: Require account name in CSV.

    // For this Server Action, let's assume the client has done the mapping and sends prepared data 
    // OR we receive raw data and map account names to IDs.

    // Let's fetch all accounts first to create a map
    const { data: accounts } = await supabase.from('accounts').select('id, name')
    const accountMap = new Map(accounts?.map(a => [a.name.toLowerCase(), a.id]))

    const preparedContacts = []

    for (const c of contacts) {
        let accountId = accountMap.get(c.company?.toLowerCase())

        // If account not found, SKIP for MVP or Create? 
        // User spec says: "Empresa -> buscar en accounts existentes o crear nueva"
        if (!accountId && c.company) {
            const { data: newAccount, error } = await supabase
                .from('accounts')
                .insert({ name: c.company, tier: 'Tier 2' }) // Default to Tier 2
                .select('id')
                .single()

            if (newAccount) {
                accountId = newAccount.id
                accountMap.set(c.company.toLowerCase(), accountId)
            }
        }

        if (accountId) {
            preparedContacts.push({
                account_id: accountId,
                name: c.name,
                title: c.title,
                email: c.email,
                phone: c.phone,
                linkedin_url: c.linkedin,
                status: 'not_contacted'
            })
        }
    }

    if (preparedContacts.length > 0) {
        const { error } = await supabase
            .from('contacts')
            .insert(preparedContacts)

        if (error) {
            console.error('Error importing contacts:', error)
            throw new Error('Failed to import contacts')
        }
    }

    revalidatePath('/contacts')
    revalidatePath('/accounts')
}
