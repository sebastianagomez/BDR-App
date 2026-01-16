'use server'

import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export type Account = {
    id: string
    name: string
    tier: 'Tier 1' | 'Tier 2'
    portfolio: string[]
    industry: string | null
    notes: string | null
    is_active: boolean
    created_at: string
}

export async function getAccounts() {
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching accounts:', error)
        return []
    }

    return data as Account[]
}

export async function createAccount(formData: FormData) {
    const name = formData.get('name') as string
    const tier = formData.get('tier') as string
    const industry = formData.get('industry') as string
    const notes = formData.get('notes') as string

    // Handle multi-select for portfolio (simulated for now, expect JSON or comma separated in real form)
    // For MVP, we'll check individual checkboxes if we were using standard form, 
    // but let's assume we pass a JSON string for simplicity or handle it in the component.
    // Here we'll just extract all keys starting with 'portfolio_' if we were doing it that way, 
    // but let's assume the client passes a hidden input or we parse it differently.
    // SIMPLIFICATION: The client will send "portfolio" as a comma-separated string if standard submit,
    // or we use a more complex method. Let's rely on the client sending a JSON string or multiple values.

    const portfolioRaw = formData.getAll('portfolio')
    // If coming from a standard multi-select/checkboxes, getAll returns an array of values.
    const portfolio = portfolioRaw.map(p => p.toString())

    const { error } = await supabase
        .from('accounts')
        .insert({
            name,
            tier,
            industry,
            notes,
            portfolio,
            is_active: true
        })

    if (error) {
        console.error('Error creating account:', error)
        throw new Error('Failed to create account')
    }

    revalidatePath('/accounts')
}

export async function updateAccount(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const tier = formData.get('tier') as string
    const industry = formData.get('industry') as string
    const notes = formData.get('notes') as string
    const portfolioRaw = formData.getAll('portfolio')
    const portfolio = portfolioRaw.map(p => p.toString())

    const { error } = await supabase
        .from('accounts')
        .update({
            name,
            tier,
            industry,
            notes,
            portfolio
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating account:', error)
        throw new Error('Failed to update account')
    }

    revalidatePath('/accounts')
}

export async function deleteAccount(id: string) {
    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting account:', error)
        throw new Error('Failed to delete account')
    }

    revalidatePath('/accounts')
}
