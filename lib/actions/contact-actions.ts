'use server'

import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
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
        tier: string
    }
    active_cadence?: {
        name: string
        current_step: number
        total_steps: number
        last_action_date: string | null
    } | null
    next_task?: {
        due_date: string
        action_type: string
    } | null
}

export async function getContacts() {
    const { data, error } = await supabaseServer
        .from('contacts')
        .select(`
      *,
      accounts (
        name,
        tier
      ),
      contact_cadences (
        id,
        status,
        current_step,
        last_action_date,
        cadences (
            name,
            cadence_steps (id)
        )
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching contacts:', error)
        return []
    }

    // Process data to flatten structure for UI consumption
    // We want the *active* cadence if any, and its info.
    // We also want next task? That might require another join or subquery on daily_tasks.
    // Let's try to join daily_tasks for this contact where status=pending?
    // Supabase can do deep joins.

    // Re-query with deep joins? Or separate query?
    // Let's optimize: fetch contacts + active cadence info.
    // For 'next_action', we can look at the active cadence's next step or pending task.
    // Fetching pending tasks separately might be cleaner or join `daily_tasks`.

    const contactsWithContext = await Promise.all(data.map(async (contact: any) => {
        try {
            const activeCadence = contact.contact_cadences?.find((cc: any) => cc.status === 'active');

            let nextTask = null;
            if (activeCadence) {
                const { data: task } = await supabaseServer
                    .from('daily_tasks')
                    .select('due_date, cadence_steps(action_type)')
                    .eq('contact_cadence_id', activeCadence.id)
                    .eq('status', 'pending')
                    .order('due_date', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (task) {
                    const step = Array.isArray(task.cadence_steps) ? task.cadence_steps[0] : task.cadence_steps;
                    nextTask = {
                        due_date: task.due_date,
                        action_type: step?.action_type
                    };
                }
            }

            return {
                ...contact,
                active_cadence: activeCadence ? {
                    name: activeCadence.cadences?.name || 'Unknown Cadence',
                    current_step: activeCadence.current_step,
                    total_steps: activeCadence.cadences?.cadence_steps?.length || 0,
                    // Use contact's last activity if available (more precise), falling back to cadence last action
                    last_action_date: contact.last_activity_date || activeCadence.last_action_date
                } : null,
                next_task: nextTask
            };
        } catch (error) {
            console.error('Error processing contact context:', error);
            return contact;
        }
    }));

    return contactsWithContext as Contact[]
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

export async function updateContact(id: string, formData: FormData) {
    const account_id = formData.get('account_id') as string
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const linkedin_url = formData.get('linkedin_url') as string
    const notes = formData.get('notes') as string
    const status = formData.get('status') as string

    const { error } = await supabase
        .from('contacts')
        .update({
            account_id,
            name,
            title,
            email,
            phone,
            linkedin_url,
            notes,
            status
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating contact:', error)
        throw new Error('Failed to update contact')
    }

    revalidatePath('/contacts')
}

export async function deleteContact(id: string) {
    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting contact:', error)
        throw new Error('Failed to delete contact')
    }

    revalidatePath('/contacts')
    revalidatePath('/accounts')
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

export async function getContactById(id: string) {
    const { data: contact, error } = await supabaseServer
        .from('contacts')
        .select(`
      *,
      accounts (
        id,
        name,
        tier
      ),
      contact_cadences (
        id,
        status,
        current_step,
        last_action_date,
        cadences (
            id,
            name,
            cadence_steps (id)
        )
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching contact:', error)
        return null
    }

    // Fetch history (completed tasks)
    const { data: history } = await supabaseServer
        .from('daily_tasks')
        .select(`
            *,
            cadence_steps (
                action_type,
                title
            ),
            cadences ( name )
        `)
        .eq('status', 'completed')
        // We need to filter by contact_id, but daily_tasks is linked via contact_cadence_id.
        // We can get all contact_cadence_ids for this contact.
        .in('contact_cadence_id', contact.contact_cadences.map((cc: any) => cc.id))
        .order('completed_at', { ascending: false })

    // Fetch next tasks (pending)
    const activeCadence = contact.contact_cadences?.find((cc: any) => cc.status === 'active');
    let nextTask = null;
    if (activeCadence) {
        const { data: task } = await supabaseServer
            .from('daily_tasks')
            .select('due_date, cadence_steps(action_type)')
            .eq('contact_cadence_id', activeCadence.id)
            .eq('status', 'pending')
            .order('due_date', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (task) {
            const step = Array.isArray(task.cadence_steps) ? task.cadence_steps[0] : task.cadence_steps;
            nextTask = {
                due_date: task.due_date,
                action_type: step?.action_type
            };
        }
    }

    return {
        ...contact,
        active_cadence: activeCadence ? {
            name: activeCadence.cadences?.name || 'Unknown Cadence',
            current_step: activeCadence.current_step,
            total_steps: activeCadence.cadences?.cadence_steps?.length || 0,
            last_action_date: activeCadence.last_action_date
        } : null,
        next_task: nextTask,
        history: history || []
    };
}
