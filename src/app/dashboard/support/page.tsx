'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import type { SupportTicket } from '@/types/database'

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('Technical')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadTickets() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: ticketData } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (ticketData) setTickets(ticketData as SupportTicket[])
      } catch (e) {
        console.error('Error loading tickets:', e)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data: newTicket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title,
          department,
          priority,
          status: 'open',
          message,
        })
        .select()
        .single()

      if (error) throw error

      if (newTicket) {
        setTickets(prev => [newTicket as SupportTicket, ...prev])
      }

      setShowModal(false)
      setTitle('')
      setMessage('')
      alert('Support ticket opened! Our technical engineers will respond shortly.')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-md text-cyan-400"></span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            24/7 Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Direct communication with our gaming systems and network engineering team.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none shadow-md"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1" />
          Open Support Ticket
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="card bg-base-200/80 border border-base-content/10 p-12 text-center rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-base-300 border border-base-content/10 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Icon icon="lucide:life-buoy" className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-base-content">No Support Tickets</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1 mb-4">
              Need assistance with mods, plugins, port forwarding, or billing? Open a ticket below.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none mx-auto"
            >
              Open Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="card bg-base-200/90 border border-base-content/10 p-5 rounded-2xl hover:border-cyan-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`badge badge-sm font-bold font-mono ${
                        ticket.status === 'open'
                          ? 'badge-warning text-slate-950'
                          : ticket.status === 'resolved'
                          ? 'badge-success text-slate-950'
                          : 'badge-neutral'
                      }`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-base text-base-content">{ticket.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-base-content/60">
                    <span className="badge badge-outline badge-xs">{ticket.department}</span>
                    <span
                      className={`badge badge-xs ${
                        ticket.priority === 'urgent' || ticket.priority === 'high'
                          ? 'badge-error text-white'
                          : 'badge-neutral'
                      }`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-base-content/70 leading-relaxed font-sans pl-1">
                  {ticket.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full bg-base-200 border border-base-content/15 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                <Icon icon="lucide:message-square-plus" className="text-cyan-400" />
                Submit New Support Ticket
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="label py-1 text-xs font-semibold text-base-content/80">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Need assistance with Minecraft Paper plugins"
                  className="input input-bordered input-sm w-full bg-base-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label py-1 text-xs font-semibold text-base-content/80">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="select select-bordered select-sm w-full bg-base-300 text-xs"
                  >
                    <option value="Technical">Technical Support</option>
                    <option value="Billing">Billing &amp; Invoices</option>
                    <option value="Network">Network &amp; DDoS</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1 text-xs font-semibold text-base-content/80">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    className="select select-bordered select-sm w-full bg-base-300 text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label py-1 text-xs font-semibold text-base-content/80">
                  Detailed Message / Logs
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Provide crash logs, server IP, or any specific details..."
                  className="textarea textarea-bordered w-full bg-base-300 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none text-xs"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
