'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (prof) setProfile(prof)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-cyan-400"></span>
          <span className="text-xs font-mono text-base-content/60">
            Initializing TLS Dashboard...
          </span>
        </div>
      </div>
    )
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: 'lucide:layout-dashboard' },
    { label: 'Deploy Server', href: '/dashboard/deploy', icon: 'lucide:plus-circle' },
    { label: 'Billing & Invoices', href: '/dashboard/billing', icon: 'lucide:receipt' },
    { label: 'Support Tickets', href: '/dashboard/support', icon: 'lucide:life-buoy' },
  ]

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col lg:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-base-300 border-r border-base-content/10 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-4 border-b border-base-content/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Icon icon="lucide:server" className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider text-base-content">
                TLS <span className="text-cyan-400">PANEL</span>
              </span>
            </div>
          </Link>

          <Link href="/" className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content">
            <Icon icon="lucide:globe" className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-base-content/10 bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ring-2 ring-cyan-500/30 overflow-hidden shrink-0">
              <img
                src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate text-base-content">
                {profile?.full_name || profile?.username || 'User'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono font-medium">
                Balance: {formatRupiah(profile?.balance || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 flex-1 overflow-y-auto">
          <ul className="menu menu-sm gap-1 w-full p-0">
            <li className="menu-title text-[10px] uppercase font-bold text-base-content/40 px-2 py-1">
              Management
            </li>
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                        : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
                    }`}
                  >
                    <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Node Status & Sign out */}
        <div className="p-4 border-t border-base-content/10 bg-base-200/30 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Nodes Online
            </span>
            <span className="text-[10px] text-base-content/40">v4.18</span>
          </div>

          <button
            onClick={handleSignOut}
            className="btn btn-ghost btn-sm w-full text-error hover:bg-error/10 text-xs font-medium justify-start"
          >
            <Icon icon="lucide:log-out" className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-base-100">
        <header className="h-14 border-b border-base-content/10 px-4 sm:px-6 flex items-center justify-between bg-base-200/40">
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <Link href="/dashboard" className="hover:text-base-content">
              Panel
            </Link>
            <span>/</span>
            <span className="text-base-content font-medium capitalize">
              {pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/deploy"
              className="btn btn-primary btn-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none"
            >
              <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
              Rent Server
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
