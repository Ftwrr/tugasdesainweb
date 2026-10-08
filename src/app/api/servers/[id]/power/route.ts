import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action } = body

    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be start, stop, or restart' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: server, error: serverError } = await supabase
      .from('rented_servers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (serverError || !server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    const targetStatus = action === 'start' ? 'running' : action === 'stop' ? 'stopped' : 'running'

    // Update using admin or client
    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from('rented_servers')
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
        current_cpu_pct: action === 'stop' ? 0 : 22.4,
        current_ram_pct: action === 'stop' ? 0 : 54.8,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Insert activity log
    await admin.from('server_activities').insert({
      server_id: id,
      user_id: user.id,
      action: action.toUpperCase(),
      details: {
        timestamp: new Date().toISOString(),
        ip: server.ip_address,
        note: `Power state changed to ${targetStatus} via Web Control Panel`,
      },
    })

    // Insert server log line
    const nowTime = new Date().toLocaleTimeString()
    await admin.from('server_logs').insert({
      server_id: id,
      message: `[${nowTime}] [TLS Host Daemon] Power action received: ${action.toUpperCase()} -> State: ${targetStatus.toUpperCase()}`,
    })

    return NextResponse.json({
      success: true,
      action,
      status: targetStatus,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
