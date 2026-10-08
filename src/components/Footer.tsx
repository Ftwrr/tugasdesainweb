import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function Footer() {
  return (
    <footer className="bg-base-300 border-t border-base-content/10 pt-16 pb-8 text-base-content/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-base-content/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Icon icon="lucide:server" className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl tracking-wider text-base-content">
                TLS <span className="text-cyan-400">HOST</span>
              </span>
            </div>
            <p className="text-sm text-base-content/70 max-w-sm leading-relaxed">
              Top Level Server (TLS) provides enterprise-grade, low-latency game hosting and dedicated cloud instances powered by AMD Ryzen 9 7950X processors and NVMe Gen4 storage across Southeast Asia.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 hover:text-cyan-400"
                aria-label="Discord"
              >
                <Icon icon="simple-icons:discord" className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Ftwrr"
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 hover:text-cyan-400"
                aria-label="GitHub"
              >
                <Icon icon="simple-icons:github" className="w-4 h-4" />
              </a>
              <a
                href="https://steamcommunity.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 hover:text-cyan-400"
                aria-label="Steam"
              >
                <Icon icon="simple-icons:steam" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-4 flex items-center gap-2">
              <Icon icon="lucide:gamepad-2" className="text-cyan-400" />
              Game Servers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#servers" className="hover:text-cyan-400 transition-colors">
                  Minecraft Paper / Modded
                </Link>
              </li>
              <li>
                <Link href="/#servers" className="hover:text-cyan-400 transition-colors">
                  Counter-Strike 2 (128T)
                </Link>
              </li>
              <li>
                <Link href="/#servers" className="hover:text-cyan-400 transition-colors">
                  Palworld Dedicated
                </Link>
              </li>
              <li>
                <Link href="/#servers" className="hover:text-cyan-400 transition-colors">
                  Rust Wipe-Ready
                </Link>
              </li>
              <li>
                <Link href="/#servers" className="hover:text-cyan-400 transition-colors">
                  Valheim Dedicated World
                </Link>
              </li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-4 flex items-center gap-2">
              <Icon icon="lucide:network" className="text-emerald-400" />
              Datacenters
            </h4>
            <ul className="space-y-2 text-sm font-mono">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Jakarta, ID (IDC 3D)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Singapore (Equinix SG1)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Tokyo, JP (Equinix TY2)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Sydney, AU (Equinix SY1)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Anycast DDoS Shield (3.2 Tbps)
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-4 flex items-center gap-2">
              <Icon icon="lucide:shield-check" className="text-purple-400" />
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Control Panel
                </Link>
              </li>
              <li>
                <Link href="/dashboard/deploy" className="hover:text-cyan-400 transition-colors">
                  Instant Deploy
                </Link>
              </li>
              <li>
                <Link href="/dashboard/billing" className="hover:text-cyan-400 transition-colors">
                  Invoices & Wallet
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-cyan-400 transition-colors">
                  Submit Support Ticket
                </Link>
              </li>
              <li>
                <a href="https://nayeony.my.id" className="hover:text-cyan-400 transition-colors font-mono text-xs">
                  nayeony.my.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <span>© 2026 Top Level Server (TLS). Built for production with Next.js & Supabase.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase font-bold text-base-content/50">Accepted Payments:</span>
            <span className="px-2 py-0.5 rounded bg-base-200 border border-base-content/10 font-medium">QRIS Instant</span>
            <span className="px-2 py-0.5 rounded bg-base-200 border border-base-content/10 font-medium">BCA / Mandiri VA</span>
            <span className="px-2 py-0.5 rounded bg-base-200 border border-base-content/10 font-medium">E-Wallet</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
