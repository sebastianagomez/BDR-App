import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { supabaseServer } from '@/lib/supabase/server'
import { Phone, Mail, Linkedin, Activity, Plus, UserPlus, Building, FileText, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PersonalTodoWidget } from '@/components/dashboard/PersonalTodoWidget'
import { AEStatsWidget } from '@/components/dashboard/AEStatsWidget'
import { PersonalTask } from '@/lib/actions/personal-task-actions'

function formatRelativeTime(dateString: string) {
  if (!dateString) return ''
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}


export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch Tasks (Daily Actions)
  const { data: allPendingTasks, error: tasksError } = await supabaseServer
    .from('daily_tasks')
    .select('*, cadence_steps(*)')
    .lte('due_date', today)
    .eq('status', 'pending');

  if (tasksError) console.error('Error fetching pending tasks:', tasksError)

  const safePendingTasks = allPendingTasks || []
  const overdueCount = safePendingTasks.filter((t: any) => t.due_date < today).length

  const callCount = safePendingTasks.filter((t: any) => t.cadence_steps?.action_type === 'call').length;
  const emailCount = safePendingTasks.filter((t: any) => t.cadence_steps?.action_type === 'email').length;
  const linkedinCount = safePendingTasks.filter((t: any) => t.cadence_steps?.action_type?.includes('linkedin')).length;

  // 2. Fetch Accounts Stats
  const { count: tier1Count } = await supabaseServer
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'Tier 1')
    .eq('is_active', true);

  const { count: tier2Count } = await supabaseServer
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'Tier 2')
    .eq('is_active', true);

  // 3. Fetch Cadence Stats
  const { count: contactsInCadence } = await supabaseServer
    .from('contact_cadences')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: activeCadences } = await supabaseServer
    .from('cadences')
    .select(`*, contact_cadences!inner(id)`)
    .eq('is_active', true);

  const cadencesWithCounts = (activeCadences || []).map((c: any) => ({
    ...c,
    active_contacts: c.contact_cadences.length
  }));

  // 4. Fetch Recent Activity
  const { data: recentActivity } = await supabaseServer
    .from('daily_tasks')
    .select(`
      *,
      contact_cadences!inner(
        contacts!inner(name, title),
        cadences!inner(name)
      ),
      cadence_steps!inner(action_type, title)
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  // 5. Fetch Personal Tasks
  const { data: personalTasks } = await supabaseServer
    .from('personal_tasks')
    .select('*')
    .eq('due_date', today)
    .order('status', { ascending: false }) // pending first (z-a sort of status?) actually 'pending' > 'done' alphabetically? no. 'pending' > 'done' is true. 
    // We want pending first. 
    .order('created_at', { ascending: true });

  const typedPersonalTasks = (personalTasks || []) as PersonalTask[]

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Sebastian 👋</h1>
          <p className="text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link href="/tasks" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Quick Add Task
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Actions Today */}
        <div className="stat-card primary relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Actions for Today</h3>
              <div className="text-5xl font-bold text-slate-900 mt-2">{safePendingTasks.length}</div>
            </div>
            {overdueCount > 0 && (
              <span className="badge badge-error animate-pulse">
                {overdueCount} overdue
              </span>
            )}
          </div>

          <div className="flex gap-4 text-sm text-slate-600 mt-4">
            <span className="flex items-center hover:text-salesforce-blue transition-colors">
              <Phone className="w-4 h-4 mr-1.5" /> {callCount} calls
            </span>
            <span className="flex items-center hover:text-salesforce-blue transition-colors">
              <Mail className="w-4 h-4 mr-1.5" /> {emailCount} emails
            </span>
            <span className="flex items-center hover:text-salesforce-blue transition-colors">
              <Linkedin className="w-4 h-4 mr-1.5" /> {linkedinCount} LinkedIn
            </span>
          </div>

          <Link href="/tasks" className="absolute bottom-4 right-4 text-slate-300 group-hover:text-salesforce-blue transition-colors">
            <ChevronRight className="w-6 h-6" />
          </Link>
        </div>

        {/* Active Accounts */}
        <div className="stat-card hover:border-salesforce-blue transition-colors">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Accounts</h3>
          <div className="text-4xl font-bold text-slate-900 mt-2">{(tier1Count || 0) + (tier2Count || 0)}</div>
          <div className="flex gap-2 mt-4">
            <span className="badge badge-success">{tier1Count || 0} Tier 1</span>
            <span className="badge badge-gray">{tier2Count || 0} Tier 2</span>
          </div>
        </div>

        {/* Contacts in Cadence */}
        <div className="stat-card hover:border-salesforce-blue transition-colors">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Contacts in Cadence</h3>
          <div className="text-4xl font-bold text-slate-900 mt-2">{contactsInCadence || 0}</div>
          <p className="text-sm text-slate-400 mt-4">Active across all cadences</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Cadences */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Active Cadences</h2>
              <Link href="/cadences" className="btn-link text-sm">View all →</Link>
            </div>

            <div className="space-y-3">
              {cadencesWithCounts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">No active cadences found.</div>
              ) : (
                cadencesWithCounts.map((cad: any) => (
                  <div key={cad.id} className="group p-4 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-salesforce-blue hover:shadow-sm transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-salesforce-blue p-2 rounded-lg group-hover:bg-salesforce-blue group-hover:text-white transition-colors">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{cad.name}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <span className={cad.active_contacts > 0 ? "text-emerald-600 font-medium" : ""}>
                              {cad.active_contacts} contacts active
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link href="/cadences" className="btn-ghost text-sm">View details</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h2>

            {(!recentActivity || recentActivity.length === 0) ? (
              <div className="empty-state-detailed py-12">
                <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent activity.</p>
                <p className="text-sm text-slate-400">Complete tasks to see your activity here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((task: any) => (
                  <div key={task.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-transparent hover:border-slate-100">
                    <div className="mt-1">
                      {task.cadence_steps.action_type === 'call' && <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Phone className="w-4 h-4" /></div>}
                      {task.cadence_steps.action_type === 'email' && <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Mail className="w-4 h-4" /></div>}
                      {task.cadence_steps.action_type.includes('linkedin') && <div className="p-2 bg-sky-100 text-sky-700 rounded-full"><Linkedin className="w-4 h-4" /></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium text-slate-700 capitalize">{task.cadence_steps.action_type.replace('_', ' ')}</span> with{' '}
                        <span className="font-semibold">{task.contact_cadences.contacts.name}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.contact_cadences.contacts.title} • {task.contact_cadences.cadences.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatRelativeTime(task.completed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Personal To-Do Widget */}
          <PersonalTodoWidget tasks={typedPersonalTasks} />

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/contacts?new=true" className="quick-action-btn group">
                <UserPlus className="h-4 w-4 text-slate-400 group-hover:text-salesforce-blue transition-colors" />
                <span>Add Contact</span>
              </Link>
              <Link href="/accounts?new=true" className="quick-action-btn group">
                <Building className="h-4 w-4 text-slate-400 group-hover:text-salesforce-blue transition-colors" />
                <span>Add Account</span>
              </Link>
              <Link href="/templates?new=true" className="quick-action-btn group">
                <FileText className="h-4 w-4 text-slate-400 group-hover:text-salesforce-blue transition-colors" />
                <span>New Template</span>
              </Link>
            </div>
          </div>

          {/* AE Stats Widget */}
          <AEStatsWidget />

        </div>
      </div>
    </div>
  );
}
