'use server'

import { supabaseServer } from '@/lib/supabase/server' // ← CAMBIO AQUÍ
import { revalidatePath } from 'next/cache'

export type PersonalTask = {
    id: string
    title: string
    description: string | null
    due_date: string | null
    priority: 'low' | 'medium' | 'high'
    status: 'pending' | 'done' // ← Cambié 'completed' a 'done' (según tu DB)
    created_at: string
}

export async function getPersonalTasks() {
    const { data, error } = await supabaseServer // ← CAMBIO AQUÍ
        .from('personal_tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching personal tasks:', error)
        return []
    }

    return data as PersonalTask[]
}

export async function createPersonalTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const due_date = formData.get('due_date') as string
    const priority = (formData.get('priority') as string) || 'medium'

    if (!title) throw new Error('Title is required')

    const { error } = await supabaseServer // ← CAMBIO AQUÍ
        .from('personal_tasks')
        .insert({
            title,
            description: description || null,
            due_date: due_date || new Date().toISOString().split('T')[0], // Default: today
            priority,
            status: 'pending'
        })

    if (error) {
        console.error('Error creating personal task:', JSON.stringify(error, null, 2))
        throw new Error('Failed to create task')
    }

    revalidatePath('/todo')
    revalidatePath('/') // Dashboard widget
}

export async function togglePersonalTask(id: string, currentStatus: 'pending' | 'done') {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending'
    const completed_at = newStatus === 'done' ? new Date().toISOString() : null

    const { error } = await supabaseServer // ← CAMBIO AQUÍ
        .from('personal_tasks')
        .update({ 
            status: newStatus,
            completed_at 
        })
        .eq('id', id)

    if (error) {
        console.error('Error toggling task:', JSON.stringify(error, null, 2))
        throw new Error('Failed to toggle task')
    }

    revalidatePath('/todo')
    revalidatePath('/')
}

export async function deletePersonalTask(id: string) {
    const { error } = await supabaseServer // ← CAMBIO AQUÍ
        .from('personal_tasks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting personal task:', JSON.stringify(error, null, 2))
        throw new Error('Failed to delete task')
    }

    revalidatePath('/todo')
    revalidatePath('/')
}

export async function autoMoveOverdueTasks() {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabaseServer // ← CAMBIO AQUÍ
        .from('personal_tasks')
        .update({ due_date: today })
        .eq('status', 'pending')
        .lt('due_date', today)

    if (error) {
        console.error('Error moving overdue tasks:', JSON.stringify(error, null, 2))
    }
}