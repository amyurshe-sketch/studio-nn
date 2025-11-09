import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './lib/env';

function parseParams(): Record<string, string> {
  const out: Record<string, string> = {};
  const merge = (s: string) => {
    const usp = new URLSearchParams(s);
    usp.forEach((v, k) => { out[k] = v; });
  };
  if (typeof window !== 'undefined') {
    if (window.location.search) merge(window.location.search.substring(1));
    if (window.location.hash && window.location.hash.startsWith('#')) merge(window.location.hash.substring(1));
  }
  return out;
}

export default function TgCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = parseParams();
    if (!data || !data.hash || !data.id) {
      setError('Недостаточно данных для входа через Telegram.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
        navigate('/users', { replace: true });
      } catch (e) {
        setError('Не удалось выполнить вход через Telegram.');
      }
    })();
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Telegram Login</h2>
      {error ? <p style={{ color: '#ef4444' }}>{error}</p> : <p>Выполняется вход…</p>}
    </div>
  );
}

