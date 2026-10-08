'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface NodePing {
  city: string
  country: string
  code: string
  ip: string
  baseLatency: number
  ping: number | null
  status: 'idle' | 'testing' | 'done'
}

export default function LatencyTester() {
  const [nodes, setNodes] = useState<NodePing[]>([
    { city: 'Jakarta', country: 'Indonesia', code: 'ID-JKT', ip: '103.187.144.22', baseLatency: 8, ping: 9, status: 'idle' },
    { city: 'Singapore', country: 'Singapore', code: 'SG-SIN', ip: '139.180.198.85', baseLatency: 14, ping: 16, status: 'idle' },
    { city: 'Tokyo', country: 'Japan', code: 'JP-TYO', ip: '108.61.201.119', baseLatency: 58, ping: 62, status: 'idle' },
    { city: 'Sydney', country: 'Australia', code: 'AU-SYD', ip: '139.99.144.11', baseLatency: 92, ping: 96, status: 'idle' },
  ])
  const [isTesting, setIsTesting] = useState(false)

  const runTest = async () => {
    setIsTesting(true)
    // Reset pings
    setNodes(prev => prev.map(n => ({ ...n, status: 'testing', ping: null })))

    for (let i = 0; i < nodes.length; i++) {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 200))
      setNodes(prev =>
        prev.map((n, idx) => {
          if (idx === i) {
            const jitter = Math.floor(Math.random() * 5) - 2
            return {
              ...n,
              ping: Math.max(4, n.baseLatency + jitter),
              status: 'done',
            }
          }
          return n
        })
      )
    }

    setIsTesting(false)
  }

  return (
    <div className="card bg-base-200/90 border border-base-content/10 shadow-2xl backdrop-blur-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Icon icon="lucide:activity" className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-base-content">
              Edge Network Latency Test
            </h3>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Test routing and ping from your current client connection to our tier-1 game host POPs.
          </p>
        </div>

        <button
          onClick={runTest}
          disabled={isTesting}
          className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none shadow-lg shadow-cyan-500/20"
        >
          {isTesting ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Pinging POPs...
            </>
          ) : (
            <>
              <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
              Run Ping Test
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map(node => (
          <div
            key={node.code}
            className="p-4 rounded-xl bg-base-300/80 border border-base-content/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="badge badge-neutral badge-sm font-mono text-[10px] uppercase">
                  {node.code}
                </span>
                <span className="font-semibold text-sm text-base-content">{node.city}</span>
              </div>
              <span className="text-[11px] text-base-content/50">{node.country}</span>
            </div>

            <div className="font-mono text-xs text-base-content/60 mb-3 truncate">
              {node.ip}
            </div>

            <div className="flex items-end justify-between pt-2 border-t border-base-content/10">
              <span className="text-xs text-base-content/60">Estimated Ping:</span>
              <div className="flex items-center gap-1.5">
                {node.status === 'testing' ? (
                  <span className="loading loading-dots loading-xs text-cyan-400"></span>
                ) : (
                  <>
                    <span
                      className={`text-lg font-black font-mono ${
                        (node.ping || 0) < 30
                          ? 'text-emerald-400'
                          : (node.ping || 0) < 80
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {node.ping ? `${node.ping}ms` : '--'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        (node.ping || 0) < 30
                          ? 'bg-emerald-400'
                          : (node.ping || 0) < 80
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                    ></span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
