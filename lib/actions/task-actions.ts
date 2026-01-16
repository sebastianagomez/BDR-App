'use server'

import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'
import { addBusinessDays } from '@/lib/utils/date-utils'
import { addDays, parseISO, differenceInDays } from 'date-fns'

export type DailyTask = {
    id: string
    contact_cadence_id: string
    step_id: string
    due_date: string
    status: 'pending' | 'completed' | 'skipped' | 'postponed'
    notes: string | null
    contact_cadences: {
        contact_id: string
        current_step: number
        contacts: {
            name: string
            title: string
            accounts: {
                name: string
                tier: string
            }
        }
    }
    cadence_steps: {
        step_number: number
        day_offset: number
        action_type: 'call' | 'email' | 'whatsapp' | 'linkedin_message' | 'linkedin_connection'
        template_id: string | null
        templates?: {
            name: string
            body: string
            subject: string
        }
    }
}

export async function getDailyTasks() {
    const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

    // Fetch pending tasks. 
    // In real app we might want tasks due on or before today.

    const { data, error } = await supabase
        .from('daily_tasks')
        .select(`
      *,
      contact_cadences (
        contact_id,
        current_step,
        contacts (
            name,
            title,
            accounts (
                name,
                tier
            )
        )
      ),
      cadence_steps (
        step_number,
        day_offset,
        action_type,
        template_id,
        templates (
            name,
            body,
            subject
        )
      )
    `)
        .eq('status', 'pending')
        .lte('due_date', today) // Show tasks due today or overdue
        .order('due_date', { ascending: true })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return data as unknown as DailyTask[]
}

export async function completeTask(taskId: string, contactCadenceId: string, currentStepNumber: number) {
    // 1. Mark task as completed
    const { error: updateError } = await supabase
        .from('daily_tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', taskId)

    if (updateError) throw new Error('Failed to complete task')

    // 2. Find Next Step
    // We need to know which cadence this is. 
    // We can fetch the contact_cadence to get the cadence_id
    const { data: cc, error: ccError } = await supabase
        .from('contact_cadences')
        .select('cadence_id')
        .eq('id', contactCadenceId)
        .single()

    if (ccError || !cc) throw new Error('Contact cadence not found')

    const nextStepNumber = currentStepNumber + 1

    const { data: nextStep, error: stepError } = await supabase
        .from('cadence_steps')
        .select('*')
        .eq('cadence_id', cc.cadence_id)
        .eq('step_number', nextStepNumber)
        .single()

    if (nextStep) {
        // NEXT STEP EXISTS -> Schedule it.
        // Calculate due date. 
        // Logic: due_date = TODAY + (nextStep.day_offset - currentStep.day_offset) ??
        // Actually, user requirement says: "due_date = hoy + (next_step.day_offset - current_step.day_offset)"
        // But we need the current step's day offset. 
        // Let's simplified: due_date = START_DATE + nextStep.day_offset.
        // OR: due_date = TODAY + (gap between steps).
        // Let's use the GAP approach to be dynamic based on when they completed the previous task.

        // We need current step to calculate gap.
        const { data: currentStep } = await supabase
            .from('cadence_steps')
            .select('day_offset')
            .eq('cadence_id', cc.cadence_id)
            .eq('step_number', currentStepNumber)
            .single()

        const gap = (nextStep.day_offset - (currentStep?.day_offset || 0))
        const nextDate = addBusinessDays(new Date(), Math.max(1, gap)) // Ensure at least 1 day or follow gap

        // Create new task
        await supabase.from('daily_tasks').insert({
            contact_cadence_id: contactCadenceId,
            step_id: nextStep.id,
            due_date: nextDate.toISOString().split('T')[0], // Store as YYYY-MM-DD
            status: 'pending'
        })

        // Update contact cadence current step
        await supabase.from('contact_cadences').update({
            current_step: nextStepNumber,
            last_action_date: new Date().toISOString()
        }).eq('id', contactCadenceId)

    } else {
        // NO NEXT STEP -> COMPLETED
        await supabase.from('contact_cadences').update({
            status: 'completed',
            last_action_date: new Date().toISOString()
        }).eq('id', contactCadenceId)

        // Also update contact status?
        // await supabase.from('contacts').update({ status: 'contacted' })... // Logic depends on meaningful outcome
    }

    revalidatePath('/tasks')
}

export async function skipTask(taskId: string, contactCadenceId: string, currentStepNumber: number, note?: string) {
    // 1. Mark task as skipped
    const { error: updateError } = await supabase
        .from('daily_tasks')
        .update({ status: 'skipped', completed_at: new Date().toISOString(), notes: note })
        .eq('id', taskId)

    if (updateError) throw new Error('Failed to skip task')

    // 2. Find Next Step Logic
    const { data: cc, error: ccError } = await supabase
        .from('contact_cadences')
        .select('cadence_id')
        .eq('id', contactCadenceId)
        .single()

    if (ccError || !cc) throw new Error('Contact cadence not found')

    const nextStepNumber = currentStepNumber + 1
    const { data: nextStep } = await supabase
        .from('cadence_steps')
        .select('*')
        .eq('cadence_id', cc.cadence_id)
        .eq('step_number', nextStepNumber)
        .single()

    if (nextStep) {
        const { data: currentStep } = await supabase
            .from('cadence_steps')
            .select('day_offset')
            .eq('cadence_id', cc.cadence_id)
            .eq('step_number', currentStepNumber)
            .single()

        const gap = (nextStep.day_offset - (currentStep?.day_offset || 0))
        const nextDate = addBusinessDays(new Date(), Math.max(1, gap))

        await supabase.from('daily_tasks').insert({
            contact_cadence_id: contactCadenceId,
            step_id: nextStep.id,
            due_date: nextDate.toISOString().split('T')[0],
            status: 'pending'
        })

        await supabase.from('contact_cadences').update({
            current_step: nextStepNumber,
            last_action_date: new Date().toISOString()
        }).eq('id', contactCadenceId)
    } else {
        await supabase.from('contact_cadences').update({
            status: 'completed',
            last_action_date: new Date().toISOString()
        }).eq('id', contactCadenceId)
    }

    revalidatePath('/tasks')
}

export async function postponeTask(taskId: string, newDate: Date, note?: string) {
    const { error } = await supabase
        .from('daily_tasks')
        .update({ due_date: newDate.toISOString().split('T')[0], notes: note })
        .eq('id', taskId)

    if (error) {
        console.error('Error postponing task:', error)
        throw new Error('Failed to postpone task')
    }

    revalidatePath('/tasks')
}
