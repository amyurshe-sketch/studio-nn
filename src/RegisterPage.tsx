import React, { useMemo, useState } from 'react';
import MessageButton from './components/MessageButton';
import { useI18n } from './i18n';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './lib/env';

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => {
    const pwd = password || '';
    const uname = (name || '').trim().toLowerCase();
    const p = pwd.trim();
    if (!p) return { score: 0, label: 'Сила пароля: —', color: '#64748b', warn: null };
    const lower = /[a-zа-я]/.test(p);
    const upper = /[A-ZА-Я]/.test(p);
    const digit = /\d/.test(p);
    const symbol = /[^\w\s]/.test(p);
    let score = 0;
    if (p.length >= 5) score += 1;
    if (p.length >= 8) score += 1;
    if (p.length >= 12) score += 1;
    const variety = [lower, upper, digit, symbol].filter(Boolean).length;
    score += Math.max(0, variety - 1); // +0..3
    let label = 'Слабый';
    let color = '#ef4444';
    if (score >= 4 && p.length >= 8) { label = 'Средний'; color = '#f59e0b'; }
    if (score >= 6 && p.length >= 12) { label = 'Сильный'; color = '#10b981'; }
    let warn: string | null = null;
    if (uname && p.toLowerCase().includes(uname)) {
      warn = 'Пароль содержит имя пользователя — это небезопасно';
      // визуально понижаем оценку
      label = 'Очень слабый';
      color = '#ef4444';
    }
    return { score, label: `Сила пароля: ${label}`, color, warn };
  }, [password, name]);
  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--color-muted)' }}>← {t('back.home')}</Link>
      <h2 style={{ margin: 0, color: 'var(--color-text)' }}>{t('register.title')}</h2>
      <p style={{ marginTop: 8, color: 'var(--color-muted)' }}>{t('register.subtitle')}</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (password !== confirm) {
            setError(t('register.error.mismatch'));
            return;
          }
          setSubmitting(true);
          try {
            const resp = await fetch(`${API_BASE_URL}/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ name, password }),
            });
            if (!resp.ok) {
              let msg = `Ошибка: ${resp.status}`;
              try {
                const j = await resp.json();
                if (j?.detail) msg = j.detail;
              } catch {}
              throw new Error(msg);
            }
            // Куки сессии выставлены сервером, перезагрузим/навигация
            location.assign('/users');
          } catch (err: any) {
            setError(err?.message || 'Ошибка регистрации');
          } finally {
            setSubmitting(false);
          }
        }}
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          maxWidth: 520,
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
              minLength={2}
              placeholder="Введите имя (уникальное)"
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
              minLength={5}
              placeholder="Не менее 5 символов"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
            <div style={{ fontSize: 12, color: strength.color, marginTop: 4 }}>{strength.label}</div>
            {strength.warn && (
              <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 2 }}>{strength.warn}</div>
            )}
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{t('register.password.confirm')}</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={5}
              placeholder={t('register.password.confirm.placeholder')}
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
              {submitting ? 'Создание...' : t('register.submit.register')}
            </MessageButton>
          </div>
        </div>
      </form>
    </div>
  );
}
