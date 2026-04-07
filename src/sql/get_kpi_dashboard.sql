CREATE OR REPLACE FUNCTION public.get_kpi_dashboard()
RETURNS TABLE(
    campaign_id integer,
    campaign_name text,
    total_outreached bigint,
    total_won bigint,
    conversion_rate_pct numeric,
    sal_count bigint
)
LANGUAGE sql
AS $$
WITH base AS (
    SELECT
        j.campaign_id,
        COALESCE(l.lead_id, j.lead_id) AS lead_id,
        l.funnel_stage
    FROM public.journeys j
    LEFT JOIN public.logs l ON l.journey_id = j.journey_id
),
outreached AS (
    SELECT campaign_id, COUNT(DISTINCT lead_id) AS total_outreached
    FROM base
    WHERE funnel_stage = 'Outreached'
    GROUP BY campaign_id
),
won AS (
    SELECT campaign_id, COUNT(DISTINCT lead_id) AS total_won
    FROM base
    WHERE funnel_stage = 'Closed - Won'
    GROUP BY campaign_id
),
conversion AS (
    SELECT 
        o.campaign_id,
        o.total_outreached,
        COALESCE(w.total_won,0) AS total_won,
        CASE 
            WHEN o.total_outreached = 0 THEN 0
            ELSE (COALESCE(w.total_won,0)::decimal / o.total_outreached) * 100
        END AS conversion_rate_pct
    FROM outreached o
    LEFT JOIN won w ON w.campaign_id = o.campaign_id
),
sal AS (
    SELECT campaign_id, COUNT(DISTINCT lead_id) AS sal_count
    FROM base
    WHERE funnel_stage = 'SAL'
    GROUP BY campaign_id
)
SELECT
    c.campaign_id,
    cam.campaign_name,
    c.total_outreached,
    c.total_won,
    c.conversion_rate_pct,
    COALESCE(s.sal_count,0) AS sal_count
FROM conversion c
LEFT JOIN public.campaigns cam ON cam.campaign_id = c.campaign_id
LEFT JOIN sal s ON s.campaign_id = c.campaign_id
ORDER BY c.campaign_id;
$$;
