'use server'

import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Account = {
    id: string
    name: string
    tier: 'Tier 1' | 'Tier 2'
    portfolio: string[]
    industry: string | null
    notes: string | null
    assigned_ae: string | null
    contacts_count?: number
    is_active: boolean
    created_at: string
}



export async function getAccounts() {
    const { data: accounts, error } = await supabaseServer
        .from('accounts')
        .select(`
            *,
            contacts(count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching accounts:', error)
        return []
    }

    // Transform to include count property flat
    const transformed = (accounts || []).map((a: any) => ({
        ...a,
        contacts_count: a.contacts?.[0]?.count || 0
    }))

    return transformed as Account[]
}

export async function createAccount(formData: FormData) {
    const name = formData.get('name') as string
    const tier = formData.get('tier') as string
    const industry = formData.get('industry') as string
    const notes = formData.get('notes') as string
    const assigned_ae = formData.get('assigned_ae') as string

    // Handle multi-select for portfolio
    const portfolioRaw = formData.getAll('portfolio')
    const portfolio = portfolioRaw.map(p => p.toString())

    const { error } = await supabase
        .from('accounts')
        .insert({
            name,
            tier,
            industry,
            notes,
            portfolio,
            assigned_ae: assigned_ae || null,
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
    const assigned_ae = formData.get('assigned_ae') as string

    const portfolioRaw = formData.getAll('portfolio')
    const portfolio = portfolioRaw.map(p => p.toString())

    const { error } = await supabase
        .from('accounts')
        .update({
            name,
            tier,
            industry,
            notes,
            portfolio,
            assigned_ae: assigned_ae || null
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

// Stats by AE
export async function getAccountStatsByAE() {
    const { data: accounts } = await supabaseServer
        .from('accounts')
        .select(`
            id,
            assigned_ae,
            tier,
            contacts(id)
        `)
        .eq('is_active', true);

    const statsByAE = accounts?.reduce((acc: any, account: any) => {
        const ae = account.assigned_ae || 'Unassigned';
        if (!acc[ae]) {
            acc[ae] = {
                totalAccounts: 0,
                tier1: 0,
                tier2: 0,
                totalContacts: 0
            };
        }

        acc[ae].totalAccounts++;
        if (account.tier === 'Tier 1') acc[ae].tier1++;
        if (account.tier === 'Tier 2') acc[ae].tier2++;
        acc[ae].totalContacts += account.contacts?.length || 0;

        return acc;
    }, {} as Record<string, any>);

    return statsByAE || {};
}
