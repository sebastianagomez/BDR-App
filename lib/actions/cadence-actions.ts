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
}

export async function getCadences() {
    const { data, error } = await supabase
        .from('cadences')
        .select(`
      *,
      steps:cadence_steps(*)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching cadences:', error)
        return []
    }

    // Sort steps by step_number
    data.forEach((c: any) => {
        c.steps?.sort((a: any, b: any) => a.step_number - b.step_number)
    })

    return data as Cadence[]
}

export async function createCadence(name: string, description: string, steps: Omit<CadenceStep, 'id' | 'cadence_id'>[]) {
    // Transaction-like approach (supabase doesn't support transactions in client, but we can do sequential inserts)
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
            // Should probably delete the cadence if steps fail, but for MVP...
            throw new Error('Failed to create cadence steps')
        }
    }

    revalidatePath('/cadences')
    return cadence
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
