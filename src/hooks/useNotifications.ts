import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '../lib/wsClient';

export type NotificationItem = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  created_at?: string;
};

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const off = wsClient.on('notification.new', (n: NotificationItem) => {
      setItems(prev => {
        // Deduplicate by id in case multiple listeners or duplicate events fire
        if (prev.some(i => i.id === n.id)) return prev;
        return [n, ...prev];
      });
    });
    return () => { try { off?.(); } catch {} };
  }, []);

  const ack = useCallback(async (id: number) => {
    try {
      await wsClient.request('notifications.ack', { id });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, ack, clear };
}
