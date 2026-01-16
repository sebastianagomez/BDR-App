'use server'

import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export type Template = {
    id: string
    name: string
    category: 'first_contact' | 'follow_up' | 'meeting_request' | 'other'
    channel: 'email' | 'whatsapp' | 'linkedin'
    subject: string | null
    body: string
    variables: string[] | null
    created_at: string
}

export async function getTemplates() {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching templates:', error)
        return []
    }

    return data as Template[]
}

export async function createTemplate(formData: FormData) {
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const channel = formData.get('channel') as string
    const subject = formData.get('subject') as string
    const body = formData.get('body') as string

    // Parse variables from body? Or explicit field?
    // Let's simple regex parse variables like {{name}} from body to store them
    const variables = body.match(/{{([^{}]+)}}/g)?.map(v => v.replace(/{{|}}/g, '').trim()) || []

    const { error } = await supabase
        .from('templates')
        .insert({
            name,
            category,
            channel,
            subject: channel === 'email' ? subject : null,
            body,
            variables
        })

    if (error) {
        console.error('Error creating template:', error)
        throw new Error('Failed to create template')
    }

    revalidatePath('/templates')
}

export async function deleteTemplate(id: string) {
    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting template:', error)
        throw new Error('Failed to delete template')
    }

    revalidatePath('/templates')
}
