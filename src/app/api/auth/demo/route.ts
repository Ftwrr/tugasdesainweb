import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const email = 'demo@toplevelserver.com'
    const password = 'TLSDemoUser2026!'

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Demo login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
