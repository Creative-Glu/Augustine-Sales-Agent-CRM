# Execution Dashboard — `/execution-dashboard`

## Purpose

Central hub for monitoring the data extraction pipeline: scraping jobs, extracted institutions/staff, website URLs, and HubSpot sync status.

## Access

- **Route:** `/execution-dashboard` (overview) + `/execution-dashboard/{view}` (sub-views)
- **Who can access:** All authenticated users. HubSpot sync controls are **Admin only**.

## Views

### Overview (`/execution-dashboard`)

KPI dashboard showing:
- Job counts (pending, running, completed, failed)
- Institution and staff totals
- Sync pipeline progress (eligible → synced → failed)
- Recent jobs table
- Recent failed results table
- "Needs attention" alert when failures exist

### Institution (`/execution-dashboard/institution`)

Paginated table of all extracted institutions.

| Feature | Details |
|---------|---------|
| **Filters** | Eligible (yes/no), Synced to HubSpot (yes/no), Sync status, Confidence range |
| **Stats** | Total count with email/without email breakdown (24h or overall toggle) |
| **Click row** | Opens modal with institution details + staff list |
| **Sync pipeline** | Click "View sync pipeline" on any row to see enrichment → eligibility → sync status |

### Staff (`/execution-dashboard/staff`)

Paginated table of all extracted staff/contacts.

| Feature | Details |
|---------|---------|
| **Enrichment filter** | Toggle to show only staff meeting enrichment criteria (name + role + email + institution, optionally phone) |
| **Multi-select filters** | State (multiple), Parish Role (multiple), Date range, Eligible |
| **Export CSV** | Downloads CSV via backend — respects current filters |
| **Per page** | 10 / 25 / 50 rows |
| **Institution link** | Click institution name → opens institution detail modal |

**Enrichment Criteria:**

| Field | Confidence | Source |
|-------|-----------|--------|
| Name | High | Scraped from team/leadership pages |
| Job title / Role | High | Scraped from page context |
| Email | High | Must contain `@` and domain |
| Phone | Medium | Optional (toggle "Require contact number") |
| Institution | High | Linked to extracted institution |

### Websites (`/execution-dashboard/websites`)

Table of all website URLs in the system.

| Feature | Details |
|---------|---------|
| **Filters** | Status (Missing URL, Processing, Pending, Success, Failed), Company name search |
| **Columns** | Company name, Domain, Website URL, Address, Phone, City, State, Status |

### Jobs (`/execution-dashboard/jobs`)

Table of all batch scraping/extraction jobs.

| Feature | Details |
|---------|---------|
| **Filter** | Status (pending, running, completed, failed) |
| **Columns** | Status badge, URL count, Submitted/Started/Completed times, Execution duration, Error |

### Results (`/execution-dashboard/results`)

Per-URL extraction results.

| Feature | Details |
|---------|---------|
| **Filters** | Status (success/error), Source (pdf/web/error) |
| **Columns** | URL, Source, Status, Processed time, Error details |

### Sync Queue (`/execution-dashboard/sync-queue`)

HubSpot sync queue monitoring and management.

| Feature | Details |
|---------|---------|
| **Metrics cards** | Total, Pending, Processing, Failed, Success, Avg Attempts, Oldest Pending |
| **Filters** | Status, Entity type (institution/staff) |
| **Retry** | Click "Retry" on failed jobs to requeue |
| **HubSpot sync toggle** | Admin only — enable/disable sync globally |
| **Batch sync** | Admin only — trigger manual batch sync with entity type and limit |

## Shared Behaviors

- **Pagination** — All table views support offset-based pagination via URL params (`?offset=0&limit=25`)
- **URL-driven state** — All filters are stored in the URL query string, so links are shareable and bookmarkable
- **Loading overlay** — Tables show a blur overlay while fetching new data after filter changes
- **Stale time** — Data caches for 2 minutes. Click "Refresh" to force reload.

## Key Files

```
src/app/(main)/execution-dashboard/
├── page.tsx                          # Overview route
├── [view]/page.tsx                   # Dynamic sub-view router
├── layout.tsx                        # Shared layout
└── _components/
    ├── ExecutionKpiDashboard.tsx      # Overview KPI cards
    ├── ExecutionInstitutionPage.tsx   # Institution view
    ├── ExecutionStaffPage.tsx         # Staff view
    ├── ExecutionWebsitesPage.tsx      # Websites view
    ├── ExecutionJobsPage.tsx          # Jobs view
    ├── ExecutionResultsPage.tsx       # Results view
    ├── ExecutionSyncQueuePage.tsx     # Sync queue view
    ├── ExecutionFilters.tsx           # All filter bar components
    ├── StaffTable.tsx                 # Staff table renderer
    ├── InstitutionTable.tsx           # Institution table renderer
    ├── InstitutionStaffModal.tsx      # Institution detail modal
    └── ExecutionStatusPipelinePanel.tsx # Sync pipeline popover
```
