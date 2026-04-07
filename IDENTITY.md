# Augustine CRM — Identity

## Project

| Field | Value |
|-------|-------|
| **Name** | Augustine Sales Agent CRM |
| **Type** | Internal B2B lead management platform |
| **Client** | Augustine Institute |
| **Organization** | Creative Glu |
| **Status** | Production |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Components | Radix UI + shadcn/ui |
| State | React Query (TanStack Query 5) |
| Auth | Custom JWT (Bearer token) + cookie-based proxy |
| Database | Supabase (3 instances: CRM, Execution, File Upload) |
| CRM Sync | HubSpot (two-way via sync queue) |
| Icons | Heroicons + Lucide React |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

## Environments

| Env | URL | Notes |
|-----|-----|-------|
| Development | `http://localhost:3000` | Requires `.env` with all Supabase + API keys |
| Backend API | Configured via `NEXT_PUBLIC_API_URL` | Handles auth, jobs, outreach, HubSpot sync |

## Key Modules

| Module | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/dashboard` | KPI overview |
| Execution | `/execution-dashboard` | Scraping pipeline monitoring (7 sub-views) |
| Dry Run Tool | `/csv-merge` | Preview HubSpot import before committing |
| Outreach | `/outreach` | AI-generated email approval workflow |
| Campaigns | `/campaigns` | Marketing campaign management |
| Contacts | `/contacts` | Parish/institution contact CRUD |
| Roles | `/roles` | PAR role definitions + job title mappings |
| Scrape Jobs | `/marketing-jobs` | Submit URLs for scraping, track progress |
| Users | `/admin-users` | User management (Admin only) |

## Running Locally

```bash
cp .env.template .env
npm install
npm run dev         # http://localhost:3000
npm run test        # 75 tests
npm run lint        # ESLint
npm run build       # production build
```

## Repository Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Login page
│   │   ├── (main)/       # All authenticated pages
│   │   └── api/          # API route handlers (proxy to backend)
│   ├── components/       # Shared UI components
│   ├── constants/        # All static data (columns, options, config)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # API client, Supabase clients, utilities
│   ├── providers/        # Auth + Query providers
│   ├── services/         # Data fetching layer (Supabase + API)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Formatting, URL sanitization, helpers
│   ├── validations/      # Yup form schemas
│   └── __tests__/        # Vitest test suites
├── docs/                 # Feature documentation & ADRs
├── SOUL.md               # Project principles & architecture
├── IDENTITY.md           # Project identity & tech stack
├── AGENTS.md             # Agent permission boundaries
└── RETENTION.md          # Data retention policy
```
