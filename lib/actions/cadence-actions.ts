'use server'

import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'
import { addBusinessDays } from '@/lib/utils/date-utils'

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
        const stepsToInsert = steps.map(s => ({
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

// CRITICAL LOGIC: Assign contact to cadence
export async function assignContactToCadence(contactId: string, cadenceId: string) {
    // 1. Check if already active? (Skip for MVP uniqueness check)

    // 2. Get Cadence Steps (specifically the first one)
    const { data: steps, error: stepsError } = await supabase
        .from('cadence_steps')
        .select('*')
        .eq('cadence_id', cadenceId)
        .order('step_number', { ascending: true })
        .limit(1)

    if (stepsError || !steps || steps.length === 0) {
        throw new Error('Cadence has no steps')
    }

    const firstStep = steps[0]

    // 3. Create contact_cadence record
    const { data: cc, error: ccError } = await supabase
        .from('contact_cadences')
        .insert({
            contact_id: contactId,
            cadence_id: cadenceId,
            current_step: firstStep.step_number,
            status: 'active',
            start_date: new Date().toISOString()
        })
        .select('id')
        .single()

    if (ccError || !cc) {
        console.error('Error assigning to cadence:', ccError)
        throw new Error('Failed to assign contact to cadence')
    }

    // 4. Create first Daily Task
    const dueDate = addBusinessDays(new Date(), firstStep.day_offset)

    const { error: taskError } = await supabase
        .from('daily_tasks')
        .insert({
            contact_cadence_id: cc.id,
            step_id: firstStep.id,
            due_date: dueDate.toISOString().split('T')[0], // Store as YYYY-MM-DD
            status: 'pending'
        })

    if (taskError) {
        console.error('Error creating initial task:', taskError)
        throw new Error('Failed to create initial task')
    }

    revalidatePath('/contacts')
    revalidatePath('/tasks')
}
