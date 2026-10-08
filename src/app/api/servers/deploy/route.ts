import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { planSlug, serverName, region } = body

    if (!planSlug || !serverName) {
      return NextResponse.json(
        { error: 'Plan and Server Name are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Fetch plan details
    const { data: plan, error: planError } = await admin
      .from('server_plans')
      .select('*')
      .eq('slug', planSlug)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check profile balance
    const { data: profile } = await admin
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    const currentBalance = profile?.balance || 0

    // Deduct balance if sufficient, or proceed
    const newBalance = Math.max(0, currentBalance - plan.price_monthly)
    await admin
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id)

    // Generate IP based on region
    const randomHost = Math.floor(Math.random() * 200) + 20
    const ipPrefix = region?.includes('Singapore')
      ? '139.180.198.'
      : region?.includes('Tokyo')
      ? '108.61.201.'
      : '103.187.144.'
    const ipAddress = `${ipPrefix}${randomHost}`

    const basePort =
      plan.game_type === 'minecraft'
        ? 25565
        : plan.game_type === 'cs2'
        ? 27015
        : plan.game_type === 'palworld'
        ? 8211
        : plan.game_type === 'rust'
        ? 28015
        : 7777

    const randomPortOffset = Math.floor(Math.random() * 20)
    const port = basePort + randomPortOffset

    // Create rented server
    const { data: newServer, error: createError } = await admin
      .from('rented_servers')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        name: serverName,
        game_type: plan.game_type,
        status: 'running',
        ip_address: ipAddress,
        port: port,
        region: region || 'Jakarta (ID)',
        vcpu: plan.vcpu,
        ram_gb: plan.ram_gb,
        ssd_gb: plan.ssd_gb,
        current_cpu_pct: 14.2,
        current_ram_pct: 48.0,
        current_disk_pct: 25.0,
        monthly_cost: plan.price_monthly,
        auto_renew: true,
      })
      .select()
      .single()

    if (createError || !newServer) {
      return NextResponse.json({ error: createError?.message || 'Failed to create server' }, { status: 500 })
    }

    // Generate Invoice
    const invoiceNumber = `INV-TLS-${Date.now().toString().slice(-8)}`
    await admin.from('invoices').insert({
      user_id: user.id,
      server_id: newServer.id,
      invoice_number: invoiceNumber,
      description: `${plan.name} (1 Month Rental - ${region || 'Jakarta (ID)'})`,
      amount: plan.price_monthly,
      status: 'paid',
      payment_method: 'Wallet Balance / Instant Provision',
    })

    // Seed initial startup logs
    const nowTime = new Date().toLocaleTimeString()
    await admin.from('server_logs').insert([
      { server_id: newServer.id, message: `[${nowTime}] [Provisioning] Initializing KVM Virtual Container on node ${region}...` },
      { server_id: newServer.id, message: `[${nowTime}] [Network] Allocated Dedicated IP ${ipAddress}:${port}` },
      { server_id: newServer.id, message: `[${nowTime}] [Storage] Formatting NVMe Gen4 volume (${plan.ssd_gb}GB ext4)` },
      { server_id: newServer.id, message: `[${nowTime}] [Daemon] Installing ${plan.name} server binaries...` },
      { server_id: newServer.id, message: `[${nowTime}] [Daemon] Starting server process (PID 4192)` },
      { server_id: newServer.id, message: `[${nowTime}] [Server/INFO] Server is online and ready for incoming player connections!` },
    ])

    // Log Activity
    await admin.from('server_activities').insert({
      server_id: newServer.id,
      user_id: user.id,
      action: 'DEPLOYED',
      details: {
        plan: plan.name,
        ip: `${ipAddress}:${port}`,
        region: region || 'Jakarta (ID)',
      },
    })

    return NextResponse.json({
      success: true,
      server: newServer,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
