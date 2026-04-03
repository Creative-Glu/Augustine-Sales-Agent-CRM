# Dry Run Tool (CSV Merge) — `/csv-merge`

## Purpose

Preview and validate a HubSpot import **before** making changes. Compares your CRM export against the current HubSpot export, shows exactly what will change, and produces a ready-to-import CSV.

## Access

- **Route:** `/csv-merge`
- **Who can access:** All authenticated users

## Workflow

### Step 1 — Upload Files

Upload two CSV files by drag-and-drop or file browser:

| Slot | File | Description |
|------|------|-------------|
| **HubSpot File** | Your current HubSpot contacts export | These contacts are treated as the source of truth — their data is never overwritten |
| **CRM File** | The Augustine CRM enriched export | New contacts and enriched data from the scraping pipeline |

### Step 2 — Preview Changes

Click **Preview Changes**. The tool analyzes both files and shows:

**Summary Dashboard:**
- HubSpot contact count vs CRM contact count
- How many matched (same person in both) vs new people
- What will happen: added / updated / unchanged

**How matching works:**
1. **Email match** — if the same email exists in both files
2. **Name + Institution match** — if first name + last name + company match (fallback when no email)

### Step 3 — Filter & Sort

After preview, a **filter toolbar** appears:

| Filter | Color | What it shows |
|--------|-------|---------------|
| **New Scraped** | Amber | Contacts only in CRM — will be added to HubSpot |
| **Updated** | Green | Matched contacts where blank HubSpot fields get filled from CRM |
| **Matched - No Changes** | Indigo | Found in both files, HubSpot already has all info |
| **HubSpot Only** | Blue | Contacts only in HubSpot, not in CRM data |

All filters are **on by default** (Show All). Toggle any filter off to hide those records.

**Sort options:**
- Record Group Priority (default: new → updated → existing)
- Company A → Z / Z → A
- Has Email First / Missing Email First

### Step 4 — Review Details

Below the data table, two detail sections show:

1. **Contacts getting missing info filled** — expandable rows showing field-by-field before → after changes
2. **Contacts already complete** — matched contacts with nothing to change

### Step 5 — Download

Click **Download Ready-to-Import File** (or **Export Filtered** if filters are active).

- The downloaded CSV contains only the filtered/sorted rows
- Sorted in priority order: new contacts first, then updated, then unchanged
- Every field is quoted to prevent column misalignment in Excel
- A `Record Group` column is included so you can further filter in Excel

## Merge Rules

| Scenario | What happens |
|----------|-------------|
| Contact only in CRM | Added as new row (`Record Group = new_scraped`) |
| Contact in both, HubSpot has blank fields | Blanks filled from CRM, existing data kept (`Record Group = updated`) |
| Contact in both, data differs | HubSpot data wins — CRM data is ignored |
| Contact only in HubSpot | Kept as-is (`Record Group = existing_hubspot`) |

## Output CSV Columns

| Column | Description |
|--------|-------------|
| Record ID - Contact | HubSpot contact ID (empty for new) |
| First Name | |
| Last Name | |
| Job Title | Cleaned and standardized |
| PAR - Role | Mapped parish role |
| Email | Validated format |
| Phone Number | |
| Record ID - Company | HubSpot company ID |
| Company name | Formatted as "Name - ST - ZIP" |
| Street Address | |
| City | |
| State - Dropdown (COMPANY) | Full state name |
| Postal Code | |
| Record Group | `new_scraped` / `updated` / `existing_hubspot` |

## Key Files

```
src/app/(main)/csv-merge/
├── page.tsx                          # Route wrapper
└── _components/
    └── CsvMergePage.tsx              # Full page component

src/lib/csv-merge.ts                  # Core merge logic (parseCsv, mergeCsvs, mergedRowsToCsv)
src/constants/csvMerge.ts             # Filter config, sort options
```
