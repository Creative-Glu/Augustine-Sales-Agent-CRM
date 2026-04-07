# Role Mapping — `/roles`

## Purpose

Manages the standardized **Parish Administrative Roles (PAR)** used across the CRM. This page has two sections:

1. **Roles** — the master list of valid parish roles (e.g. Pastor, Deacon, Director of Religious Education)
2. **Role Mappings** — rules that automatically map raw scraped job titles to the correct parish role

## Access

- **Route:** `/roles`
- **Who can access:** All authenticated users can view. Only **Admin** users should create/edit/delete.

## Section A — Parish Roles

| Action | How |
|--------|-----|
| **Create** | Fill in Name + Slug in the form at top, click **New Role** |
| **Edit** | Click the pencil icon on any role row → form populates → save |
| **Delete** | Click trash icon → confirm in dialog |
| **Search** | Type in the search box above the table — filters by name |

**Fields:**
- **Name** — Human-readable role name (e.g. "Youth Ministry")
- **Slug** — Machine-friendly identifier (e.g. "youth-ministry"). Must be unique.

## Section B — Role Mappings

Maps raw job titles (scraped from websites/PDFs) to standardized parish roles.

| Action | How |
|--------|-----|
| **Create** | Select a job title (or type custom), select target parish role, click **New Mapping** |
| **Edit** | Click pencil icon on any mapping row |
| **Delete** | Click trash icon → confirm |
| **Apply All** | Click **Apply Mappings** button → runs all mapping rules against the staff database, updating `par_role` on matching records |

**Job Title Source:**
- Dropdown shows existing job titles found in the staff database
- Toggle to "Custom" mode to type a free-text job title

## How It Works End-to-End

1. Scraping jobs extract staff with raw job titles like "Dir. of Religious Ed"
2. A role mapping rule maps "Dir. of Religious Ed" → "Director of Religious Education"
3. Clicking **Apply Mappings** updates all matching staff records in the execution database
4. The standardized `par_role` field is then used in staff filters and CSV exports

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/roles` | GET | List all roles |
| `/api/roles` | POST | Create role |
| `/api/roles/{id}` | PUT | Update role |
| `/api/roles/{id}` | DELETE | Delete role |
| `/api/role-mappings` | GET | List mappings |
| `/api/role-mappings` | POST | Create mapping |
| `/api/role-mappings/{id}` | PUT | Update mapping |
| `/api/role-mappings/{id}` | DELETE | Delete mapping |
| `/api/role-mappings/apply` | POST | Apply all mappings to staff DB |
| `/api/role-mappings/job-titles` | GET | List distinct job titles from staff |
