import { useEffect, useRef } from 'react';
import { wsClient } from '../lib/wsClient';
import { API_BASE_URL, API_UNCONFIGURED } from '../lib/env';
import { useAuth } from './useAuth';

const INACTIVITY_MS = 15 * 60 * 1000; // 15 минут
const HEARTBEAT_INTERVAL_MS = 60 * 1000; // 1 минута

export function usePresence() {
  const { isAuthenticated, user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<any>(null);
  const wentIdleRef = useRef(false);

  useEffect(() => {
    if (API_UNCONFIGURED) return;
    if (!isAuthenticated || !user?.user_id) return;

    const updateActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      if (wentIdleRef.current) {
        wentIdleRef.current = false;
        try { wsClient.send('presence.heartbeat', { ts: new Date().toISOString(), user_id: user.user_id, reason: 'activity-resumed' }); } catch {}
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'visibilitychange'];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const sendHeartbeat = async (reason = 'interval') => {
      const payload = {
        ts: new Date().toISOString(),
        last_active_ts: new Date(lastActivityRef.current).toISOString(),
        user_id: user.user_id,
        reason,
      };
      try { wsClient.send('presence.heartbeat', payload); } catch {}
    };

    // Начальный heartbeat сразу после монтирования
    sendHeartbeat('mount');
    intervalRef.current = setInterval(async () => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= INACTIVITY_MS) {
        if (!wentIdleRef.current) {
          wentIdleRef.current = true;
          try {
            await fetch(`${API_BASE_URL}/presence/offline`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                ts: new Date().toISOString(),
                last_active_ts: new Date(lastActivityRef.current).toISOString(),
                user_id: user.user_id,
                reason: 'idle-timeout',
              }),
              keepalive: true,
            });
          } catch {}
        }
        return;
      }
      await sendHeartbeat('interval');
    }, HEARTBEAT_INTERVAL_MS);

    const handlePageHide = () => {
      try {
        const url = `${API_BASE_URL}/presence/offline?user_id=${encodeURIComponent(user.user_id)}`;
        const data = {
          ts: new Date().toISOString(),
          last_active_ts: new Date(lastActivityRef.current).toISOString(),
          reason: 'page-hide',
        };
        try { wsClient.send('presence.offline', { ...data, user_id: user.user_id }); } catch {}
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        if (navigator.sendBeacon) navigator.sendBeacon(url, blob);
      } catch {}
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handlePageHide();
    });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isAuthenticated, user]);
}
