# Augustine CRM — Data Retention Policy

**Effective Date:** 2026-04-07
**Owner:** Creative Glu — Augustine Institute
**Review Cadence:** Quarterly

## Overview

This policy defines how long data is retained across Augustine CRM systems and when it is purged or archived.

## Retention Schedule

| Data Category | Storage Location | Retention Period | Purge Method |
|--------------|-----------------|-----------------|--------------|
| **Contact records** | Main Supabase (CRM) | Indefinite (active) | Manual deletion by Admin |
| **Scraping job results** | Execution Supabase | 12 months after job completion | Automated cleanup via scheduled task |
| **Extracted staff/institution data** | Execution Supabase | 12 months after extraction | Archived then deleted |
| **Uploaded PDFs** | File Upload Supabase Storage | 6 months after processing | Automated storage cleanup |
| **Outreach email drafts** | Backend API database | 12 months after creation | Soft delete, hard delete after 18 months |
| **Sync queue entries** | Backend API database | 6 months after resolution | Automated cleanup |
| **Audit/governance event logs** | Backend API database | 24 months | Archived to cold storage |
| **User session tokens** | localStorage + cookies | Session duration (auto-cleared on logout/401) | Immediate on logout |
| **Application logs** | Netlify / hosting provider | 90 days | Provider-managed rotation |

## Archive Policy

- Data past its retention period is archived to cold storage before deletion
- Archived data is retained for an additional 6 months for compliance purposes
- Archives are encrypted at rest and access-logged

## Deletion Process

1. Automated cleanup jobs run weekly for expired data
2. Admin can trigger manual purge from the dashboard
3. All deletions are logged to the `governance_events` table
4. Soft deletes are used first; hard deletes occur after the grace period

## User Data Rights

- Users can request data export via Admin
- Users can request data deletion — processed within 30 days
- Deletion requests are logged and confirmed via email

## Backup Interaction

Retained data is included in daily backups (see backup documentation). When data is purged, it is also removed from backups after the next full backup cycle (7 days).
