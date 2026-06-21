# FollowTrack

FollowTrack is a complete, production-ready SaaS web application for follower snapshot management. It provides private follower list storage, snapshot history tracking, side-by-side snapshot comparison (adding/removal tracking), global username search, settings management, and CSV/JSON exporting.

This platform **DOES NOT** crawl, scrape, or automate queries to Instagram or other third-party social networks. Users manually import follower username records by pasting text lists or uploading TXT/CSV files generated from account data backups.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, Edge Runtime)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & custom glassmorphism components
- **Database / Auth / Storage**: Supabase (PostgreSQL, SSR Cookies Auth, Storage Bucket)
- **Client State Querying**: TanStack React Query (React Query)
- **Validation**: Zod & custom parsers
- **Hosting Compatibility**: Cloudflare Pages (via `@cloudflare/next-on-pages`)

---

## Folder Structure

```text
├── supabase/
│   └── migrations/
│       └── 20260612000000_init_schema.sql  # SQL schema migrations, indexes, RLS
├── src/
│   ├── app/
│   │   ├── api/                            # API routes (if needed)
│   │   ├── dashboard/                      # Protected SaaS dashboards
│   │   ├── forgot-password/                # Auth reset password trigger
│   │   ├── login/                          # Auth login screen
│   │   ├── register/                       # Auth registration screen
│   │   ├── reset-password/                 # Auth credential update
│   │   ├── layout.tsx                      # Root page wrapper
│   │   ├── page.tsx                        # Public landing page
│   │   └── middleware.ts                   # Auth middleware session router
│   ├── components/
│   │   ├── ui/                             # Custom UI kit (button, card, dialog, toast)
│   │   ├── ActivityTimeline.tsx            # Activity timeline viewer
│   │   ├── CompareClient.tsx               # Compare screen client controls
│   │   ├── ComparisonDetailsClient.tsx     # Delta report visualizer & CSV/JSON exporter
│   │   ├── DashboardShell.tsx              # Shell sidebar layout container
│   │   ├── DashboardNavbar.tsx             # Responsive header dropdown
│   │   ├── DashboardSidebar.tsx            # Collapsible navigation drawer
│   │   ├── LandingFaq.tsx                  # Public Landing Page FAQ accordion
│   │   ├── providers.tsx                   # React Query & Toast notifications providers
│   │   ├── SearchClient.tsx                # Username lookup records visualizer
│   │   ├── SettingsClient.tsx              # Name edits, password changes, account wipe forms
│   │   └── SnapshotsClient.tsx             # File upload parser & list manager
│   ├── lib/
│   │   ├── supabase/                       # SSR cookies authentication configurations
│   │   ├── parser.ts                       # Username cleanup & validation engine
│   │   └── utils.ts                        # Class name merge utility
├── env.local.example                       # Environment variables template
├── wrangler.toml                           # Cloudflare Pages build configurations
└── README.md                               # Setup and deployment manual
```

---

## 1. Database & Migrations Setup

To initialize the PostgreSQL database, execute the schema code located in [supabase/migrations/20260612000000_init_schema.sql](file:///c:/Users/kitti/Desktop/ig/supabase/migrations/20260612000000_init_schema.sql) in your Supabase Dashboard **SQL Editor**:

1. Navigate to your Supabase Project Dashboard.
2. Select the **SQL Editor** tab from the left sidebar.
3. Click **New Query**, paste the contents of `20260612000000_init_schema.sql`, and click **Run**.
4. This registers:
   - Tables (`profiles`, `snapshots`, `followers`, `comparisons`, `comparison_added`, `comparison_removed`, `activity_logs`).
   - Optimizations indexes on `username`, `user_id`, and `created_at` fields.
   - Row Level Security (RLS) policies enforcing 100% database tenant isolation.
   - Database trigger to create profile entries automatically on new signup.

---

## 2. Supabase Storage Setup (For User Avatars)

You must configure a storage bucket for profile pictures to support user avatar uploads:

1. Open your Supabase Dashboard and go to **Storage**.
2. Click **New Bucket**.
3. Set the name to exactly `avatars`.
4. Make the bucket **Public** (or configure custom public policies) so that avatar photos are viewable.
5. Create an **RLS Policy** for the `avatars` bucket:
   - **SELECT**: Allow public access to all folders (`true`).
   - **INSERT/UPDATE**: Allow authenticated users to upload files to folders matching their user ID (e.g. `(role() = 'authenticated')` or `(auth.uid()::text = (storage.foldername(name))[1])`).

---

## 3. Local Development

1. Duplicate `env.local.example` and rename it to `.env.local`.
2. Populate the keys from your Supabase Project Settings (API tab):
   - `NEXT_PUBLIC_SUPABASE_URL`: API Endpoint.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client side key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role credential (used exclusively for account deletion server actions).
3. Run the development environment:
   ```bash
   npm install
   npm run dev
   ```
4. Access [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 4. Cloudflare Pages Deployment Guide

FollowTrack is fully optimized to run on Cloudflare Pages using Edge runtimes.

### Option A: Deployment via Git Repository (Recommended)
1. Push your codebase to a remote GitHub or GitLab repository.
2. Log in to your Cloudflare Dashboard and select **Workers & Pages**.
3. Click **Create Application** -> Select **Pages** -> Click **Connect to Git**.
4. Choose your repository and select the **Next.js** framework preset.
5. Configure the build parameters:
   - **Build Command**: `npx @cloudflare/next-on-pages` (or `npm run build` if you add next-on-pages build scripting).
   - **Build output directory**: `.vercel/output/static`
6. Add the following **Environment Variables** in Cloudflare Pages dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Under **Settings** -> **Functions** -> **Compatibility flags**, add:
   - `nodejs_compat` (for both Production and Preview stages).
8. Trigger deployment. Cloudflare Pages will compile and deploy your edge application automatically.

### Option B: Deployment via Wrangler CLI
Deploy directly from your CLI terminal using Wrangler:
1. Build the pages bundle:
   ```bash
   npx @cloudflare/next-on-pages
   ```
2. Deploy the static folder to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=followtrack
   ```
3. Set the corresponding environment variables and `nodejs_compat` flag in Cloudflare Dashboard.
