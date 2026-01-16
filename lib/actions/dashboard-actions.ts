'use server'

import { supabase } from '@/lib/supabase/client'
import { autoMoveOverdueTasks } from './personal-task-actions'

export type DashboardStats = {
    pendingTasks: number
    pendingCalls: number
    pendingEmails: number
    pendingLinkedin: number
    activeAccounts: number
    tier1Accounts: number
    tier2Accounts: number
    contactsInCadence: number

    activeCadencesCount: number
    personalTasks: { id: string, title: string, due_date: string | null, priority: string }[]
}

export type RecentActivity = {
    id: string
    contactName: string
    accountName: string
    actionType: string
    completedAt: string
}

export type ActiveCadenceSummary = {
    id: string
    name: string
    activeContacts: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0]

    // Auto-maintenance: Move overdue personal tasks
    await autoMoveOverdueTasks()

    // 1. Pending Tasks Today
    const { data: tasks } = await supabase
        .from('daily_tasks')
        .select(`
            id, 
            status, 
            due_date, 
            cadence_steps ( action_type )
        `)
        .eq('status', 'pending')
        .lte('due_date', today)

    const pendingTasks = tasks?.length || 0
    // @ts-ignore
    const pendingCalls = tasks?.filter(t => t.cadence_steps?.action_type?.includes('call')).length || 0
    // @ts-ignore
    const pendingEmails = tasks?.filter(t => t.cadence_steps?.action_type?.includes('email')).length || 0
    // @ts-ignore
    const pendingLinkedin = tasks?.filter(t => t.cadence_steps?.action_type?.includes('linkedin')).length || 0

    // 2. Active Accounts
    const { data: accounts } = await supabase
        .from('accounts')
        .select('tier')
        .eq('is_active', true)

    const activeAccounts = accounts?.length || 0
    const tier1Accounts = accounts?.filter(a => a.tier === 'Tier 1').length || 0
    const tier2Accounts = accounts?.filter(a => a.tier === 'Tier 2').length || 0

    // 3. Contacts in Cadence
    const { count: contactsInCadence } = await supabase
        .from('contact_cadences')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    // 4. Cadences

    const { count: activeCadencesCount } = await supabase
        .from('cadences')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

    // 5. Personal Tasks (Pending, Top 5)
    const { data: personalTasks } = await supabase
        .from('personal_tasks')
        .select('id, title, due_date, priority')
        .eq('status', 'pending')
        .order('priority', { ascending: false }) // High first
        .order('due_date', { ascending: true }) // Soonest first
        .limit(5)


    return {
        pendingTasks,
        pendingCalls,
        pendingEmails,
        pendingLinkedin,
        activeAccounts,
        tier1Accounts,
        tier2Accounts,
        contactsInCadence: contactsInCadence || 0,
        activeCadencesCount: activeCadencesCount || 0,
        personalTasks: personalTasks as any[] || []
    }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
    const { data } = await supabase
        .from('daily_tasks')
        .select(`
            id,
            completed_at,
            cadence_steps ( action_type ),
            contact_cadences (
                contacts (
                    name,
                    accounts ( name )
                )
            )
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5)

    if (!data) return []

    return data.map((item: any) => ({
        id: item.id,
        contactName: item.contact_cadences?.contacts?.name || 'Unknown',
        accountName: item.contact_cadences?.contacts?.accounts?.name || 'Unknown',
        actionType: item.cadence_steps?.action_type || 'task',
        completedAt: item.completed_at
    }))
}

export async function getActiveCadences(): Promise<ActiveCadenceSummary[]> {
    // Get active cadences with count of active contacts
    // This is a bit complex in Supabase simple client without aggregation functions easily accessible in JS client (no group by in simple select)
    // We can fetch all active contact_cadences and aggregate manually for MVP

    const { data: cadences } = await supabase
        .from('cadences')
        .select('id, name')
        .eq('is_active', true)

    if (!cadences) return []

    const { data: contactCadences } = await supabase
        .from('contact_cadences')
        .select('cadence_id')
        .eq('status', 'active')

    const counts: Record<string, number> = {}
    contactCadences?.forEach((cc: any) => {
        counts[cc.cadence_id] = (counts[cc.cadence_id] || 0) + 1
    })

    return cadences.map(c => ({
        id: c.id,
        name: c.name,
        activeContacts: counts[c.id] || 0
    })).filter(c => c.activeContacts > 0).sort((a, b) => b.activeContacts - a.activeContacts)
}
