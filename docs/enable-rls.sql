-- ============================================================================
-- Enable RLS on tables flagged by GluSecure audit
-- Tables: glusecure_auditor_logs, kill_switch, kill_switch_audits
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Enable RLS
ALTER TABLE glusecure_auditor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kill_switch ENABLE ROW LEVEL SECURITY;
ALTER TABLE kill_switch_audits ENABLE ROW LEVEL SECURITY;

-- 2. Add policies — restrict to authenticated users only

-- glusecure_auditor_logs: read-only for authenticated, insert for service role
CREATE POLICY "Authenticated users can read audit logs"
  ON glusecure_auditor_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert audit logs"
  ON glusecure_auditor_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- kill_switch: only admins/service role can read and modify
CREATE POLICY "Authenticated users can read kill switch"
  ON kill_switch FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage kill switch"
  ON kill_switch FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- kill_switch_audits: read for authenticated, insert for service role
CREATE POLICY "Authenticated users can read kill switch audits"
  ON kill_switch_audits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert kill switch audits"
  ON kill_switch_audits FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Verify
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('glusecure_auditor_logs', 'kill_switch', 'kill_switch_audits');
