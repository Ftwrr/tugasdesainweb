'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/StatusBadge'
import PowerControls from '@/components/PowerControls'
import type { RentedServer, ServerActivity } from '@/types/database'

export default function DashboardOverviewPage() {
  const [servers, setServers] = useState<RentedServer[]>([])
  const [activities, setActivities] = useState<ServerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Fetch rented servers
        const { data: serversData } = await supabase
          .from('rented_servers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (serversData) setServers(serversData as RentedServer[])

        // Fetch recent activities
        const { data: activitiesData } = await supabase
          .from('server_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6)

        if (activitiesData) setActivities(activitiesData as ServerActivity[])
      } catch (e) {
        console.error('Error loading dashboard data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIp(text)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Summary Metrics
  const totalServers = servers.length
  const totalCores = servers.reduce((acc, s) => acc + (s.vcpu || 0), 0)
  const totalRam = servers.reduce((acc, s) => acc + (s.ram_gb || 0), 0)
  const totalMonthly = servers.reduce((acc, s) => acc + (s.monthly_cost || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-md text-cyan-400"></span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Real-time status of your deployed game servers and cloud resources.
          </p>
        </div>

        <Link
          href="/dashboard/deploy"
          className="btn btn-primary btn-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold border-none shadow-lg shadow-cyan-500/20"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1" />
          Deploy New Server
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-200/80 border border-base-content/10 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-base-content/60 mb-2">
            <span className="text-xs font-semibold">Active Servers</span>
            <Icon icon="lucide:server" className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-base-content font-mono">
            {totalServers}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {servers.filter(s => s.status === 'running').length} currently running
          </div>
        </div>

        <div className="card bg-base-200/80 border border-base-content/10 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-base-content/60 mb-2">
            <span className="text-xs font-semibold">Allocated CPU</span>
            <Icon icon="lucide:cpu" className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-base-content font-mono">
            {totalCores} <span className="text-sm font-normal text-base-content/60">Cores</span>
          </div>
          <div className="text-[11px] text-base-content/60 font-mono mt-1">
            Ryzen 9 7950X Dedicated
          </div>
        </div>

        <div className="card bg-base-200/80 border border-base-content/10 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-base-content/60 mb-2">
            <span className="text-xs font-semibold">Allocated RAM</span>
            <Icon icon="lucide:memory-stick" className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-base-content font-mono">
            {totalRam} <span className="text-sm font-normal text-base-content/60">GB</span>
          </div>
          <div className="text-[11px] text-base-content/60 font-mono mt-1">
            DDR5 High-Frequency
          </div>
        </div>

        <div className="card bg-base-200/80 border border-base-content/10 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-base-content/60 mb-2">
            <span className="text-xs font-semibold">Monthly Cost</span>
            <Icon icon="lucide:receipt" className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            {formatRupiah(totalMonthly)}
          </div>
          <div className="text-[11px] text-base-content/60 font-mono mt-1">
            Auto-renew enabled
          </div>
        </div>
      </div>

      {/* Rented Servers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Icon icon="lucide:hard-drive" className="text-cyan-400" />
            Your Rented Servers
          </h2>
          <span className="text-xs text-base-content/60 font-mono">
            {servers.length} Instances
          </span>
        </div>

        {servers.length === 0 ? (
          <div className="card bg-base-200/60 border border-base-content/10 p-12 text-center rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-base-300 border border-base-content/10 flex items-center justify-center mx-auto mb-4 text-base-content/40">
              <Icon icon="lucide:server-off" className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-base-content mb-1">
              No Active Servers Yet
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto mb-6">
              You haven&apos;t deployed any game servers. Rent your first instance in under 60 seconds with instant setup.
            </p>
            <Link
              href="/dashboard/deploy"
              className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none mx-auto"
            >
              <Icon icon="lucide:rocket" className="w-4 h-4 mr-1" />
              Rent a Game Server
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {servers.map(server => {
              const fullAddress = `${server.ip_address}:${server.port}`
              return (
                <div
                  key={server.id}
                  className="card bg-base-200/90 border border-base-content/10 p-5 rounded-2xl shadow-sm hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Server Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-base-300 border border-base-content/10 flex items-center justify-center text-cyan-400 shrink-0">
                          <Icon
                            icon={
                              server.game_type === 'minecraft'
                                ? 'simple-icons:minecraft'
                                : server.game_type === 'cs2'
                                ? 'lucide:crosshair'
                                : 'lucide:server'
                            }
                            className="w-5 h-5"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/servers/${server.id}`}
                              className="font-bold text-base text-base-content hover:text-cyan-400 transition-colors"
                            >
                              {server.name}
                            </Link>
                            <StatusBadge status={server.status} />
                          </div>
                          <div className="text-xs text-base-content/60 font-mono flex items-center gap-2 mt-0.5">
                            <span className="uppercase">{server.game_type}</span>
                            <span>•</span>
                            <span>{server.region}</span>
                          </div>
                        </div>
                      </div>

                      {/* Connection IP pill */}
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-base-300 border border-base-content/10 font-mono text-xs text-base-content/80">
                        <span>{fullAddress}</span>
                        <button
                          onClick={() => copyToClipboard(fullAddress)}
                          className="btn btn-ghost btn-xs p-0 text-cyan-400 hover:text-cyan-300"
                          title="Copy IP:Port"
                        >
                          <Icon
                            icon={copiedIp === fullAddress ? 'lucide:check' : 'lucide:copy'}
                            className="w-3.5 h-3.5"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Resource Usage Meters */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:w-80 font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-base-content/60 text-[11px] mb-1">
                          <span>CPU</span>
                          <span>{server.status === 'running' ? `${server.current_cpu_pct}%` : '0%'}</span>
                        </div>
                        <progress
                          className="progress progress-cyan w-full h-1.5"
                          value={server.status === 'running' ? server.current_cpu_pct : 0}
                          max="100"
                        ></progress>
                        <div className="text-[10px] text-base-content/50 mt-1">
                          {server.vcpu} vCPUs
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-base-content/60 text-[11px] mb-1">
                          <span>RAM</span>
                          <span>{server.status === 'running' ? `${server.current_ram_pct}%` : '0%'}</span>
                        </div>
                        <progress
                          className="progress progress-accent w-full h-1.5"
                          value={server.status === 'running' ? server.current_ram_pct : 0}
                          max="100"
                        ></progress>
                        <div className="text-[10px] text-base-content/50 mt-1">
                          {server.ram_gb} GB RAM
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <div className="flex justify-between text-base-content/60 text-[11px] mb-1">
                          <span>DISK</span>
                          <span>{server.current_disk_pct}%</span>
                        </div>
                        <progress
                          className="progress progress-warning w-full h-1.5"
                          value={server.current_disk_pct}
                          max="100"
                        ></progress>
                        <div className="text-[10px] text-base-content/50 mt-1">
                          {server.ssd_gb} GB NVMe
                        </div>
                      </div>
                    </div>

                    {/* Actions and Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-base-content/10">
                      <PowerControls
                        serverId={server.id}
                        currentStatus={server.status}
                        onStatusChange={newStatus => {
                          setServers(prev =>
                            prev.map(s => (s.id === server.id ? { ...s, status: newStatus } : s))
                          )
                        }}
                      />

                      <Link
                        href={`/dashboard/servers/${server.id}`}
                        className="btn btn-neutral btn-sm bg-base-300 hover:bg-cyan-500 hover:text-slate-950 font-bold border-none transition-colors"
                      >
                        <Icon icon="lucide:terminal" className="w-4 h-4 mr-1 text-cyan-400" />
                        Console &amp; Manage
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
          <Icon icon="lucide:activity" className="text-purple-400" />
          Recent Server Activities
        </h2>

        {activities.length === 0 ? (
          <div className="p-4 rounded-xl bg-base-200 text-xs text-base-content/60 font-mono">
            No logged activities yet. Power actions and deployments will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(act => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-base-200/70 border border-base-content/5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`badge badge-sm font-bold ${
                      act.action === 'START'
                        ? 'badge-success text-slate-950'
                        : act.action === 'STOP'
                        ? 'badge-error text-white'
                        : act.action === 'RESTART'
                        ? 'badge-warning text-slate-950'
                        : 'badge-info text-white'
                    }`}
                  >
                    {act.action}
                  </span>
                  <span className="text-base-content/80">
                    {(act.details as Record<string, string>)?.note || 'Action executed'}
                  </span>
                </div>
                <span className="text-[11px] text-base-content/50">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
