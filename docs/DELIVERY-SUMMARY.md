# Augustine CRM — Delivery Summary

**Status:** Ready for sales-team usage
**Audience:** Client stakeholders, project sponsors, sales operations leads
**Last updated:** 2026-05-21

---

## Overview

This document summarises the current state of the Augustine CRM delivery: which modules are live, how the pipeline flows end-to-end, what's been verified working, and what we need from the client to flip the remaining switches before launch.

The CRM now functions as a **real-time sales operations platform** — the outreach agent (n8n), the Supabase data layer, and the React UI are fully synchronised. Sales reps see the funnel evolve as it happens, and manual interventions (Mark Won, Mark Lost, status changes, deletes) flow back to the dashboard within a second.

---

## What's now live

### 🧭 Lead Journey — fully wired pipeline

- **Campaign-grouped journey view** — every journey is shown under its parent campaign in an accordion layout instead of a flat list, making it easy to see "what's happening inside this campaign" at a glance.
- **Full journey detail modal** with two tabs:
  - **Details** — funnel-stage badge, IDs, timestamps, lead attributes grouped (Contact / Classification / Location / Operations), campaign metadata, instructions, notes.
  - **Activity Logs** — live, time-ordered timeline of every event on the journey (emails sent, clicks, status changes, manual closures).
- **Manual outcome marking** — sales reps can flip a journey to **Closed-Won** or **Closed-Lost** from the detail modal:
  - Confirmation dialog with the journey name highlighted.
  - **Closed-Lost requires a reason** (Budget, Timing, Not a fit, Went with competitor, No response, Other).
  - **Closed-Won** captures an optional context note.
  - Every closure writes a descriptive entry to the activity timeline automatically.
  - Already-closed journeys show a locked notice so the action can't be triggered twice.
- **Funnel analytics** — KPI tiles, donut, stage histogram, and a horizontal **Stages by Campaign** chart that handles 20+ campaigns without text collisions.
- **Filters** — search, stage, campaign, institution type, date range; all driven by URL query params so views are bookmarkable.

### 📡 Real-time pipeline updates

The entire system updates in real time across browsers and across users — no manual refresh needed:

- **Journey table** auto-updates when the agent (or anyone) writes to `journeys` in Supabase.
- **Campaign list** auto-updates when statuses flip.
- **Activity Logs** stream into the modal as the agent writes them.
- **Dashboard KPI tiles + funnel** reflect new totals within ~1 second of any DB change.
- **Meetings page** polls Calendly every 30s and refreshes on tab focus.

Wired through Supabase realtime channels on the `journeys`, `campaigns`, and `logs` tables. As soon as n8n drops an outreach email and writes back to Supabase, the journey row in the CRM reflects the new `funnel_stage` without anyone clicking refresh.

### 📨 Outreach automation — agent ↔ CRM link

The n8n outreach agent and the CRM are fully synchronised:

| Pipeline event | What happens in the CRM |
|---|---|
| Lead added to a running campaign | New journey row appears with `funnel_stage = Unknown / Waiting` |
| First intro email sent by agent | Stage flips to **Outreached**; campaign status flips to **Running** automatically |
| Lead replies with positive intent | Agent moves stage to **Engaged**; reply text stored as activity log entry |
| Stronger buying signals (budget, timeline, decision-maker mentions) | Agent advances to **MQL / SAL / SQL** based on classification |
| Lead clicks the Calendly link in the email | Stage auto-advances to **SAL**; activity log captures "Lead clicked booking link" |
| Lead books a slot on Calendly | Booking appears in the Meetings page within ~30 seconds (instant when webhook integration is wired) |
| Sales rep manually confirms outcome | Mark Won / Mark Lost button in journey modal — stage flips, log entry written, dashboard updates everywhere |

### 📅 Meetings page — Calendly integration live

A new **Meetings** section under **Others** in the sidebar:

- Pulls scheduled events directly from the Calendly API (server-side proxy keeps the token private).
- Date-grouped list with **TODAY** pill.
- **Upcoming / Past tabs** for quick filtering.
- **Date Range picker** with presets (Today, This week, Next 7 days, Last 30 days, This month, custom range) — all filtering happens **on Calendly's side** via `min_start_time` / `max_start_time`, not client-side.
- Per-row **Join button** (emerald pill) opens the meeting URL directly in a new tab.
- Click any row → details modal with invitee info, host count, join link, source metadata.
- Auto-refresh every 30 seconds while open.
- CSV export of the current view.
- "Open Calendly" shortcut in the toolbar for managing event types / availability.

### 📊 Dashboard

- **Per-card colour themes** — Products (blue), Journeys (emerald), ICPs (amber), Campaigns (violet) — each card is a clickable shortcut into that module.
- **Animated counters** roll smoothly from old → new values.
- **Trend indicators** showing "+/-N% vs prev 7d" on relevant tiles.
- **Journey Funnel** rebuilt:
  - Colour-coded stage tiles with share-progress bars.
  - Adjacent-stage conversion rates auto-coloured by health (green / amber / rose).
  - Summary footer for Overall conversion / Win rate / Disqualified.

### 🎨 Module-wide UI polish

