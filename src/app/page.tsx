import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LatencyTester from '@/components/LatencyTester'
import ServerPlanCard from '@/components/ServerPlanCard'
import { createPublicClient } from '@/lib/supabase/public'
import type { ServerPlan } from '@/types/database'

export default async function HomePage() {
  const supabase = createPublicClient()

  // Fetch plans from Supabase
  const { data: plansData } = await supabase
    .from('server_plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  const plans: ServerPlan[] = plansData || []

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content bg-grid-pattern selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Top Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono font-medium mb-8 backdrop-blur-sm shadow-lg shadow-cyan-950/50 animate-bounce-short">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NEW: AMD Ryzen 9 7950X &amp; 3.2 Tbps DDoS Shield Live in Jakarta &amp; SG</span>
              <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-base-content max-w-4xl mx-auto leading-[1.1]">
              High Performance{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Game Server
              </span>{' '}
              &amp; Cloud Hosting
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              Deploy dedicated servers in under 60 seconds. Guaranteed sub-15ms latency across Southeast Asia, NVMe Gen4 storage, and full web RCON control panel.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#servers"
                className="btn btn-primary btn-md sm:btn-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold border-none shadow-xl shadow-cyan-500/25 px-8"
              >
                <Icon icon="lucide:zap" className="w-5 h-5 mr-1" />
                Explore Game Servers
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-neutral btn-md sm:btn-lg bg-base-200 hover:bg-base-300 border-base-content/10 font-bold px-8"
              >
                <Icon icon="lucide:terminal" className="w-5 h-5 mr-1 text-cyan-400" />
                Live Control Panel
              </Link>
            </div>

            {/* Live Stats Row */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="card bg-base-200/60 border border-base-content/10 p-4 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  &lt; 12 ms
                </div>
                <div className="text-xs text-base-content/60 uppercase font-medium mt-1">
                  Average SEA Latency
                </div>
              </div>
              <div className="card bg-base-200/60 border border-base-content/10 p-4 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  99.99%
                </div>
                <div className="text-xs text-base-content/60 uppercase font-medium mt-1">
                  Uptime SLA Guarantee
                </div>
              </div>
              <div className="card bg-base-200/60 border border-base-content/10 p-4 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  &lt; 45 sec
                </div>
                <div className="text-xs text-base-content/60 uppercase font-medium mt-1">
                  Instant Auto Provision
                </div>
              </div>
              <div className="card bg-base-200/60 border border-base-content/10 p-4 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  3.2 Tbps
                </div>
                <div className="text-xs text-base-content/60 uppercase font-medium mt-1">
                  L3/L4/L7 Anycast DDoS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVER CATALOG SECTION */}
        <section id="servers" className="py-16 bg-base-200/40 border-y border-base-content/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-cyan-400 mb-2">
                  <Icon icon="lucide:gamepad-2" className="w-4 h-4" />
                  Instant Provisioning Catalog
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight">
                  Popular Game &amp; VPS Servers
                </h2>
                <p className="text-sm text-base-content/70 mt-2 max-w-xl">
                  Choose your dedicated game host plan. All servers include free automated backups, high-tick rate CPU pins, and dedicated IP ports.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge badge-success badge-sm gap-1 font-mono text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Instant Setup Active
                </span>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <ServerPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* LIVE LATENCY TEST POPs */}
        <section id="nodes" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LatencyTester />
          </div>
        </section>

        {/* ENTERPRISE ARCHITECTURE FEATURES */}
        <section id="features" className="py-20 bg-base-200/40 border-t border-base-content/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                ENGINEERED FOR GAMING &amp; HIGH IOPS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-base-content mt-2">
                Why Top Level Server Outperforms Standard VPS
              </h2>
              <p className="text-sm sm:text-base text-base-content/70 mt-3">
                Most cloud providers throttle game server tickrates with shared CPU threads. TLS uses dedicated AMD Ryzen 9 7950X cores with unshared high frequencies up to 5.7 GHz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-cyan-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:shield-check" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  Layer 7 Custom Game DDoS Shield
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Real-time deep packet inspection tailored for Minecraft query exploits, Source Engine reflection floods, and UDP volumetric saturation without dropping players.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:hard-drive" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  PCIe 4.0 NVMe Enterprise SSDs
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Up to 7,000 MB/s sequential read/write speeds ensuring instant chunk generation in Minecraft, zero stutter during Rust map saves, and instantaneous container reboots.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-purple-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:terminal" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  Interactive RCON Web Terminal
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Direct websocket access to your game server daemon. Execute in-game commands, monitor real-time resource meters, schedule restarts, and manage mods effortlessly.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:archive" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  Automated Cloud Snapshots
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Never lose a world build or player progress. Automated snapshots are mirrored offsite daily with 1-click restore capability and downloadable zip archives.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-sky-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:globe-2" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  Direct SEA Internet Exchanges
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Direct BGP peering with Telkom Indonesia, Biznet, Indosat Ooredoo, SGIX, and Cloudflare Magic Transit for crystal-clear ping stability.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card bg-base-200 border border-base-content/10 p-6 rounded-2xl hover:border-rose-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5">
                  <Icon icon="lucide:life-buoy" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-base-content mb-2">
                  24/7 Gaming Engineer Support
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Our technical staff doesn&apos;t just reboot nodes — we understand plugin errors, Forge/Fabric crashes, Metamod configurations, and port forwarding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400">FREQUENTLY ASKED</span>
              <h2 className="text-3xl font-black text-base-content mt-1">Common Questions</h2>
            </div>

            <div className="space-y-3">
              <div className="collapse collapse-arrow bg-base-200 border border-base-content/10">
                <input type="radio" name="faq-accordion" defaultChecked />
                <div className="collapse-title text-base font-bold text-base-content">
                  How fast is server provisioning after payment?
                </div>
                <div className="collapse-content text-xs text-base-content/70 leading-relaxed">
                  Provisioning is 100% automated via our KVM orchestrator. Once checkout or wallet payment is confirmed, your server is booted, allocated an IP:port, and ready to play in under 60 seconds.
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200 border border-base-content/10">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-base font-bold text-base-content">
                  Can I upgrade my RAM or CPU cores later without data loss?
                </div>
                <div className="collapse-content text-xs text-base-content/70 leading-relaxed">
                  Yes, seamlessly! You can scale your server specs with 1 click from your Dashboard. All existing files, worlds, plugins, and configs are fully preserved during plan upgrades.
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200 border border-base-content/10">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-base font-bold text-base-content">
                  What payment methods are supported?
                </div>
                <div className="collapse-content text-xs text-base-content/70 leading-relaxed">
                  We support QRIS (instant settlement from BCA, GoPay, OVO, Dana, ShopeePay), Indonesian Bank Virtual Accounts, PayPal, and credit cards.
                </div>
              </div>

              <div className="collapse collapse-arrow bg-base-200 border border-base-content/10">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-base font-bold text-base-content">
                  Do you provide full FTP and root access?
                </div>
                <div className="collapse-content text-xs text-base-content/70 leading-relaxed">
                  Yes! All game servers have full SFTP file access and web file manager. If you rent our Cloud VPS nodes, you receive complete root SSH credentials with Ubuntu 24.04 or Debian.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-16 bg-gradient-to-b from-transparent to-base-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/30 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to Experience Zero-Lag Game Hosting?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-cyan-200/80 max-w-xl mx-auto">
                Join hundreds of communities running on Top Level Server. Deploy your world in Jakarta or Singapore now.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/dashboard/deploy"
                  className="btn btn-primary bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold border-none px-8 shadow-lg shadow-cyan-400/20"
                >
                  <Icon icon="lucide:rocket" className="w-5 h-5 mr-1" />
                  Deploy Your Server Now
                </Link>
                <Link
                  href="/auth/login"
                  className="btn btn-outline border-white/20 text-white hover:bg-white/10 font-bold px-6"
                >
                  Try Demo Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
