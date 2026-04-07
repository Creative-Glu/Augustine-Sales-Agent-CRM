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
| View dashboards (KPI, Marketing, Execution)     | Yes    | Yes      | Yes   |
| View contacts, products, ICPs, campaigns        | Yes    | Yes      | Yes   |
| View execution data (staff, institutions, jobs) | Yes    | Yes      | Yes   |
| Export CSV                                      | Yes    | Yes      | Yes   |
| Use Dry Run Tool (CSV merge preview)            | Yes    | Yes      | Yes   |
| Submit scrape jobs                              | No     | Yes      | Yes   |
| Approve/reject outreach emails                  | No     | Yes      | Yes   |
| Edit outreach content                           | No     | Yes      | Yes   |
| Create/edit contacts, products, ICPs, campaigns | No     | No       | Yes   |
| Create/edit parish roles and role mappings      | No     | No       | Yes   |
| Apply role mappings to staff database           | No     | No       | Yes   |
| Toggle HubSpot sync on/off                      | No     | No       | Yes   |
| Run batch HubSpot sync                          | No     | No       | Yes   |
| Retry failed sync queue jobs                    | No     | No       | Yes   |
| Trigger single-entity HubSpot sync              | No     | No       | Yes   |
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
