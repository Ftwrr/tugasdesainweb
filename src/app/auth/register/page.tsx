'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.session) {
        setSuccessMsg('Account registered! Redirecting...')
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccessMsg('Registration successful! Please check your email or proceed to sign in.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100 bg-grid-pattern relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="card w-full max-w-md bg-base-200/95 border border-base-content/10 shadow-2xl backdrop-blur-md p-6 sm:p-8 relative z-10">
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
            Create TLS Account
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            Get instant access to game server deployment &amp; management.
          </p>
        </div>

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

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Fathur Rachman"
              className="input input-bordered input-sm w-full bg-base-300/80 text-xs"
            />
          </div>

          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ftwr_player"
              className="input input-bordered input-sm w-full bg-base-300/80 text-xs font-mono"
            />
          </div>

          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="input input-bordered input-sm w-full bg-base-300/80 text-xs"
            />
          </div>

          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="input input-bordered input-sm w-full bg-base-300/80 text-xs"
            />
          </div>

          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="input input-bordered input-sm w-full bg-base-300/80 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold border-none shadow-lg shadow-cyan-500/20 mt-4"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-base-content/60">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
            Sign In
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
