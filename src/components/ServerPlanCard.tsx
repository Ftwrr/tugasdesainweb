'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { ServerPlan } from '@/types/database'

interface ServerPlanCardProps {
  plan: ServerPlan
  currencyMode?: 'monthly' | 'hourly'
}

export default function ServerPlanCard({ plan, currencyMode = 'monthly' }: ServerPlanCardProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const isPopular = plan.badge === 'POPULAR' || plan.badge === 'BEAST MODE'

  return (
    <div
      className={`card relative bg-base-200/90 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${
        isPopular
          ? 'border-cyan-500/50 shadow-xl shadow-cyan-500/10'
          : 'border-base-content/10 hover:border-base-content/25'
      }`}
    >
      {/* Badge if available */}
      {plan.badge && (
        <div className="absolute -top-3 right-4">
          <span
            className={`badge badge-sm font-bold tracking-wider px-2.5 py-2 uppercase shadow-md ${
              isPopular
                ? 'badge-primary bg-cyan-500 text-slate-950 border-none'
                : 'badge-neutral bg-base-300 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="card-body p-6">
        {/* Header: Icon & Name */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-base-300 border border-base-content/10 flex items-center justify-center shrink-0 text-cyan-400 shadow-inner">
            <Icon icon={plan.icon || 'lucide:server'} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="card-title text-base font-bold text-base-content leading-tight">
              {plan.name}
            </h3>
            <span className="text-xs text-base-content/60 font-mono uppercase tracking-wide">
              {plan.game_type} • {plan.category}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-base-content/70 line-clamp-2 mb-4 leading-relaxed">
          {plan.description}
        </p>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-base-300/60 border border-base-content/5 mb-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-base-content/80">
            <Icon icon="lucide:cpu" className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{plan.vcpu} vCPU Cores</span>
          </div>
          <div className="flex items-center gap-1.5 text-base-content/80">
            <Icon icon="lucide:memory-stick" className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{plan.ram_gb} GB DDR5 RAM</span>
          </div>
          <div className="flex items-center gap-1.5 text-base-content/80">
            <Icon icon="lucide:hard-drive" className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{plan.ssd_gb} GB NVMe Gen4</span>
          </div>
          <div className="flex items-center gap-1.5 text-base-content/80">
            <Icon icon="lucide:wifi" className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{plan.bandwidth_tb} TB Bandwidth</span>
          </div>
        </div>

        {/* Feature Checkmarks */}
        <ul className="space-y-1.5 text-xs text-base-content/80 mb-6 flex-1">
          {plan.features?.slice(0, 4).map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Icon icon="lucide:check" className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Pricing and Action */}
        <div className="pt-4 border-t border-base-content/10 flex items-center justify-between mt-auto">
          <div>
            <div className="text-[11px] text-base-content/50 uppercase font-bold">Starting At</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-cyan-400 font-mono">
                {currencyMode === 'monthly'
                  ? formatRupiah(plan.price_monthly)
                  : `${formatRupiah(plan.price_hourly)}/hr`}
              </span>
              <span className="text-[10px] text-base-content/50">/month</span>
            </div>
          </div>

          <Link
            href={`/dashboard/deploy?plan=${plan.slug}`}
            className={`btn btn-sm font-bold border-none transition-all shadow-md ${
              isPopular
                ? 'btn-primary bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                : 'btn-neutral bg-base-300 hover:bg-cyan-500 hover:text-slate-950 text-base-content'
            }`}
          >
            <Icon icon="lucide:zap" className="w-3.5 h-3.5" />
            Rent Server
          </Link>
        </div>
      </div>
    </div>
  )
}
