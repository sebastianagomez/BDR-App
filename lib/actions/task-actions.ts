'use server'

import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addBusinessDays } from '@/lib/utils/business-days'
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

export async function completeTask(taskId: string) {
    // 1. Get task info with all relations
    const { data: task } = await supabaseServer
        .from('daily_tasks')
        .select(`
      *,
      contact_cadences!inner(
        *,
        contacts(*)
      ),
      cadence_steps!inner(*)
    `)
        .eq('id', taskId)
        .single();

    if (!task) throw new Error('Task not found');

    // 2. Mark as completed
    await supabaseServer
        .from('daily_tasks')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

    // 3. Update contact_cadence current_step
    // Note: task.cadence_steps is a single object because (one-to-many from steps to tasks? No, steps to tasks is one-to-many. Task to step is many-to-one).
    // The select query above joins cadence_steps!inner.
    const nextStepNumber = task.cadence_steps.step_number + 1;

    await supabaseServer
        .from('contact_cadences')
        .update({
            current_step: nextStepNumber,
            last_action_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', task.contact_cadence_id);

    // 4. Get next step
    const { data: nextStep } = await supabaseServer
        .from('cadence_steps')
        .select('*')
        .eq('cadence_id', task.contact_cadences.cadence_id)
        .eq('step_number', nextStepNumber)
        .single();

    // 5. If there's a next step, create task
    if (nextStep) {
        const daysSinceStart = nextStep.day_offset;
        // Calculate due date based on cadence start date OR dynamic relative to previous step?
        // User code says: const startDate = new Date(task.contact_cadences.start_date);
        // const dueDate = addBusinessDays(startDate, daysSinceStart); 
        // This implies absolute scheduling from start.
        const startDate = new Date(task.contact_cadences.start_date);
        const dueDate = addBusinessDays(startDate, daysSinceStart);

        await supabaseServer
            .from('daily_tasks')
            .insert({
                contact_cadence_id: task.contact_cadence_id,
                step_id: nextStep.id,
                due_date: dueDate.toISOString().split('T')[0],
                status: 'pending'
            });
    } else {
        // Cadence finished
        await supabaseServer
            .from('contact_cadences')
            .update({ status: 'completed' })
            .eq('id', task.contact_cadence_id);
    }

    revalidatePath('/tasks');
    revalidatePath('/');
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
