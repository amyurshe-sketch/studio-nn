import React, { useState } from 'react';
import MessageButton from './components/MessageButton';
import { useI18n } from './i18n';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './lib/env';

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genPwd, setGenPwd] = useState(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const len = 5 + Math.floor(Math.random() * 6); // 5..10
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  });

  const regenerate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const len = 5 + Math.floor(Math.random() * 6); // 5..10
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    setGenPwd(s);
  };

  
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={5}
                placeholder="Не менее 5 символов"
                style={{
                  padding: '10px 38px 10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                title={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{t('register.password.confirm')}</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={5}
                placeholder={t('register.password.confirm.placeholder')}
                style={{
                  padding: '10px 38px 10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                title={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Сгенерированный пароль:</span>
            <div style={{ position: 'relative' }}>
              <input
                value={genPwd}
                readOnly
                style={{
                  padding: '10px 86px 10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => { setPassword(genPwd); setConfirm(genPwd); }}
                aria-label="Вставить пароль в поля"
                title="Вставить пароль в поля"
                style={{
                  position: 'absolute',
                  right: 40,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ⤵
              </button>
              <button
                type="button"
                onClick={regenerate}
                aria-label="Сгенерировать ещё пароль"
                title="Сгенерировать ещё"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ↻
              </button>
            </div>
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
