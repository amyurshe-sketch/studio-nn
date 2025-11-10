import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from './i18n';
import MessageButton from './components/MessageButton';
import { API_BASE_URL } from './lib/env';

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--color-muted)' }}>← {t('back.home')}</Link>
      <h2 style={{ margin: 0, color: 'var(--color-text)' }}>Вход</h2>
      <p style={{ marginTop: 8, color: 'var(--color-muted)' }}>Введите имя пользователя и пароль.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            const resp = await fetch(`${API_BASE_URL}/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ name, password }),
            });
            if (!resp.ok) {
              const msg = resp.status === 401 ? 'Неверные учетные данные' : `Ошибка: ${resp.status}`;
              throw new Error(msg);
            }
            // Сессия установлена в HttpOnly cookies. Обновим страницу/перейдём для подхвата контекста.
            navigate('/users');
            try { window.location.reload(); } catch {}
          } catch (err: any) {
            setError(err?.message || 'Ошибка входа');
          } finally {
            setSubmitting(false);
          }
        }}
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          maxWidth: 420,
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Имя пользователя:</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Введите имя"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Пароль:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </label>
          <div>
            <MessageButton type="submit" disabled={submitting}>
              {submitting ? 'Вход...' : 'Войти'}
            </MessageButton>
          </div>
        </div>
      </form>
    </div>
  );
}
