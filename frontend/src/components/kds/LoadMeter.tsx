'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

const COLORS = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

export function LoadMeter() {
  const [load, setLoad] = useState<any>(null);

  useEffect(() => {
    const fetchLoad = () => apiClient.get('/kds/load').then(setLoad).catch(() => {});
    fetchLoad();
    const interval = setInterval(fetchLoad, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (!load) return null;

  const color = COLORS[load.level as keyof typeof COLORS] || COLORS.green;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-sm transition-colors duration-300" style={{ borderColor: color }}>
      <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      <span className="text-sm font-semibold text-gray-700">~{load.estimatedQueueMinutes} min wait</span>
    </div>
  );
}
