'use client';

import { useEffect } from 'react';
import { getOfflineOrders, clearOfflineOrder } from '@/lib/offlineQueue';
import { apiClient } from '@/lib/apiClient';

export function OfflineSyncProvider() {
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Online! Syncing offline orders...');
      const pending = await getOfflineOrders();
      for (const order of pending) {
        try {
          await apiClient.post('/orders', order);
          await clearOfflineOrder(order.id);
          console.log(`Synced offline order ${order.id}`);
        } catch (err) {
          console.error(`Failed to sync order ${order.id}`, err);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
