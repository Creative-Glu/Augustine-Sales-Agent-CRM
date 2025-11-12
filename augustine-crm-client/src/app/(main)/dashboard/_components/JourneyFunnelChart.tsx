'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDashboardStats } from '@/src/services/states/useDashboardStats';
import { Skeleton } from '@/src/components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getCSSVar(name: string, fallback = '#6366f1') {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
}

export default function JourneyFunnelChart({ counts }: { counts?: number[] }) {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-md w-5xl">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Journey Funnel</h3>
        <div className="space-y-4">
          <Skeleton height="24px" width="80%" />
          <Skeleton height="24px" width="90%" />
          <Skeleton height="24px" width="70%" />
          <Skeleton height="300px" className="mt-4" />
        </div>
      </div>
    );
  }

  const totalJourneys = data?.journeys ?? 0;

  let outreaded = 0;
  let engaged = 0;
  let mql = 0;

  if (counts && counts.length >= 3) {
    [outreaded, engaged, mql] = counts;
  } else if (totalJourneys > 0) {
    outreaded = Math.round(totalJourneys * 0.6);
    engaged = Math.round(totalJourneys * 0.3);
    mql = Math.max(0, totalJourneys - outreaded - engaged);
  } else {
    outreaded = 120;
    engaged = 45;
    mql = 12;
  }

  const labels = ['Outreaded', 'Engaged', 'MQL'];

  const primary = getCSSVar('--primary', '#1800ad') || '#1800ad';
  const chart2 = getCSSVar('--chart-2', '#2563eb') || '#2563eb';
  const success = getCSSVar('--status-success', '#10B981') || '#10B981';

  const dataChart = {
    labels,
    datasets: [
      {
        label: 'Counts',
        data: [outreaded, engaged, mql],
        backgroundColor: [primary.trim(), chart2.trim(), success.trim()],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-md w-7xl">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">Journey Funnel</h3>
      <Bar data={dataChart} options={options} />
    </div>
  );
}
