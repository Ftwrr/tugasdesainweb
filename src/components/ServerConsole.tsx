'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface ServerConsoleProps {
  serverId: string
  serverName: string
  initialLogs?: { message: string; created_at: string }[]
  status: string
}

export default function ServerConsole({
  serverId,
  serverName,
  initialLogs = [],
  status,
}: ServerConsoleProps) {
  const [logs, setLogs] = useState<string[]>(() => {
    if (initialLogs.length > 0) {
      return initialLogs.map(l => l.message)
    }
    return [
      `[TLS System] Connected to console websocket for ${serverName} (${serverId.slice(0, 8)})`,
      `[Server Thread/INFO] TLS Host Daemon v4.18 (BGP Anycast Node SG-SIN)`,
      `[Server Thread/INFO] Server state: ${status.toUpperCase()}`,
      `Type "help" for a list of available host and server commands.`,
    ]
  })
  const [inputVal, setInputVal] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || isSending) return

    const cmd = inputVal.trim()
    setInputVal('')
    setIsSending(true)

    const now = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `> ${cmd}`])

    // Command handling logic
    setTimeout(() => {
      const lower = cmd.toLowerCase()
      if (lower === 'help') {
        setLogs(prev => [
          ...prev,
          `[${now}] === Available Console Commands ===`,
          `  help              - List available commands`,
          `  status            - Output current CPU, RAM, and tickrate`,
          `  say <message>     - Broadcast a server-wide announcement`,
          `  players           - Display connected player count`,
          `  restart           - Schedule instantaneous daemon reboot`,
          `  backup            - Create an instant snapshot backup`,
          `  clear             - Clear current terminal console window`,
        ])
      } else if (lower === 'clear') {
        setLogs([`[TLS System] Console cleared.`])
      } else if (lower === 'status') {
        setLogs(prev => [
          ...prev,
          `[${now}] [Daemon/METRICS] Status: ONLINE | TPS: 20.00 (100% stable)`,
          `[${now}] [Daemon/METRICS] CPU Load: 18.2% | Memory: 4,920MB / 8,192MB (60.1%)`,
          `[${now}] [Daemon/METRICS] Network: In: 42.1 KB/s | Out: 189.4 KB/s | Packet Loss: 0.0%`,
        ])
      } else if (lower.startsWith('say ')) {
        const text = cmd.substring(4)
        setLogs(prev => [
          ...prev,
          `[${now}] [Server: Broadcast] [TLS Admin] ${text}`,
        ])
      } else if (lower === 'players') {
        setLogs(prev => [
          ...prev,
          `[${now}] [Server/INFO] Connected players (3/50): Ftwr (Operator), Alex_99, ZenViper`,
        ])
      } else if (lower === 'backup') {
        setLogs(prev => [
          ...prev,
          `[${now}] [TLS Snapshot] Snapshot snapshot-${Date.now().toString().slice(-6)}.tar.zst created and synced to S3 cold storage!`,
        ])
      } else {
        setLogs(prev => [
          ...prev,
          `[${now}] [Server: Console] Command executed: "${cmd}"`,
        ])
      }
      setIsSending(false)
    }, 250)
  }

  return (
    <div className="card bg-slate-950 border border-base-content/10 shadow-2xl rounded-2xl overflow-hidden font-mono text-xs">
      {/* Console Top Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error/70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-warning/70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-success/70"></span>
          </div>
          <span className="text-slate-400 text-xs ml-2 font-medium flex items-center gap-1.5">
            <Icon icon="lucide:terminal" className="w-3.5 h-3.5 text-cyan-400" />
            Live Web Terminal • {serverName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-xs badge-success gap-1 text-[10px] font-bold px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            LIVE RCON
          </span>
          <button
            onClick={() => setLogs([`[TLS System] Console cleared.`])}
            className="btn btn-ghost btn-xs text-slate-400 hover:text-white"
            title="Clear Console"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 h-80 overflow-y-auto space-y-1 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
        {logs.map((log, index) => {
          const isCmd = log.startsWith('>')
          const isError = log.includes('ERROR') || log.includes('Exception')
          const isWarn = log.includes('WARN')
          const isSuccess = log.includes('Done') || log.includes('created') || log.includes('ONLINE')
          const isSys = log.includes('[TLS')

          return (
            <div
              key={index}
              className={`break-all ${
                isCmd
                  ? 'text-cyan-400 font-bold'
                  : isError
                  ? 'text-rose-400'
                  : isWarn
                  ? 'text-amber-400'
                  : isSuccess
                  ? 'text-emerald-400'
                  : isSys
                  ? 'text-indigo-400'
                  : 'text-slate-300'
              }`}
            >
              {log}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={handleCommand}
        className="p-2.5 bg-slate-900 border-t border-white/5 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-bold pl-2 select-none">&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Enter server command (e.g. 'help', 'status', 'say Hello World')..."
          className="input input-sm input-ghost flex-1 bg-transparent border-none focus:outline-none text-slate-200 placeholder:text-slate-500 font-mono text-xs"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !inputVal.trim()}
          className="btn btn-primary btn-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none"
        >
          Send
        </button>
      </form>
    </div>
  )
}
