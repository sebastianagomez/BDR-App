'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Building2, Users, Repeat, FileText, Linkedin, ListTodo } from 'lucide-react'
import clsx from 'clsx'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Daily Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Accounts', href: '/accounts', icon: Building2 },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Cadences', href: '/cadences', icon: Repeat },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'To-Do List', href: '/todo', icon: ListTodo },
    { name: 'LinkedIn', href: '/linkedin', icon: Linkedin },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex w-64 flex-col bg-[#032D60] text-white">
            <div className="flex h-16 items-center px-6 font-bold text-xl tracking-wider">
                BDR<span className="text-[#00A1E0]">FLOW</span>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-[#0176D3] text-white'
                                    : 'text-slate-300 hover:bg-[#0176D3]/50 hover:text-white',
                                'group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-[#0176D3]">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#00A1E0] flex items-center justify-center text-xs font-bold">
                        SG
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">Sebastian Gomez</p>
                        <p className="text-xs text-slate-400">BDR Enterprise</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
