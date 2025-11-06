import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_UNCONFIGURED } from '../lib/env';
import { wsClient } from '../lib/wsClient';

export function useApiData(page = 1, limit = 6) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_users: 0,
    has_next: false,
    has_prev: false
  });

  const { isAuthenticated } = useAuth();

  const fetchData = useCallback(async (pageNum = page, showLoading = true) => {
    try {
      if (API_UNCONFIGURED) {
        setUsers([]);
        setPagination({ current_page: 1, total_pages: 1, total_users: 0, has_next: false, has_prev: false });
        setError('Backend is not configured');
        return;
      }
      if (showLoading) {
        setLoading(true);
      }
      
      if (isAuthenticated && !wsClient.isReady()) {
        await wsClient.connect().catch(() => {});
      }
      const usersData: any = await wsClient.request('users.with_info', { page: pageNum, limit });

      setUsers(usersData.users);
      setPagination(usersData.pagination);
      
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, page, isAuthenticated]);

  useEffect(() => {
    if (API_UNCONFIGURED) {
      setLoading(false);
      setError('Backend is not configured');
      return;
    }
    if (isAuthenticated) {
      fetchData(page, true);
    } else {
      setLoading(false);
      setError('Требуется авторизация');
    }
  }, [page, limit, isAuthenticated, fetchData]);

  // ❌ УБИРАЕМ автообновления
  return {
    users,
    loading,
    error,
    pagination,
    refreshData: fetchData
  };
}
