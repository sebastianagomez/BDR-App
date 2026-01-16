import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckSquare, Phone, Mail, Linkedin, ArrowRight, Activity, Calendar, ListTodo } from 'lucide-react'
import { getDashboardStats, getRecentActivity, getActiveCadences } from '@/lib/actions/dashboard-actions'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default async function Home() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const [stats, recentActivity, activeCadences] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getActiveCadences()
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">{currentDate}</p>
        </div>
        <Link href="/tasks" className="btn-primary flex items-center">
          <CheckSquare className="w-5 h-5 mr-2" />
          Start Daily Tasks
        </Link>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#00A1E0]">
          <h3 className="text-slate-500 font-medium mb-1">Pending Actions Today</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">{stats.pendingTasks}</span>
            <span className="text-slate-400 ml-2">tasks</span>
          </div>
          <div className="mt-4 flex space-x-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1 text-slate-400" /> {stats.pendingCalls}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1 text-slate-400" /> {stats.pendingEmails}
            </div>
            <div className="flex items-center">
              <Linkedin className="w-4 h-4 mr-1 text-slate-400" /> {stats.pendingLinkedin}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Active Accounts</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">{stats.activeAccounts}</span>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            <span className="text-emerald-600 font-medium">{stats.tier1Accounts} Tier 1</span>
            <span className="mx-2">•</span>
            <span>{stats.tier2Accounts} Tier 2</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Contacts in Cadence</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">{stats.contactsInCadence}</span>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Active in {stats.activeCadencesCount} cadences
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card noPadding className="h-full lg:col-span-1">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/tasks" className="text-sm text-[#00A1E0] hover:underline flex items-center">
              View full <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No recent activity found.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full hidden sm:block">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="ml-0 sm:ml-3">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">
                      {activity.contactName}
                    </p>
                    <p className="text-xs text-slate-500">{activity.actionType.replace('_', ' ')}</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">
                    {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true }).replace('about ', '')}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Active Cadences Summary */}
        <Card className="h-full lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Active Cadences</CardTitle>
            <Link href="/cadences" className="text-sm text-[#00A1E0] hover:underline">Manage</Link>
          </div>
          <div className="space-y-4">
            {activeCadences.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                No active cadences found.
              </div>
            ) : (
              activeCadences.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center min-w-0">
                    <Activity className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 ml-2">
                    <Users className="w-4 h-4 mr-1" />
                    {c.activeContacts}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Personal To-Do Widget */}
        <Card className="h-full lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center">
              <ListTodo className="w-5 h-5 mr-2 text-purple-500" />
              My To-Do
            </CardTitle>
            <Link href="/todo" className="text-sm text-[#00A1E0] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {stats.personalTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                Reference your goals!
                <div className="mt-2 text-xs">No pending tasks.</div>
              </div>
            ) : (
              stats.personalTasks.map((task) => (
                <div key={task.id} className="flex items-start p-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded">
                  <div className={clsx("w-2 h-2 mt-2 rounded-full mr-3 flex-shrink-0",
                    task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        {task.due_date}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <Link href="/todo" className="text-xs text-slate-400 hover:text-slate-600 block text-center border-t border-slate-100 pt-2 dashed">
                + Add New Task
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Helper icon component for Active Cadences
function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
