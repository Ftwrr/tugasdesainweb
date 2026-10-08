'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (prof) setProfile(prof)
        }
      } catch (e) {
        console.error('Error fetching user:', e)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-base-300/80 border-b border-base-content/10">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Dropdown & Logo */}
        <div className="navbar-start">
          <div className="dropdown lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm mr-2" aria-label="Open menu">
              <Icon icon="lucide:menu" className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow-xl border border-base-content/10"
            >
              <li>
                <Link href="/" className={pathname === '/' ? 'active font-semibold' : ''}>
                  <Icon icon="lucide:home" className="w-4 h-4" /> Home
                </Link>
              </li>
              <li>
                <Link href="/#servers">
                  <Icon icon="lucide:server" className="w-4 h-4" /> Game Servers
                </Link>
              </li>
              <li>
                <Link href="/#features">
                  <Icon icon="lucide:shield-check" className="w-4 h-4" /> Enterprise Shield
                </Link>
              </li>
              <li>
                <Link href="/#nodes">
                  <Icon icon="lucide:globe" className="w-4 h-4" /> Nodes & Latency
                </Link>
              </li>
              {user && (
                <>
                  <div className="divider my-1"></div>
                  <li>
                    <Link href="/dashboard" className="text-primary font-medium">
                      <Icon icon="lucide:layout-dashboard" className="w-4 h-4" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/deploy">
                      <Icon icon="lucide:plus-circle" className="w-4 h-4" /> Deploy Server
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/billing">
                      <Icon icon="lucide:credit-card" className="w-4 h-4" /> Billing & Invoices
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <Icon icon="lucide:server" className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-base-content flex items-center gap-1.5">
                TLS <span className="text-cyan-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">HOST</span>
              </span>
              <span className="text-[10px] text-base-content/60 font-mono tracking-tighter -mt-0.5">
                TOP LEVEL SERVER
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 text-sm font-medium">
            <li>
              <Link href="/" className={`rounded-lg px-3 py-2 transition-colors ${pathname === '/' ? 'text-cyan-400 font-semibold bg-cyan-500/10' : 'text-base-content/80 hover:text-base-content hover:bg-base-200'}`}>
                <Icon icon="lucide:home" className="w-4 h-4 inline mr-1 text-cyan-400" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/#servers" className="rounded-lg px-3 py-2 text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors">
                <Icon icon="lucide:gamepad-2" className="w-4 h-4 inline mr-1 text-emerald-400" />
                Game Servers
              </Link>
            </li>
            <li>
              <Link href="/#features" className="rounded-lg px-3 py-2 text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors">
                <Icon icon="lucide:shield" className="w-4 h-4 inline mr-1 text-purple-400" />
                Features
              </Link>
            </li>
            <li>
              <Link href="/#nodes" className="rounded-lg px-3 py-2 text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors">
                <Icon icon="lucide:activity" className="w-4 h-4 inline mr-1 text-amber-400" />
                Nodes & Ping
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/dashboard" className={`rounded-lg px-3 py-2 transition-colors ${pathname.startsWith('/dashboard') ? 'text-cyan-400 font-semibold bg-cyan-500/10' : 'text-base-content/80 hover:text-base-content hover:bg-base-200'}`}>
                  <Icon icon="lucide:layout-dashboard" className="w-4 h-4 inline mr-1 text-cyan-400" />
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Right Section: Status badge & Auth Buttons */}
        <div className="navbar-end gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>99.99% SLA Online</span>
          </div>

          {loading ? (
            <div className="loading loading-spinner loading-sm text-cyan-400"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {profile && (
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-semibold text-base-content">
                    {profile.full_name || profile.username || 'User'}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-medium">
                    {formatRupiah(profile.balance || 0)}
                  </span>
                </div>
              )}

              {/* User Dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-cyan-500/30">
                  <div className="w-9 rounded-full ring-2 ring-cyan-500/40 ring-offset-2 ring-offset-base-300">
                    <img
                      src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                      alt="User avatar"
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-56 p-2 shadow-2xl border border-base-content/10"
                >
                  <li className="menu-title px-3 py-1 text-xs opacity-60">Signed in as</li>
                  <li className="px-3 pb-2">
                    <span className="font-semibold text-xs text-cyan-400 truncate block">
                      {user.email}
                    </span>
                  </li>
                  <div className="divider my-0"></div>
                  <li>
                    <Link href="/dashboard">
                      <Icon icon="lucide:layout-dashboard" className="w-4 h-4 text-cyan-400" />
                      Server Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/deploy">
                      <Icon icon="lucide:plus" className="w-4 h-4 text-emerald-400" />
                      Rent New Server
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/billing">
                      <Icon icon="lucide:wallet" className="w-4 h-4 text-amber-400" />
                      Invoices & Balance
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/support">
                      <Icon icon="lucide:life-buoy" className="w-4 h-4 text-purple-400" />
                      Support Tickets
                    </Link>
                  </li>
                  <div className="divider my-0"></div>
                  <li>
                    <button onClick={handleLogout} className="text-error hover:bg-error/10">
                      <Icon icon="lucide:log-out" className="w-4 h-4" />
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="btn btn-ghost btn-sm font-medium hover:bg-base-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-primary btn-sm bg-gradient-to-r from-cyan-500 to-blue-600 border-none text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
              >
                <Icon icon="lucide:zap" className="w-3.5 h-3.5 mr-0.5" />
                Deploy Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
