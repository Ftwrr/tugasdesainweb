'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/StatusBadge'
import PowerControls from '@/components/PowerControls'
import ServerConsole from '@/components/ServerConsole'
import type { RentedServer, ServerLog, ServerActivity } from '@/types/database'

export default function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [server, setServer] = useState<RentedServer | null>(null)
  const [logs, setLogs] = useState<ServerLog[]>([])
  const [activities, setActivities] = useState<ServerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedIp, setCopiedIp] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'settings'>('console')

  useEffect(() => {
    async function loadServer() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch server
        const { data: serverData, error } = await supabase
          .from('rented_servers')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error || !serverData) {
          router.push('/dashboard')
          return
        }

        setServer(serverData as RentedServer)

        // Fetch logs
        const { data: logsData } = await supabase
          .from('server_logs')
          .select('*')
          .eq('server_id', id)
          .order('created_at', { ascending: true })
          .limit(30)

        if (logsData) setLogs(logsData as ServerLog[])

        // Fetch activities
        const { data: actData } = await supabase
          .from('server_activities')
          .select('*')
          .eq('server_id', id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (actData) setActivities(actData as ServerActivity[])
      } catch (e) {
        console.error('Error fetching server detail:', e)
      } finally {
        setLoading(false)
      }
    }

    loadServer()
  }, [id, router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIp(text)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  if (loading || !server) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-md text-cyan-400"></span>
      </div>
    )
  }

  const fullAddress = `${server.ip_address}:${server.port}`

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-cyan-400 font-mono transition-colors mb-3"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Back to Server List
        </Link>

        <div className="card bg-base-200/90 border border-base-content/10 p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-base-300 border border-base-content/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon
                    icon={
                      server.game_type === 'minecraft'
                        ? 'simple-icons:minecraft'
                        : server.game_type === 'cs2'
                        ? 'lucide:crosshair'
                        : 'lucide:server'
                    }
                    className="w-6 h-6"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-black text-base-content">
                      {server.name}
                    </h1>
                    <StatusBadge status={server.status} />
                  </div>
                  <div className="text-xs text-base-content/60 font-mono flex items-center gap-2 mt-1">
                    <span className="uppercase">{server.game_type}</span>
                    <span>•</span>
                    <span>{server.region}</span>
                    <span>•</span>
                    <span>Node ID: {server.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* IP Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-300 border border-base-content/10 font-mono text-xs text-base-content/90">
                <span className="text-cyan-400 font-bold">Address:</span>
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

            {/* Power Controls */}
            <div className="flex flex-col items-start lg:items-end gap-2">
              <span className="text-[11px] font-mono text-base-content/50 uppercase">
                Daemon Controls
              </span>
              <PowerControls
                serverId={server.id}
                currentStatus={server.status}
                onStatusChange={newStatus => {
                  setServer(prev => (prev ? { ...prev, status: newStatus } : null))
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-200/70 border border-base-content/10 p-4 rounded-xl font-mono text-xs">
          <div className="flex justify-between text-base-content/60 mb-2">
            <span>CPU UTILIZATION</span>
            <Icon icon="lucide:cpu" className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-base-content mb-1">
            {server.status === 'running' ? `${server.current_cpu_pct}%` : '0%'}
          </div>
          <progress
            className="progress progress-cyan w-full h-1.5"
            value={server.status === 'running' ? server.current_cpu_pct : 0}
            max="100"
          ></progress>
          <div className="text-[10px] text-base-content/50 mt-1">
            {server.vcpu} dedicated threads
          </div>
        </div>

        <div className="card bg-base-200/70 border border-base-content/10 p-4 rounded-xl font-mono text-xs">
          <div className="flex justify-between text-base-content/60 mb-2">
            <span>MEMORY (RAM)</span>
            <Icon icon="lucide:memory-stick" className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-base-content mb-1">
            {server.status === 'running' ? `${server.current_ram_pct}%` : '0%'}
          </div>
          <progress
            className="progress progress-accent w-full h-1.5"
            value={server.status === 'running' ? server.current_ram_pct : 0}
            max="100"
          ></progress>
          <div className="text-[10px] text-base-content/50 mt-1">
            {((server.ram_gb * server.current_ram_pct) / 100).toFixed(1)} / {server.ram_gb} GB used
          </div>
        </div>

        <div className="card bg-base-200/70 border border-base-content/10 p-4 rounded-xl font-mono text-xs">
          <div className="flex justify-between text-base-content/60 mb-2">
            <span>STORAGE (NVMe)</span>
            <Icon icon="lucide:hard-drive" className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-base-content mb-1">
            {server.current_disk_pct}%
          </div>
          <progress
            className="progress progress-warning w-full h-1.5"
            value={server.current_disk_pct}
            max="100"
          ></progress>
          <div className="text-[10px] text-base-content/50 mt-1">
            {((server.ssd_gb * server.current_disk_pct) / 100).toFixed(1)} / {server.ssd_gb} GB used
          </div>
        </div>

        <div className="card bg-base-200/70 border border-base-content/10 p-4 rounded-xl font-mono text-xs">
          <div className="flex justify-between text-base-content/60 mb-2">
            <span>NETWORK I/O</span>
            <Icon icon="lucide:activity" className="text-purple-400" />
          </div>
          <div className="text-xl font-bold text-base-content mb-1">
            {server.status === 'running' ? '184.2 KB/s' : '0.0 KB/s'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            0% Packet Drop Rate
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-base-content/10 pb-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`btn btn-sm ${
            activeTab === 'console'
              ? 'btn-primary bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none'
              : 'btn-ghost text-base-content/70'
          }`}
        >
          <Icon icon="lucide:terminal" className="w-4 h-4 mr-1" />
          Terminal Console
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`btn btn-sm ${
            activeTab === 'files'
              ? 'btn-primary bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none'
              : 'btn-ghost text-base-content/70'
          }`}
        >
          <Icon icon="lucide:folder" className="w-4 h-4 mr-1" />
          File Manager
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`btn btn-sm ${
            activeTab === 'settings'
              ? 'btn-primary bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none'
              : 'btn-ghost text-base-content/70'
          }`}
        >
          <Icon icon="lucide:settings" className="w-4 h-4 mr-1" />
          Server Settings
        </button>
      </div>

      {/* TAB: CONSOLE */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          <ServerConsole
            serverId={server.id}
            serverName={server.name}
            initialLogs={logs}
            status={server.status}
          />

          {/* Activity History for this server */}
          <div className="card bg-base-200/60 border border-base-content/10 p-5 rounded-2xl">
            <h3 className="font-bold text-sm text-base-content mb-3 flex items-center gap-2">
              <Icon icon="lucide:history" className="text-cyan-400" />
              Recent Audit Log
            </h3>
            <div className="space-y-2">
              {activities.map(act => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg bg-base-300/80 border border-base-content/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral badge-xs font-bold uppercase">
                      {act.action}
                    </span>
                    <span className="text-base-content/80">
                      {(act.details as Record<string, string>)?.note || 'Action performed'}
                    </span>
                  </div>
                  <span className="text-[10px] text-base-content/50">
                    {new Date(act.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FILES */}
      {activeTab === 'files' && (
        <div className="card bg-base-200/80 border border-base-content/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono text-base-content/70">
              Path: <span className="text-cyan-400">/home/container/</span>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-xs btn-outline">New File</button>
              <button className="btn btn-xs btn-outline">Upload Zip</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm text-xs font-mono">
              <thead>
                <tr className="border-base-content/10 text-base-content/60">
                  <th>Name</th>
                  <th>Size</th>
                  <th>Modified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-base-300/50">
                  <td className="flex items-center gap-2 font-bold text-cyan-400">
                    <Icon icon="lucide:folder" className="text-amber-400" />
                    plugins/
                  </td>
                  <td>18 items</td>
                  <td>2 hours ago</td>
                  <td><button className="btn btn-ghost btn-xs text-cyan-400">Open</button></td>
                </tr>
                <tr className="hover:bg-base-300/50">
                  <td className="flex items-center gap-2 font-bold text-cyan-400">
                    <Icon icon="lucide:folder" className="text-amber-400" />
                    world/
                  </td>
                  <td>142 MB</td>
                  <td>5 mins ago</td>
                  <td><button className="btn btn-ghost btn-xs text-cyan-400">Open</button></td>
                </tr>
                <tr className="hover:bg-base-300/50">
                  <td className="flex items-center gap-2">
                    <Icon icon="lucide:file-text" className="text-base-content/60" />
                    server.properties
                  </td>
                  <td>1.8 KB</td>
                  <td>1 day ago</td>
                  <td><button className="btn btn-ghost btn-xs text-cyan-400">Edit</button></td>
                </tr>
                <tr className="hover:bg-base-300/50">
                  <td className="flex items-center gap-2">
                    <Icon icon="lucide:file-code" className="text-base-content/60" />
                    purpur.yml
                  </td>
                  <td>8.2 KB</td>
                  <td>3 days ago</td>
                  <td><button className="btn btn-ghost btn-xs text-cyan-400">Edit</button></td>
                </tr>
                <tr className="hover:bg-base-300/50">
                  <td className="flex items-center gap-2">
                    <Icon icon="lucide:file-text" className="text-base-content/60" />
                    whitelist.json
                  </td>
                  <td>120 B</td>
                  <td>1 day ago</td>
                  <td><button className="btn btn-ghost btn-xs text-cyan-400">Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="card bg-base-200/80 border border-base-content/10 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-base text-base-content">
            Server Configuration &amp; Auto-Renew
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-base-300 border border-base-content/5 space-y-2">
              <div className="text-base-content/60">JAVA / STARTUP FLAGS</div>
              <input
                type="text"
                defaultValue="-Xms4G -Xmx8G -XX:+UseG1GC"
                className="input input-sm input-bordered w-full text-xs font-mono bg-base-200"
              />
            </div>

            <div className="p-4 rounded-xl bg-base-300 border border-base-content/5 space-y-2">
              <div className="text-base-content/60">AUTO REBOOT SCHEDULE</div>
              <select className="select select-sm select-bordered w-full text-xs font-mono bg-base-200">
                <option>Every 24 Hours (04:00 AM WIB)</option>
                <option>Every 12 Hours</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-rose-400">Danger Zone: Delete Server</div>
              <div className="text-[11px] text-base-content/60">
                Permanent deletion of all container files and IP release.
              </div>
            </div>
            <button
              onClick={() => alert('Demo protection: Deletion disabled in preview mode.')}
              className="btn btn-error btn-xs text-white"
            >
              Destroy Server
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
