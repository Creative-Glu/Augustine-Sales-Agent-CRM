# Staff View — `/execution-dashboard/staff`

## Purpose

Browse, filter, and export all staff contacts extracted from Catholic institution websites and PDFs. This is the primary view for reviewing scraped contact data before syncing to HubSpot or exporting as CSV.

## Access

- **Route:** `/execution-dashboard/staff`
- **Who can access:** All authenticated users

## Page Sections

### 1. Enrichment Filter (top card)

Controls whether you see all raw records or only contacts that meet the enrichment quality target.

| Control | What it does |
|---------|-------------|
| **Enrichment toggle** (On/Off) | When On, only shows records with Name + Role + valid Email + Institution |
| **Require contact number** checkbox | Appears when enrichment is On. When checked, also requires a phone number |

Expand **"Enrichment target criteria"** to see the exact fields and confidence levels:

| Field | Required | Source |
|-------|----------|--------|
| Name | Yes | Scraped from team/leadership pages |
| Job title / Role | Yes | Scraped from page context |
| Email | Yes (must have `@` and domain) | Scraped from team/leadership pages |
| Phone | Optional (toggle) | Scraped where available |
| Institution | Yes (must be linked) | Linked to extracted institution |

### 2. Extracted Data Stats (second card)

Shows total staff count with email breakdown.

| Control | What it does |
|---------|-------------|
| **Last 24h / Overall** toggle | Switch between recent extractions and all-time totals |
| **With email** count | Staff records that have a valid email |
| **Without email** count | Staff records missing email |

These counts respect the enrichment filter — if enrichment is On, counts only show enriched records.

### 3. Filters Bar

All filters are **multi-select** and stored in the URL (shareable links).

| Filter | Type | Notes |
|--------|------|-------|
| **State** | Multi-select dropdown | Select one or more US states. Uses domain matching: websites_url → institutions → staff |
| **Parish Role** | Multi-select dropdown | Select one or more PAR roles (e.g. Pastor, Deacon). Only shows roles from the roles master list |
| **From date** | Date picker | Staff created on or after this date |
| **To date** | Date picker | Staff created on or before this date |
| **Eligible** | Single select (All/Yes/No) | Filter by `is_eligible` flag |
| **Reset** button | — | Clears all filters at once |

**How state filtering works internally:**
1. Selected states are resolved to website domains via the `websites_url` table
2. Domains are matched to institution IDs
3. Staff are filtered by `institution_id IN (matched IDs)`
4. Results are cached for 5 minutes per state — selecting additional states only resolves the new ones

### 4. Staff Table

| Column | Content |
|--------|---------|
| **Staff** | Name + raw job title |
| **Parish Role** | Standardized PAR role badge (from role mapping) |
| **Contact** | Email (clickable mailto link) + contact number |
| **Institution** | Clickable link → opens institution detail modal |
| **Status** | Sync badge + Queue badge + "View sync pipeline" expandable panel |
| **Created** | Date/time the record was extracted |

**Table features:**
- Loading overlay appears during filter/pagination changes
- Per-page selector: 10 / 25 / 50 rows
- Refresh button to force reload
- Pagination at the bottom

### 5. CSV Export

Click **Export CSV** (or **Export enriched CSV** when enrichment filter is on).

| Behavior | Detail |
|----------|--------|
| **Backend-generated** | CSV is built by the backend API, not in the browser |
| **Respects filters** | Date range, state, eligibility, and PAR role filters are passed to the backend |
| **Download** | Browser downloads the file automatically |
| **Format** | HubSpot-compatible: Record ID, First/Last Name, Job Title, PAR Role, Email, Phone, Company, Address, City, State, Postal Code |

### 6. Institution Detail Modal

Clicking an institution name in the table opens a modal showing:
- Institution name, website, type, address, email, contact
- HubSpot link (if synced) with "Open in HubSpot" button
- Sync pipeline status (enrichment → eligibility → HubSpot sync)
- Staff list for that institution with individual sync controls (Admin only)

## URL Parameters

All state is in the URL — copy/paste to share a filtered view.

| Param | Example | Purpose |
|-------|---------|---------|
| `state` | `state=California,Texas` | Multi-state filter (comma-separated) |
| `par_role` | `par_role=Pastor,Deacon` | Multi-role filter (comma-separated) |
| `staff_date_from` | `staff_date_from=2024-01-01` | Start date |
| `staff_date_to` | `staff_date_to=2024-12-31` | End date |
| `is_eligible` | `is_eligible=1` | 1=Yes, 0=No |
| `enriched` | `enriched=1` | 1=enrichment filter on |
| `phone` | `phone=0` | 0=phone not required |
| `offset` | `offset=25` | Pagination offset |
| `limit` | `limit=50` | Rows per page |

## Key Files

```
src/app/(main)/execution-dashboard/_components/
├── ExecutionStaffPage.tsx     # Main staff view (enrichment card, stats, filters, table, export)
├── ExecutionFilters.tsx        # StaffFilters component (multi-select state/role, dates, eligible)
├── StaffTable.tsx              # Table rendering with sync badges and institution links
└── InstitutionStaffModal.tsx   # Institution detail + staff list modal

src/services/execution/
├── staff.service.ts            # getStaffPaginated, exportStaffCsv, resolveInstitutionIdsForStates
└── useExecutionData.ts         # useStaffPaginated hook (React Query + state resolution)

src/constants/
├── execution.ts                # STAFF_TABLE_COLUMNS, ENRICHMENT_CRITERIA
└── pagination.ts               # DEFAULT_PAGE_SIZE, EXPORT_MAX_ROWS
```
