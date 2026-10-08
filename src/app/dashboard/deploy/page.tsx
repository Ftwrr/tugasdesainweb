'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'
import type { ServerPlan, Profile } from '@/types/database'

function DeployForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlanSlug = searchParams.get('plan') || 'minecraft-paper'

  const [plans, setPlans] = useState<ServerPlan[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedPlanSlug, setSelectedPlanSlug] = useState(initialPlanSlug)
  const [selectedRegion, setSelectedRegion] = useState('Jakarta (ID)')
  const [serverName, setServerName] = useState('My TopLevel Game Server')
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [deployStep, setDeployStep] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (prof) setProfile(prof as Profile)

        const { data: plansData } = await supabase
          .from('server_plans')
          .select('*')
          .order('price_monthly', { ascending: true })

        if (plansData) setPlans(plansData as ServerPlan[])
      } catch (e) {
        console.error('Error loading deploy data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const selectedPlan = plans.find(p => p.slug === selectedPlanSlug) || plans[0]

  const regions = [
    { name: 'Jakarta (ID)', ping: '8ms', code: 'ID-JKT', flag: '🇮🇩', dc: 'IDC 3D Duren Tiga' },
    { name: 'Singapore (SG)', ping: '14ms', code: 'SG-SIN', flag: '🇸🇬', dc: 'Equinix SG1' },
    { name: 'Tokyo (JP)', ping: '58ms', code: 'JP-TYO', flag: '🇯🇵', dc: 'Equinix TY2' },
  ]

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    setDeploying(true)
    setErrorMsg(null)

    try {
      setDeployStep('Allocating KVM hypervisor resources...')
      await new Promise(r => setTimeout(r, 600))

      setDeployStep('Routing Anycast IP and Anti-DDoS rules...')
      await new Promise(r => setTimeout(r, 600))

      setDeployStep('Creating server record and generating invoice...')
      const res = await fetch('/api/servers/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: selectedPlan.slug,
          serverName: serverName.trim() || `${selectedPlan.name} Node`,
          region: selectedRegion,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to deploy server')
      }

      setDeployStep('Server online! Redirecting to Terminal Console...')
      await new Promise(r => setTimeout(r, 800))

      router.push(`/dashboard/servers/${data.server.id}`)
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Deployment failed')
      setDeploying(false)
      setDeployStep(null)
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-cyan-400 font-mono transition-colors mb-3"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          Rent &amp; Deploy New Server
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          Select your game template, datacenter location, and launch in under 60 seconds.
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-xs py-2.5 px-4 rounded-xl flex items-center">
          <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Deployment Modal Overlay when deploying */}
      {deploying && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card max-w-md w-full bg-base-200 border border-cyan-500/40 p-8 rounded-2xl shadow-2xl text-center space-y-4">
            <span className="loading loading-spinner loading-lg text-cyan-400 mx-auto"></span>
            <h3 className="text-lg font-bold text-base-content">
              Provisioning Game Server
            </h3>
            <p className="text-xs font-mono text-cyan-400 animate-pulse">
              {deployStep}
            </p>
            <progress className="progress progress-cyan w-full"></progress>
          </div>
        </div>
      )}

      <form onSubmit={handleDeploy} className="space-y-8">
        {/* Step 1: Select Plan */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-base-content">
              Select Game Plan &amp; Specs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plans.map(plan => {
              const isSelected = selectedPlanSlug === plan.slug
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanSlug(plan.slug)}
                  className={`card p-4 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-base-200/80 border-base-content/10 hover:border-base-content/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-base-300 border border-base-content/10 flex items-center justify-center text-cyan-400 shrink-0">
                        <Icon icon={plan.icon || 'lucide:server'} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-base-content">
                          {plan.name}
                        </div>
                        <div className="text-[10px] text-base-content/60 font-mono uppercase">
                          {plan.game_type}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-cyan-400 font-mono">
                        {formatRupiah(plan.price_monthly)}
                      </div>
                      <div className="text-[10px] text-base-content/50">/month</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-base-content/5 font-mono text-[11px] text-base-content/70">
                    <div>{plan.vcpu} vCPU</div>
                    <div>{plan.ram_gb} GB RAM</div>
                    <div>{plan.ssd_gb} GB NVMe</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 2: Datacenter Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-base-content">
              Select Datacenter Region
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {regions.map(r => {
              const isSelected = selectedRegion === r.name
              return (
                <div
                  key={r.name}
                  onClick={() => setSelectedRegion(r.name)}
                  className={`card p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-base-200/80 border-base-content/10 hover:border-base-content/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{r.flag}</span>
                    <span className="badge badge-neutral badge-xs font-mono text-emerald-400">
                      {r.ping}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-base-content">{r.name}</div>
                  <div className="text-[10px] text-base-content/50 font-mono mt-0.5">
                    {r.dc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 3: Server Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-bold text-base-content">
              Server Hostname &amp; Setup
            </h2>
          </div>

          <div className="card bg-base-200/80 border border-base-content/10 p-5 rounded-xl space-y-4">
            <div>
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                Server Display Name
              </label>
              <input
                type="text"
                required
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                placeholder="e.g. My Survival SMP 2026"
                className="input input-bordered input-sm w-full bg-base-300 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-base-content/10">
              <div>
                <div className="text-xs font-bold text-base-content">Automatic Monthly Renewal</div>
                <div className="text-[11px] text-base-content/60">
                  Deduct from balance automatically when 30 days elapse
                </div>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm" />
            </div>
          </div>
        </div>

        {/* Step 4: Summary & Checkout */}
        <div className="card bg-gradient-to-r from-base-200 via-base-200 to-cyan-950/30 border border-cyan-500/30 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-base-content/60 uppercase font-mono">
                Order Summary
              </div>
              <div className="text-lg font-bold text-base-content mt-0.5">
                {selectedPlan?.name} • {selectedRegion}
              </div>
              <div className="text-xs text-cyan-400 font-mono mt-1">
                Your Balance: {formatRupiah(profile?.balance || 0)}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-base-content/60 uppercase font-mono">
                Total Due Today
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {formatRupiah(selectedPlan?.price_monthly || 0)}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Zero Setup Fees • Instant Boot
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={deploying}
            className="btn btn-primary btn-md w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black border-none shadow-xl shadow-cyan-500/20 text-sm tracking-wide"
          >
            <Icon icon="lucide:rocket" className="w-5 h-5 mr-1" />
            Confirm &amp; Deploy Server Now
          </button>
        </div>
      </form>
    </div>
  )
}

export default function DeployPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono">Loading deploy wizard...</div>}>
      <DeployForm />
    </Suspense>
  )
}
