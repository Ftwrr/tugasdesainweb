export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  balance: number
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface ServerPlan {
  id: string
  name: string
  slug: string
  game_type: string
  category: string
  badge: string | null
  vcpu: number
  ram_gb: number
  ssd_gb: number
  bandwidth_tb: number
  price_hourly: number
  price_monthly: number
  icon: string
  description: string | null
  features: string[]
  is_available: boolean
  created_at: string
}

export type ServerStatus = 'running' | 'stopped' | 'starting' | 'restarting' | 'suspended'

export interface RentedServer {
  id: string
  user_id: string
  plan_id: string | null
  name: string
  game_type: string
  status: ServerStatus
  ip_address: string
  port: number
  region: string
  vcpu: number
  ram_gb: number
  ssd_gb: number
  current_cpu_pct: number
  current_ram_pct: number
  current_disk_pct: number
  auto_renew: boolean
  monthly_cost: number
  expires_at: string
  created_at: string
  updated_at: string
  plan?: ServerPlan | null
}

export interface ServerLog {
  id: string
  server_id: string
  log_type: 'stdout' | 'stderr' | 'system' | 'player'
  message: string
  created_at: string
}

export interface ServerActivity {
  id: string
  server_id: string
  user_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  server_id: string | null
  invoice_number: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled' | 'refunded'
  payment_method: string
  paid_at: string
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  title: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  message: string
  created_at: string
}
