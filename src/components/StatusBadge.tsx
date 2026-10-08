import type { ServerStatus } from '@/types/database'

interface StatusBadgeProps {
  status: ServerStatus
  showPulse?: boolean
}

export default function StatusBadge({ status, showPulse = true }: StatusBadgeProps) {
  switch (status) {
    case 'running':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-sm">
          {showPulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          RUNNING
        </span>
      )
    case 'starting':
    case 'restarting':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-950/60 text-amber-400 border border-amber-800/50">
          <span className="loading loading-spinner loading-xs text-amber-400"></span>
          {status.toUpperCase()}
        </span>
      )
    case 'stopped':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-rose-950/60 text-rose-400 border border-rose-800/50">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          STOPPED
        </span>
      )
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-purple-950/60 text-purple-400 border border-purple-800/50">
          <span className="h-2 w-2 rounded-full bg-purple-500"></span>
          SUSPENDED
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-base-300 text-base-content/70">
          UNKNOWN
        </span>
      )
  }
}
