# Augustine CRM — Agent Permission Boundaries

## User Roles

| Role         | Level          | Description                                                                                        |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------- |
| **Viewer**   | Read-only      | Can view dashboards, contacts, execution data. Cannot modify anything.                             |
| **Reviewer** | Read + Approve | All Viewer permissions + can approve/reject outreach emails.                                       |
| **Admin**    | Full access    | All Reviewer permissions + user management, role mapping, HubSpot sync controls, batch operations. |

## Permission Matrix

| Feature                                         | Viewer | Reviewer | Admin |
| ----------------------------------------------- | ------ | -------- | ----- |
| View execution data (staff, institutions, jobs) | Yes    | Yes      | Yes   |
| Export CSV                                      | Yes    | Yes      | Yes   |
| Use Dry Run Tool (CSV merge preview)            | Yes    | Yes      | Yes   |
| Submit scrape jobs                              | No     | Yes      | Yes   |
| Approve/reject outreach emails                  | No     | Yes      | Yes   |
| Edit outreach content                           | No     | Yes      | Yes   |
| Apply role mappings to staff database           | No     | No       | Yes   |
| Manage users (create, edit, delete)             | No     | No       | Yes   |

## Authentication Boundaries

| Layer                   | Mechanism                                                                  | Scope                                                                                        |
| ----------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Proxy (server-side)** | `augustine-auth` cookie check in `src/proxy.ts`                            | All routes except `/login`. Redirects unauthenticated users before any page content renders. |
| **API Client**          | Bearer token in `Authorization` header via `src/lib/augustineApiClient.ts` | All backend API calls. Auto-clears token + cookie + redirects to `/login` on 401.            |
| **Client-side**         | `useAuth()` context from `src/providers/AuthProvider.tsx`                  | Components check `user.role` to conditionally render Admin-only controls.                    |
| **Backend API**         | JWT validation on the API server (external)                                | All API endpoints validate the Bearer token server-side.                                     |

## Token Lifecycle

```
Login → Backend returns JWT → Stored in localStorage + cookie set
     ↓
Page navigation → Proxy checks cookie → Allows or redirects
     ↓
API call → Bearer token sent in header → Backend validates
     ↓
401 response → localStorage cleared + cookie cleared → Redirect to /login
     ↓
Logout → localStorage cleared + cookie cleared → Redirect to /login
```

## Data Access Boundaries

| Database             | Access From                                  | Auth                    |
| -------------------- | -------------------------------------------- | ----------------------- |
| Main Supabase (CRM)  | Client-side via `supabaseClient.ts`          | Anon key (RLS enforced) |
| Execution Supabase   | Client-side via `executionSupabaseClient.ts` | Anon key (RLS enforced) |
| File Upload Supabase | Server-side API route only                   | Anon key (server-only)  |
| Backend API          | Client-side via `augustineApiClient.ts`      | Bearer JWT token        |
| HubSpot              | Backend API only (never direct from client)  | API key (server-only)   |

## API Route Boundaries

Server-side API routes in `src/app/api/` act as proxies. They do NOT expose backend credentials to the client.

| Route                      | Method | Input Validation                                           | Auth               |
| -------------------------- | ------ | ---------------------------------------------------------- | ------------------ |
| `/api/sync-queue`          | GET    | Allowlisted status/entity_type params, clamped limit       | Proxied to backend |
| `/api/sync-retry`          | POST   | Validated body shape (queue_id or entity type+id)          | Proxied to backend |
| `/api/upload-catholic-pdf` | POST   | PDF type check, 25 MB size limit, duplicate filename check | Direct to webhook  |

## AI Agent Boundaries

| Constraint | Policy |
|-----------|--------|
| **Allowed actions** | Read data, generate draft emails, suggest role mappings, format CSV exports |
| **Prohibited actions** | Direct database writes, HubSpot sync execution, user deletion, credential access |
| **Rate limits** | $500/month budget, 80% alert threshold, max 100 API calls per agent session |
| **Data access** | Agents only access data through the same RLS-enforced Supabase clients as users |
| **Output scope** | All agent-generated content (emails, summaries) requires human approval before action |

## Escalation Path

When an agent encounters a situation outside its boundaries, the following escalation path applies:

| Trigger | Action | Escalation Target |
|---------|--------|-------------------|
| Agent hits rate limit | Pause execution, log event, notify admin | Admin via dashboard alert |
| Agent produces low-confidence output | Flag for review, do not auto-approve | Reviewer via outreach approval queue |
| Agent encounters unknown data format | Stop processing, log error with context | Data team via Slack #augustine-alerts |
| Agent budget exceeds 80% threshold | Alert sent, non-critical tasks paused | Admin via email + dashboard |
| Agent budget exceeds 100% | All agent activity halted immediately | Admin — requires manual re-enablement |
| Security incident (auth failure, data leak) | Immediate halt, all tokens revoked | Admin + Engineering lead — incident response |

### Emergency Kill Switch

To immediately stop all agent activity:

1. **Dashboard**: Admin → Settings → Agent Controls → "Disable All Agents"
2. **Environment**: Set `AGENT_ENABLED=false` in environment variables and redeploy
3. **Budget**: Set agent budget to $0 in cost controls

## Output Review Process

All AI agent outputs are subject to review before they affect production data or reach end users:

| Output Type | Review Process | Reviewer |
|------------|---------------|----------|
| **Outreach emails** | Queued in approval workflow — Reviewer must approve/reject before sending | Reviewer or Admin |
| **Role mapping suggestions** | Displayed as suggestions in UI — Admin must explicitly apply | Admin only |
| **CSV export formatting** | Dry Run Tool shows preview — user confirms before download | Any authenticated user |
| **Data enrichment** | Staged in sync queue — visible in dashboard before HubSpot push | Admin |

### Review Logging

All review decisions are logged to the `governance_events` table:

| Field | Description |
|-------|------------|
| `event_type` | `agent_output_approved`, `agent_output_rejected`, `agent_output_modified` |
| `agent_id` | Identifier of the agent that produced the output |
| `reviewer_id` | User ID of the reviewer |
| `timestamp` | ISO 8601 timestamp |
| `context` | JSON payload with output details and review notes |
