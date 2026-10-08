# TLS Host — Top Level Server Hosting

> Production-ready, ultra-low-latency game & cloud server rental platform built with Next.js 16 (App Router), Tailwind CSS v4, DaisyUI 5, Iconify, and Supabase.

Live Production URL: [https://nayeony.my.id](https://nayeony.my.id)

---

## 🚀 Features

- **Next.js 16 App Router & React 19**: Modern full-stack architecture with Server and Client Components.
- **DaisyUI 5 + Tailwind CSS v4**: High-contrast, glowing cyberpunk theme (`data-theme="night"`) with uniform and accessible UI components.
- **Iconify Integration**: Unified icon system powered by `@iconify/react` and Lucide icons.
- **Supabase PostgreSQL & Auth**:
  - Full schema for user profiles, server plans, rented instances, activities, logs, invoices, and support tickets.
  - Granular Row-Level Security (RLS) policies protecting all data layers.
  - Automated user profile creation trigger.
- **Interactive Server Management Dashboard**:
  - Real-time power state controls (Start, Stop, Restart) with optimistic UI updates.
  - Interactive live RCON web terminal console with command execution (`status`, `players`, `say`, `backup`).
  - Real-time CPU, RAM, and Disk metrics.
  - Multi-tier server provisioning wizard (Minecraft, CS2, Palworld, Rust, Valheim, VPS).
  - Billing center with automated invoice generation, receipt viewer, and instant QRIS balance top-up simulation.
  - 24/7 customer support ticketing system.
- **Live Datacenter Latency Tool**: Real-time ping tester evaluating latency to edge POPs in Jakarta, Singapore, Tokyo, and Sydney.
- **Instant Demo Mode**: 1-Click demo authentication preloaded with active servers, live logs, and wallet balance.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI 5
- **Icons**: `@iconify/react` (Lucide Icons)
- **Database & Auth**: Supabase (PostgreSQL, SSR auth with `@supabase/ssr`)
- **Hosting / Deployment**: Netlify / Cloudflare Edge DNS (`nayeony.my.id`)

---

## 📦 Project Structure

```
toplevelserver/
├── scripts/
│   ├── setup-db.mjs       # Database schema initialization & RLS setup
│   └── seed-demo.mjs      # Demo account & sample server data seed
├── src/
│   ├── app/
│   │   ├── api/           # Power controls, deploy, and demo auth APIs
│   │   ├── auth/          # Login & registration views
│   │   ├── dashboard/     # Control panel, server details, billing, support
│   │   ├── globals.css    # DaisyUI 5 & Tailwind CSS styling
│   │   └── page.tsx       # Production landing page
│   ├── components/        # Reusable UI (Navbar, Footer, Console, Cards, Badges)
│   ├── lib/supabase/      # Browser, server, and admin Supabase clients
│   └── types/             # Database and entity type definitions
├── netlify.toml           # Netlify Next.js adapter configuration
└── package.json
```

---

## 🔑 Quick Start

### 1. Prerequisites
- Node.js 20+
- Supabase Project URL & Keys

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://nayeony.my.id
```

### 4. Initialize Database
Run the setup and seed scripts:
```bash
node scripts/setup-db.mjs
node scripts/seed-demo.mjs
```

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Demo Credentials

For testing without creating a new email account:
- **Email**: `demo@toplevelserver.com`
- **Password**: `TLSDemoUser2026!`
- Or simply click **"1-Click Demo Login"** on the login page.
