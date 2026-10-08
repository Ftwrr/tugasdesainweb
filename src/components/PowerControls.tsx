'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import type { ServerStatus } from '@/types/database'

interface PowerControlsProps {
  serverId: string
  currentStatus: ServerStatus
  onStatusChange?: (newStatus: ServerStatus) => void
}

export default function PowerControls({
  serverId,
  currentStatus,
  onStatusChange,
}: PowerControlsProps) {
  const [status, setStatus] = useState<ServerStatus>(currentStatus)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setLoadingAction(action)
    setNotification(null)

    try {
      const res = await fetch(`/api/servers/${serverId}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute power action')
      }

      setStatus(data.status)
      if (onStatusChange) onStatusChange(data.status)
      setNotification(`Action ${action.toUpperCase()} completed successfully`)

      setTimeout(() => setNotification(null), 3500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Power action failed'
      setNotification(`Error: ${msg}`)
    } finally {
      setLoadingAction(null)
    }
  }

  const isRunning = status === 'running'
  const isStopped = status === 'stopped'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Start Button */}
        <button
          onClick={() => handleAction('start')}
          disabled={loadingAction !== null || isRunning}
          className={`btn btn-sm ${
            isRunning
              ? 'btn-disabled opacity-40'
              : 'btn-success text-slate-950 font-bold hover:brightness-110'
          }`}
          title="Start Server"
        >
          {loadingAction === 'start' ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Icon icon="lucide:play" className="w-4 h-4" />
          )}
          Start
        </button>

        {/* Restart Button */}
        <button
          onClick={() => handleAction('restart')}
          disabled={loadingAction !== null || isStopped}
          className={`btn btn-sm btn-warning text-slate-950 font-bold hover:brightness-110 ${
            isStopped ? 'btn-disabled opacity-40' : ''
          }`}
          title="Restart Server"
        >
          {loadingAction === 'restart' ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Icon icon="lucide:rotate-cw" className="w-4 h-4" />
          )}
          Restart
        </button>

        {/* Stop Button */}
        <button
          onClick={() => handleAction('stop')}
          disabled={loadingAction !== null || isStopped}
          className={`btn btn-sm btn-error text-white font-bold hover:brightness-110 ${
            isStopped ? 'btn-disabled opacity-40' : ''
          }`}
          title="Stop Server"
        >
          {loadingAction === 'stop' ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Icon icon="lucide:square" className="w-4 h-4" />
          )}
          Stop
        </button>
      </div>

      {notification && (
        <div
          className={`text-[11px] font-mono px-2 py-1 rounded border animate-fadeIn ${
            notification.startsWith('Error')
              ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
          }`}
        >
          {notification}
        </div>
      )}
    </div>
  )
}
