import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmtjkwqfejknsboyjvxq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdGprd3FmZWprbnNib3lqdnhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQwODM0OCwiZXhwIjoyMTA2OTg0MzQ4fQ.V-ZUHvc5qFqp3F6VoIerR29iN20a75_phBkTEGck1zs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createDemoAccount() {
  const email = 'demo@toplevelserver.com';
  const password = 'TLSDemoUser2026!';

  console.log('Checking if demo user exists...');
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('List users error:', listError);
    return;
  }

  let demoUser = usersData.users.find(u => u.email === email);

  if (!demoUser) {
    console.log('Creating demo user...');
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: 'ftwr_commander',
        full_name: 'Fathur Commander',
        role: 'admin'
      }
    });

    if (createError) {
      console.error('Create error:', createError);
      return;
    }
    demoUser = created.user;
    console.log('Demo user created:', demoUser.id);
  } else {
    console.log('Demo user already exists:', demoUser.id);
  }

  // Check demo user rented servers, if none, create 2 realistic servers so dashboard has live active servers!
  const { data: existingServers } = await supabase
    .from('rented_servers')
    .select('id')
    .eq('user_id', demoUser.id);

  if (!existingServers || existingServers.length === 0) {
    console.log('Seeding demo servers for user...');
    const { data: plans } = await supabase.from('server_plans').select('*');
    const mcPlan = plans.find(p => p.slug === 'minecraft-paper') || plans[0];
    const csPlan = plans.find(p => p.slug === 'cs2-competitive') || plans[1];

    const { data: s1, error: err1 } = await supabase.from('rented_servers').insert({
      user_id: demoUser.id,
      plan_id: mcPlan.id,
      name: 'Nayeon Survival SMP #1',
      game_type: 'minecraft',
      status: 'running',
      ip_address: '103.187.144.22',
      port: 25565,
      region: 'Jakarta (ID)',
      vcpu: 4,
      ram_gb: 8,
      ssd_gb: 60,
      current_cpu_pct: 18.4,
      current_ram_pct: 62.1,
      current_disk_pct: 34.0,
      monthly_cost: 75000,
      auto_renew: true
    }).select().single();

    const { data: s2, error: err2 } = await supabase.from('rented_servers').insert({
      user_id: demoUser.id,
      plan_id: csPlan.id,
      name: 'TLS Jakarta Retake 128T',
      game_type: 'cs2',
      status: 'running',
      ip_address: '103.187.144.29',
      port: 27015,
      region: 'Singapore (SG)',
      vcpu: 4,
      ram_gb: 8,
      ssd_gb: 50,
      current_cpu_pct: 29.8,
      current_ram_pct: 44.5,
      current_disk_pct: 28.5,
      monthly_cost: 85000,
      auto_renew: true
    }).select().single();

    if (s1) {
      await supabase.from('server_logs').insert([
        { server_id: s1.id, message: '[12:00:01] [Server thread/INFO]: Starting minecraft server version 1.20.4' },
        { server_id: s1.id, message: '[12:00:03] [Server thread/INFO]: Loading properties and world chunks...' },
        { server_id: s1.id, message: '[12:00:06] [Server thread/INFO]: Preparing level "world"' },
        { server_id: s1.id, message: '[12:00:10] [Server thread/INFO]: [Purpur] Loaded 18 plugins (EssentialsX, LuckPerms, ViaVersion...)' },
        { server_id: s1.id, message: '[12:00:12] [Server thread/INFO]: Done (8.412s)! For help, type "help"' },
        { server_id: s1.id, message: '[12:05:22] [UserAuthenticator/INFO]: UUID of player Ftwr is b39c0942-89fd-4375-9f5e-bf3315694291' },
        { server_id: s1.id, message: '[12:05:23] [Server thread/INFO]: Ftwr[/180.252.12.88:51240] logged in with entity id 142 at (142.5, 68.0, -92.3)' },
        { server_id: s1.id, message: '[12:05:23] [Server thread/INFO]: Ftwr joined the game' }
      ]);

      await supabase.from('server_activities').insert([
        { server_id: s1.id, user_id: demoUser.id, action: 'DEPLOYED', details: { note: 'Server deployed automatically via TLS Cloud Engine' } },
        { server_id: s1.id, user_id: demoUser.id, action: 'START', details: { note: 'System boot finished in 8.4s' } }
      ]);
    }

    // Insert sample invoice
    await supabase.from('invoices').insert([
      {
        user_id: demoUser.id,
        server_id: s1?.id,
        invoice_number: 'INV-TLS-202610-001',
        description: 'Minecraft: Paper / Purpur (1 Month Rental - Jakarta Node)',
        amount: 75000,
        status: 'paid',
        payment_method: 'QRIS Instant'
      },
      {
        user_id: demoUser.id,
        server_id: s2?.id,
        invoice_number: 'INV-TLS-202610-002',
        description: 'Counter-Strike 2 (128 Tick) (1 Month Rental - Singapore Node)',
        amount: 85000,
        status: 'paid',
        payment_method: 'GoPay / BCA VA'
      }
    ]);

    console.log('Demo servers and data created successfully!');
  } else {
    console.log('Demo servers already present.');
  }
}

createDemoAccount();
