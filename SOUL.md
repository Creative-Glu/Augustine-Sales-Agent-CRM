# Augustine CRM — Project Soul

## What This Project Is

Augustine CRM is an internal sales and lead management platform built for the Augustine Institute. It automates the pipeline from data extraction (scraping Catholic institution websites/PDFs) through enrichment, HubSpot synchronization, and outreach campaign management.

## Core Principles

1. **Data integrity first** — HubSpot data is never overwritten. CRM data fills blanks, never replaces.
2. **Transparency** — Every merge, sync, and export operation shows the user exactly what will change before it happens (dry run tool).
3. **Deterministic exports** — CSV output is sorted by priority (new → updated → existing) and every cell is quoted to prevent column misalignment.
4. **Server-side protection** — Auth is enforced at the proxy/middleware layer, not just client-side redirects.

## Architecture Decisions

- **Next.js App Router** with file-based routing and server components where possible
- **Three Supabase databases** — Main CRM, Execution (scraping pipeline), File uploads
- **React Query** for all server state — no Redux, no global stores for API data
- **URL-driven filters** — all filter/pagination state lives in URL search params so views are shareable and bookmarkable
- **Constants over magic values** — all column definitions, status options, and config live in `src/constants/`

## Who Uses This

- **Sales team** — reviews enriched contacts, manages campaigns and outreach
- **Data team** — monitors scraping jobs, reviews extraction quality, manages HubSpot sync
- **Admins** — manages users, roles, role mappings, and sync configuration
