'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import type { Invoice, Profile } from '@/types/database'

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [topUpLoading, setTopUpLoading] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState<number>(100000)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    async function loadBilling() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (prof) setProfile(prof as Profile)

        const { data: invData } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (invData) setInvoices(invData as Invoice[])
      } catch (e) {
        console.error('Error loading billing data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadBilling()
  }, [])

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleTopUp = async () => {
    if (!profile) return
    setTopUpLoading(true)

    try {
      const supabase = createClient()
      const newBalance = (profile.balance || 0) + topUpAmount

      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, balance: newBalance })

      // Add a simulated top-up invoice
      const invoiceNumber = `INV-TOPUP-${Date.now().toString().slice(-6)}`
      const { data: newInv } = await supabase
        .from('invoices')
        .insert({
          user_id: profile.id,
          invoice_number: invoiceNumber,
          description: `Wallet Balance Top-Up (${formatRupiah(topUpAmount)})`,
          amount: topUpAmount,
          status: 'paid',
          payment_method: 'QRIS Instant / E-Wallet',
        })
        .select()
        .single()

      if (newInv) {
        setInvoices(prev => [newInv as Invoice, ...prev])
      }

      alert(`Successfully added ${formatRupiah(topUpAmount)} to your wallet balance!`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Top up failed')
    } finally {
      setTopUpLoading(false)
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          Billing &amp; Invoices
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          Manage your account wallet balance, payment methods, and invoice receipts.
        </p>
      </div>

      {/* Balance Card & Top-Up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-base-200 via-base-200 to-cyan-950/40 border border-cyan-500/30 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-base-content/60 uppercase font-mono mb-1">
              Account Wallet Balance
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {formatRupiah(profile?.balance || 0)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Automated renewal active
            </div>
          </div>

          <div className="pt-6">
            <span className="text-[10px] text-base-content/50 uppercase font-bold">
              Account ID: {profile?.id.slice(0, 12)}
            </span>
          </div>
        </div>

        {/* Instant Top-Up Box */}
        <div className="md:col-span-2 card bg-base-200/80 border border-base-content/10 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Icon icon="lucide:wallet" className="text-cyan-400" />
              Instant Balance Top-Up (Simulation)
            </h3>
            <span className="badge badge-neutral badge-xs font-mono">QRIS / VA</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[50000, 100000, 250000, 500000].map(amt => (
              <button
                key={amt}
                onClick={() => setTopUpAmount(amt)}
                type="button"
                className={`btn btn-sm font-mono text-xs ${
                  topUpAmount === amt
                    ? 'btn-primary bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none'
                    : 'btn-neutral bg-base-300'
                }`}
              >
                {formatRupiah(amt)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTopUp}
              disabled={topUpLoading}
              className="btn btn-primary btn-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-none"
            >
              {topUpLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Icon icon="lucide:plus" className="w-4 h-4 mr-1" />
              )}
              Add {formatRupiah(topUpAmount)} to Wallet
            </button>
            <span className="text-xs text-base-content/60">
              Instant credit without administrative fee
            </span>
          </div>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-base-content flex items-center gap-2">
          <Icon icon="lucide:receipt" className="text-amber-400" />
          Invoice &amp; Transaction History
        </h3>

        {invoices.length === 0 ? (
          <div className="p-8 text-center bg-base-200 rounded-2xl border border-base-content/10 text-xs text-base-content/60">
            No invoices generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-base-content/10 bg-base-200/80">
            <table className="table table-sm text-xs font-mono">
              <thead>
                <tr className="border-base-content/10 text-base-content/60 bg-base-300/60">
                  <th>Invoice ID</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-base-300/40">
                    <td className="font-bold text-cyan-400">{inv.invoice_number}</td>
                    <td className="font-sans font-medium text-base-content">
                      {inv.description}
                    </td>
                    <td className="font-bold text-base-content font-mono">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td>{inv.payment_method}</td>
                    <td>
                      <span className="badge badge-success badge-xs font-bold font-mono px-2 py-1 text-slate-950">
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-base-content/60">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="btn btn-ghost btn-xs text-cyan-400 hover:text-cyan-300"
                      >
                        <Icon icon="lucide:file-text" className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full bg-base-200 border border-base-content/15 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-black">
                  TLS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-base-content">Top Level Server Invoice</h4>
                  <div className="text-[10px] text-base-content/50 font-mono">
                    {selectedInvoice.invoice_number}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-base-content/5">
                <span className="text-base-content/60">Item:</span>
                <span className="font-sans font-bold text-base-content text-right">
                  {selectedInvoice.description}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-content/5">
                <span className="text-base-content/60">Amount Paid:</span>
                <span className="font-bold text-cyan-400">
                  {formatRupiah(selectedInvoice.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-content/5">
                <span className="text-base-content/60">Payment Method:</span>
                <span>{selectedInvoice.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-content/5">
                <span className="text-base-content/60">Date:</span>
                <span>{new Date(selectedInvoice.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-base-content/60">Status:</span>
                <span className="text-emerald-400 font-bold">PAID &amp; SETTLED</span>
              </div>
            </div>

            <div className="pt-4 border-t border-base-content/10 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-neutral btn-sm"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
