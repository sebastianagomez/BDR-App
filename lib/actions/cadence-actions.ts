'use server'

import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addBusinessDays } from '@/lib/utils/business-days'

export type CadenceStep = {
    id: string
    cadence_id: string
    step_number: number
    day_offset: number
    action_type: 'call' | 'email' | 'whatsapp' | 'linkedin_message' | 'linkedin_connection'
    title: string
    description: string | null
    template_id: string | null
}

export type Cadence = {
    id: string
    name: string
    description: string | null
    is_active: boolean
    created_at: string
    steps?: CadenceStep[]
    active_contacts_count?: number
}


export async function getCadences() {
    const { data, error } = await supabase
        .from('cadences')
        .select(`
      *,
      steps:cadence_steps(*),
      contact_cadences (status)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching cadences:', error)
        return []
    }

    // Sort steps and count active contacts
    const dataWithCounts = data.map((c: any) => {
        c.steps?.sort((a: any, b: any) => a.step_number - b.step_number)
        const activeCount = c.contact_cadences?.filter((cc: any) => cc.status === 'active').length || 0;
        return { ...c, active_contacts_count: activeCount }
    })

    return dataWithCounts as Cadence[]
}

export async function createCadence(name: string, description: string, steps: Omit<CadenceStep, 'id' | 'cadence_id'>[]) {
    // 1. Create Cadence
    const { data: cadence, error: cadenceError } = await supabase
        .from('cadences')
        .insert({ name, description, is_active: true })
        .select('id')
        .single()

    if (cadenceError || !cadence) {
        console.error('Error creating cadence:', cadenceError)
        throw new Error('Failed to create cadence')
    }

    // 2. Create Steps
    if (steps.length > 0) {
        const stepsToInsert = steps.map((s) => ({
            cadence_id: cadence.id,
            step_number: s.step_number,
            day_offset: s.day_offset,
            action_type: s.action_type,
            title: s.title,
            description: s.description,
            template_id: s.template_id
        }))

        const { error: stepsError } = await supabase
            .from('cadence_steps')
            .insert(stepsToInsert)

        if (stepsError) {
            console.error('Error creating cadence steps:', stepsError)
            throw new Error('Failed to create cadence steps')
        }
    }

    revalidatePath('/cadences')
    return cadence
}

export async function updateCadence(id: string, name: string, description: string, steps: any[]) {
    // 1. Update Cadence Metadata
    const { error: cadenceError } = await supabase
        .from('cadences')
        .update({ name, description })
        .eq('id', id)

    if (cadenceError) throw new Error('Failed to update cadence metadata')

    // 2. Handle Steps
    // Fetch existing steps to compare
    const { data: existingSteps } = await supabase
        .from('cadence_steps')
        .select('id')
        .eq('cadence_id', id)

    const existingStepIds = new Set(existingSteps?.map(s => s.id) || [])
    const incomingStepIds = new Set(steps.filter(s => s.id).map(s => s.id))

    // Determine steps to delete (existing but not in incoming)
    const stepsToDelete = Array.from(existingStepIds).filter(id => !incomingStepIds.has(id))

    if (stepsToDelete.length > 0) {
        await supabase.from('cadence_steps').delete().in('id', stepsToDelete)
    }

    // Upsert (Update existing / Insert new)
    const stepsToUpsert = steps.map((s: any) => ({
        id: s.id,
        cadence_id: id,
        step_number: s.step_number,
        day_offset: s.day_offset,
        action_type: s.action_type,
        title: s.title,
        description: s.description,
        template_id: s.template_id || null
    }))

    // Separate update vs insert to be safe
    const toUpdate = stepsToUpsert.filter((s: any) => s.id)
    const toInsert = stepsToUpsert.filter((s: any) => !s.id).map(({ id, ...rest }: any) => rest)

    if (toUpdate.length > 0) {
        // 1. Shift all existing steps in toUpdate to avoid collisions
        for (const s of toUpdate) {
            await supabase.from('cadence_steps').update({ step_number: s.step_number + 1000 }).eq('id', s.id)
        }
        // 2. Now set them to the correct values
        for (const s of toUpdate) {
            await supabase.from('cadence_steps').update(s).eq('id', s.id)
        }
    }

    if (toInsert.length > 0) {
        await supabase.from('cadence_steps').insert(toInsert)
    }

    revalidatePath('/cadences')
}

export async function deleteCadence(id: string) {
    const { error } = await supabase
        .from('cadences')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting cadence:', error)
        throw new Error('Failed to delete cadence')
    }

    revalidatePath('/cadences')
}

export async function addContactToCadence(
    contactId: string,
    cadenceId: string,
    startDate: Date = new Date()
) {
    // 1. Create contact_cadence record
    const { data: contactCadence, error: ccError } = await supabaseServer
        .from('contact_cadences')
        .insert({
            contact_id: contactId,
            cadence_id: cadenceId,
            current_step: 1,
            status: 'active',
            start_date: startDate.toISOString().split('T')[0]
        })
        .select()
        .single();

    if (ccError) throw new Error('Failed to add contact to cadence');

    // 2. Get first step
    const { data: firstStep } = await supabaseServer
        .from('cadence_steps')
        .select('*')
        .eq('cadence_id', cadenceId)
        .order('step_number', { ascending: true })
        .limit(1)
        .single();

    if (!firstStep) throw new Error('Cadence has no steps');

    // 3. Calculate due date (business days)
    const dueDate = addBusinessDays(startDate, firstStep.day_offset);

    // 4. Create first task
    await supabaseServer
        .from('daily_tasks')
        .insert({
            contact_cadence_id: contactCadence.id,
            step_id: firstStep.id,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending'
        });

    revalidatePath('/tasks');
    revalidatePath('/contacts');
}

export async function getCadenceContacts(cadenceId: string) {
    console.log('Fetching active contacts for cadence:', cadenceId)

    // 1. Fetch contacts WITH accounts relationship
    const { data: contactsData, error: contactsError } = await supabaseServer
        .from('contact_cadences')
        .select(`
            status,
            current_step,
            contact_id,
            contacts!inner(
                id, 
                name, 
                title,
                email,
                accounts!inner(
                    name
                )
            )
        `)
        .eq('cadence_id', cadenceId)
        .eq('status', 'active')
        .order('current_step', { ascending: true });

    if (contactsError) {
        console.error('Error fetching cadence contacts (supabaseServer):', contactsError);
        return [];
    }

    console.log('Contacts Data Found:', contactsData?.length)

    // 2. Fetch steps
    const { data: stepsData } = await supabaseServer
        .from('cadence_steps')
        .select('step_number, title')
        .eq('cadence_id', cadenceId);

    // 3. Merge (Client-side join)
    const stepsMap = new Map();
    stepsData?.forEach((s: any) => stepsMap.set(s.step_number, s));

    const result = contactsData.map((cc: any) => ({
        ...cc,
        contact: {
            ...cc.contacts,
            company: cc.contacts.accounts.name // Extraer company name de accounts
        },
        step: stepsMap.get(cc.current_step) || { 
            step_number: cc.current_step, 
            title: 'Unknown Step' 
        }
    }));

    return result;
}