- **Server-side pagination** across Campaigns, Products, Offers, ICPs, Contacts, Journeys — only the current page is fetched, no client-side limit issues at scale.
- **Dense tables** with date + time on every "Created" column.
- **Colour-coded slot system** for offers (Slot 1 = Primary, Slot 2 = Upsell, Slot 3 = Cross-sell) consistent across product, offer, campaign, and journey modals.
- **Detail modals** for every record type, each surfacing related data (ICP modal shows linked offers + matching contacts; Product modal shows offers bundling it; Campaign modal shows linked offer with slot products).
- **Action button palette standardised** — blue View, amber Edit, green Activity, red Delete — consistent across every list.
- **Loading / error / empty states** branded everywhere (skeleton rows during fetch, retry button on errors, friendly empty-state copy).
- **Hard-delete confirmation** (type DELETE) for cascade operations like deleting a campaign with all its journeys.

### 🔐 Login + brand polish

- 2-column login layout with rotating brand messaging on the left and a clean sign-in form on the right.
- Build version + region + status badges.
- Friendly inline hints under each input.

### 🌙 Other polish features

- **Dark mode toggle** (top-right on Others routes) — applies app-wide once enabled, persists across reloads.
- **Sidebar collapsible state** persists per user via localStorage.
- **Hover preview cards** on parish names in journey rows.
- **Focus rings** for keyboard navigation (accessibility).
- **Smooth fade-out** on row deletes.

---

## What's working end-to-end (verified)

- ✅ Lead enters campaign → outreach email sent → journey marked Outreached (real-time)
- ✅ Lead replies → agent classifies and advances stage (real-time)
- ✅ Lead clicks Calendly → journey jumps to SAL + log entry (real-time)
- ✅ Sales rep marks Won/Lost → status flips + log written + dashboard recalcs (real-time)
- ✅ Booking made on Calendly → appears in Meetings page within 30s polling cycle
- ✅ Realtime journey updates propagate across multiple open browser tabs
- ✅ All counts (KPI tiles, funnel, campaign accordion) reconcile against the database
- ✅ Pagination works under load — only fetches the current page
- ✅ Cascade delete chain (logs → journeys → campaigns) handled with proper FK semantics

---

## Action items — client side

These are the remaining client-side decisions and credentials we need to fully launch. All unblocked except #2, which is a hard launch blocker.

### 1. Closed-Won / Closed-Lost rule

Currently manual via the new button. If you want automation, share the rules and we'll wire them up. Examples:

- Calendly booking-completed → Closed-Won
- No reply after 3 follow-ups over 30 days → Closed-Lost
- Hybrid: agent suggests, rep confirms

### 2. Calendly account credentials (launch blocker)

The scheduling link in every outreach email currently routes to our agency's calendar. We need:

- The client's Calendly **Personal Access Token** (Calendly → Integrations → API & Webhooks)
- The specific **event-type URL** leads should be sent to (e.g., "Augustine Institute · 30-min Discovery Call")
- Whether to use one shared link or **per-rep routing**

### 3. Campaign auto-completion rule

When should a campaign stop being "Running"? Options:

- All journeys terminal → auto-mark Completed
- Send limit reached
- End-date passed
- Manual only

Our recommendation: **auto-mark Completed when 100% of journeys are in terminal stages** (Won / Lost / Disqualified).

### 4. Scraped staff / institution data use case

This data is currently extracted but unused. Options:

- Personalise outreach emails ("Hi [Principal Name]")
- Surface on the contact / journey view for sales reps
- Filter / segment leads by institution attributes
- Stop scraping if there's no plan to use it (storage + scraping load aren't free)

### 5. Bulk operations

Confirm whether you want:

- **CSV export** — Contacts, Journeys, Campaigns (respects current filters)
- **CSV import** — Products, Leads, ICPs (admin-only, with preview + validation)

Easy to ship if yes.

---

## Quick wins for the sales team

A few moves that immediately demonstrate the new capabilities:

1. **Open `/journey`** — see every journey grouped by campaign, with funnel KPIs at the top and a full colour-coded stage breakdown chart.
2. **Click any journey's eye icon** → switch to the **Activity Logs** tab → watch new entries appear in real time as the agent works.
3. **Click the green Activity icon** on a journey → opens straight to the logs view for that journey.
4. **In the journey modal** → click **Mark as Closed-Won** → confirm → see the dashboard funnel update in real time.
5. **Visit `/meetings`** → see all Calendly bookings with the date-range filter; click any row to see invitee details + join link.

---

## Architecture summary (technical reference)

For engineering / DevOps hand-off:

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + React 19 + TypeScript |
| State / data | React Query + Supabase realtime channels |
| Database | Supabase Postgres (main CRM + execution DB) |
| Outreach agent | n8n workflow (LLM-driven email generation + classification) |
| Scheduling | Calendly API (server-side proxy at `/api/calendly/events`) |
| Styling | Tailwind v4 + custom CSS variables |
| Forms | Formik + Yup validation |

Realtime is wired via Supabase `postgres_changes` channels invalidating React Query caches. The pipeline writes go through n8n (or directly through the CRM UI for manual operations); both surfaces converge on the same Supabase tables and the same realtime subscribers see updates from either source.

---

## Closing

The CRM is in a strong, stable state and ready for sales-team usage today. The remaining work is **data integration** (Calendly account swap) and **rule definition** (when campaigns auto-complete, how Closed-Won is decided automatically) — both of which require client input rather than further engineering.

For questions or follow-ups, contact the delivery team or open an issue in the project repository.
