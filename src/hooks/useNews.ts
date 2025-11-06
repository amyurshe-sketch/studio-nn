import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_UNCONFIGURED } from '../lib/env';

type Options = { auto?: boolean; intervalMs?: number };

export function useNews(source = 'all', limit = 10, options: Options = {}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef<number | null>(null);
  const auto = options.auto !== undefined ? options.auto : true;
  const intervalMs = options.intervalMs ?? 5 * 60 * 1000; // 5 минут по умолчанию

  useEffect(() => {
    let cancelled = false;
    const fetchNews = async () => {
      try {
        if (API_UNCONFIGURED) {
          if (!cancelled) {
            setLoading(false);
            setNews([]);
            setError('Backend is not configured');
          }
          return;
        }
        setLoading(true);
        
        let endpoint;
        if (source === 'cnews') {
          endpoint = `/rss/news/cnews?limit=${limit}`;
        } else if (source === 'habr') {
          endpoint = `/rss/news/habr?limit=${limit}`;
        } else if (source === 'wired') {
          endpoint = `/rss/latest/wired?limit=${limit}`;
        } else if (source === 'ars') {
          endpoint = `/rss/latest/ars?limit=${limit}`;
        } else {
          endpoint = `/rss/news?limit=${limit}`;
        }
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        if (!cancelled) {
          setNews(response.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Не удалось загрузить новости');
          console.error('News fetch error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();
    return () => { cancelled = true };
  }, [source, limit]);

  const refreshNews = async () => {
    try {
      if (API_UNCONFIGURED) {
        setLoading(false);
        setError('Backend is not configured');
        return;
      }
      setLoading(true);
      
      let endpoint;
      if (source === 'cnews') {
        endpoint = `/rss/news/cnews?limit=${limit}`;
      } else if (source === 'habr') {
        endpoint = `/rss/news/habr?limit=${limit}`;
      } else if (source === 'wired') {
        endpoint = `/rss/latest/wired?limit=${limit}`;
      } else if (source === 'ars') {
        endpoint = `/rss/latest/ars?limit=${limit}`;
      } else {
        endpoint = `/rss/news?limit=${limit}`;
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      setNews(response.data);
      setError(null);
    } catch (err) {
      setError('Не удалось обновить новости');
    } finally {
      setLoading(false);
    }
  };

  // Автообновление по таймеру, если включено
  useEffect(() => {
    if (!auto || intervalMs <= 0) return;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      refreshNews();
    };
    // Сразу обновлять не нужно — уже сделали первичный fetch; ждём интервал
    intervalRef.current = window.setInterval(tick, intervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [auto, intervalMs, source, limit]);

  return { news, loading, error, refreshNews };
}
