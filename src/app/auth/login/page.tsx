'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccessMsg('Authenticated! Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setErrorMsg(null)
    setDemoLoading(true)

    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed')
      }

      setSuccessMsg('Logged in as Demo User! Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Demo login failed')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100 bg-grid-pattern relative">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="card w-full max-w-md bg-base-200/95 border border-base-content/10 shadow-2xl backdrop-blur-md p-6 sm:p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Icon icon="lucide:server" className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-wider text-base-content">
              TLS <span className="text-cyan-400">HOST</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-base-content tracking-tight">
            Control Panel Login
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            Access your game servers, console terminal, and billing.
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/50 mb-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 mb-1.5">
            <Icon icon="lucide:sparkles" className="w-4 h-4" />
            <span>Instant Evaluation / Demo Access</span>
          </div>
          <p className="text-[11px] text-cyan-200/70 mb-3">
            Sign in instantly with a pre-configured account with active Minecraft &amp; CS2 servers!
          </p>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            type="button"
            className="btn btn-sm w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold border-none shadow-md shadow-cyan-500/20"
          >
            {demoLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Logging into Demo Account...
              </>
            ) : (
              <>
                <Icon icon="lucide:log-in" className="w-4 h-4 mr-1" />
                1-Click Demo Login
              </>
            )}
          </button>
        </div>

        <div className="divider text-[11px] text-base-content/40 uppercase font-mono my-2">
          Or Enter Credentials
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="alert alert-error text-xs py-2 px-3 mb-4 rounded-lg flex items-center">
            <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success text-xs py-2 px-3 mb-4 rounded-lg flex items-center">
            <Icon icon="lucide:check-circle" className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input input-bordered input-sm w-full bg-base-300/80 text-xs pl-9"
              />
              <Icon
                icon="lucide:mail"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between py-1">
              <label className="label py-0 text-xs font-semibold text-base-content/80">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered input-sm w-full bg-base-300/80 text-xs pl-9"
              />
              <Icon
                icon="lucide:lock"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="btn btn-neutral btn-sm w-full font-bold bg-base-300 hover:bg-base-content hover:text-base-100 transition-all mt-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Sign In with Password'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-base-content/60">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-cyan-400 font-bold hover:underline">
            Register Account
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-base-content/10 text-center">
          <Link href="/" className="text-xs text-base-content/50 hover:text-base-content transition-colors flex items-center justify-center gap-1">
            <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
