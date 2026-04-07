# Augustine CRM — Backup & Recovery Procedures

**Last Updated:** 2026-04-07
**Owner:** Creative Glu — Augustine Institute

## Backup Strategy

### Supabase Databases

| Database | Backup Type | Frequency | Retention | Provider |
|----------|------------|-----------|-----------|----------|
| Main CRM | Automated point-in-time | Continuous (WAL) | 7 days PITR | Supabase Pro |
| Execution DB | Automated point-in-time | Continuous (WAL) | 7 days PITR | Supabase Pro |
| File Upload DB | Automated point-in-time | Continuous (WAL) | 7 days PITR | Supabase Pro |

### Supabase Storage (File Uploads)

| Asset | Backup Method | Frequency | Retention |
|-------|--------------|-----------|-----------|
| Uploaded PDFs | Supabase Storage replication | Continuous | Matches retention policy (6 months) |

### Application Code

| Asset | Backup Method | Frequency | Location |
|-------|--------------|-----------|----------|
| Source code | Git (GitHub) | Every push | GitHub — Creative-Glu/Augustine-Sales-Agent-CRM |
| Environment config | Netlify environment variables | On change | Netlify dashboard (encrypted) |

## Recovery Procedures

### Database Recovery (Supabase PITR)

1. Navigate to Supabase Dashboard → Project → Database → Backups
2. Select the point-in-time to restore to
3. Confirm restoration — this creates a new database branch
4. Verify data integrity in the restored branch
5. Swap the restored branch to production

**RTO:** < 30 minutes
**RPO:** < 1 minute (continuous WAL archiving)

### Application Recovery

1. Identify the last known good commit via `git log`
2. Deploy the known good commit: Netlify → Deploys → select build → "Publish deploy"
3. Verify the deployment via health endpoint (`/api/health`)

**RTO:** < 10 minutes (Netlify instant rollback)

### Full Disaster Recovery

1. Re-provision Supabase projects from backup
2. Restore environment variables from documented `.env.example` template
3. Deploy latest stable commit from GitHub
4. Run smoke tests against all critical paths
5. Notify stakeholders of recovery completion

## Testing

- Backup restoration is tested quarterly
- Recovery runbook is reviewed with each infrastructure change
- RTO/RPO targets are validated during tests
