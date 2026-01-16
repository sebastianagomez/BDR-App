import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckSquare, Phone, Mail, Linkedin, ArrowRight, Building2, Users } from 'lucide-react'

export default function Home() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
            <span className="text-4xl font-bold text-slate-900">16</span>
            <span className="text-slate-400 ml-2">tasks</span>
          </div>
          <div className="mt-4 flex space-x-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1 text-slate-400" /> 5
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1 text-slate-400" /> 8
            </div>
            <div className="flex items-center">
              <Linkedin className="w-4 h-4 mr-1 text-slate-400" /> 3
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Active Accounts</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">32</span>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            <span className="text-emerald-600 font-medium">15 Tier 1</span>
            <span className="mx-2">•</span>
            <span>17 Tier 2</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-slate-500 font-medium mb-1">Contacts in Cadence</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-slate-900">87</span>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Active in 3 cadences
          </div>
        </Card>
      </div>

      {/* Quick Access / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card noPadding className="h-full">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/tasks" className="text-sm text-[#00A1E0] hover:underline flex items-center">
              View full history <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-900">Completed Call with John Doe</p>
                  <p className="text-xs text-slate-500">Marketing Cloud • Acme Corp</p>
                </div>
                <span className="ml-auto text-xs text-slate-400">2h ago</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-full">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Quick Links</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/accounts/new" className="p-4 border border-slate-200 rounded-lg hover:border-[#00A1E0] hover:bg-slate-50 transition-colors group text-center">
              <Building2 className="w-8 h-8 mx-auto text-slate-400 group-hover:text-[#00A1E0] mb-2" />
              <span className="font-medium text-slate-700">Add Account</span>
            </Link>
            <Link href="/contacts/new" className="p-4 border border-slate-200 rounded-lg hover:border-[#00A1E0] hover:bg-slate-50 transition-colors group text-center">
              <Users className="w-8 h-8 mx-auto text-slate-400 group-hover:text-[#00A1E0] mb-2" />
              <span className="font-medium text-slate-700">Add Contact</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
