import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { supabaseServer } from '@/lib/supabase/server'
import { Phone, Mail, Linkedin, ListTodo, Activity, CheckSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SmartInsights } from '@/components/dashboard/SmartInsights'

function formatRelativeTime(dateString: string) {
  if (!dateString) return ''
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];

  // Real queries: Fetch ALL pending tasks due <= today (includes overdue)
  const { data: allPendingTasks, error: tasksError } = await supabaseServer
    .from('daily_tasks')
    .select('*, cadence_steps(*)')
    .lte('due_date', today) // Changed from eq to lte to include overdue
    .eq('status', 'pending');

  if (tasksError) console.error('Error fetching pending tasks:', tasksError)

  const safePendingTasks = allPendingTasks || []

  // Calculate specific counts
  const overdueCount = safePendingTasks.filter((t: any) => t.due_date < today).length

  const callCount = safePendingTasks.filter((t: any) =>
    t.cadence_steps?.action_type === 'call'
  ).length;

  const emailCount = safePendingTasks.filter((t: any) =>
    t.cadence_steps?.action_type === 'email'
  ).length;

  const linkedinCount = safePendingTasks.filter((t: any) =>
    t.cadence_steps?.action_type?.includes('linkedin')
  ).length;

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

  const { count: contactsInCadence } = await supabaseServer
    .from('contact_cadences')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Active Cadences
  const { data: activeCadences } = await supabaseServer
    .from('cadences')
    .select(`
      *,
      contact_cadences!inner(id)
    `)
    .eq('is_active', true);

  const cadencesWithCounts = (activeCadences || []).map((c: any) => ({
    ...c,
    active_contacts: c.contact_cadences.length
  }));

  // Recent Activity (last 5 completed tasks)
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

  // Personal tasks for today
  const { data: personalTasks } = await supabaseServer
    .from('personal_tasks')
    .select('*')
    .eq('due_date', today)
    .eq('status', 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <SmartInsights overdueCount={overdueCount} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#00A1E0]">
          <h3 className="text-slate-500 font-medium mb-1">Actions for Today</h3>
          <p className="text-4xl font-bold text-slate-900">{safePendingTasks.length}</p>
          <div className="flex gap-4 text-sm text-slate-600 mt-2">
            <span className="flex items-center"><Phone className="w-4 h-4 mr-1 text-slate-400" /> {callCount}</span>
            <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-slate-400" /> {emailCount}</span>
            <span className="flex items-center"><Linkedin className="w-4 h-4 mr-1 text-slate-400" /> {linkedinCount}</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Active Accounts</h3>
          <p className="text-4xl font-bold text-slate-900">{(tier1Count || 0) + (tier2Count || 0)}</p>
          <p className="text-sm text-slate-600 mt-2">
            <span className="text-emerald-600 font-medium">{tier1Count || 0} Tier 1</span> • {tier2Count || 0} Tier 2
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Contacts in Cadence</h3>
          <p className="text-4xl font-bold text-slate-900">{contactsInCadence || 0}</p>
          <p className="text-sm text-slate-600 mt-2">Active in cadences</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cadences */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Active Cadences
          </h3>
          <div className="space-y-2">
            {cadencesWithCounts.length === 0 ? (
              <p className="text-slate-500 text-sm">No active cadences.</p>
            ) : (
              cadencesWithCounts.map((cad: any) => (
                <div key={cad.id} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700">{cad.name}</span>
                  <span className="text-slate-500 text-sm">
                    {cad.active_contacts} contacts
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-emerald-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(!recentActivity || recentActivity.length === 0) ? (
              <p className="text-slate-500 text-sm">No recent activity.</p>
            ) : (
              recentActivity.map((task: any) => (
                <div key={task.id} className="py-2 border-b border-slate-50 last:border-0">
                  <p className="font-medium text-slate-800 text-sm">
                    Completed {task.cadence_steps.action_type.replace('_', ' ')} with{' '}
                    {task.contact_cadences.contacts.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {task.contact_cadences.contacts.title} •{' '}
                    {task.contact_cadences.cadences.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatRelativeTime(task.completed_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Personal Tasks Widget */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <ListTodo className="w-5 h-5 mr-2 text-purple-500" />
            Personal Tasks Today
          </h3>
          <div className="flex flex-col h-[calc(100%-2rem)]">
            <div className="flex-1">
              <p className="text-3xl font-bold text-slate-900">{(personalTasks || []).length}</p>
              <p className="text-slate-500 text-sm">pending tasks</p>
            </div>
            <Link href="/todo" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
              View all →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
