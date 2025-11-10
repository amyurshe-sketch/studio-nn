import React, { useEffect, useMemo, useState } from 'react';
import MessageButton from './MessageButton';
import { API_BASE_URL } from '../lib/env';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: { gender?: string | null; age?: number | null; about?: string | null; avatar_url?: string | null };
  onSaved?: (next: { gender?: string | null; age?: number | null; about?: string | null; avatar_url?: string | null }) => void;
};

function getCsrfToken(): string | undefined {
  try {
    const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
    if (m && m[1]) return decodeURIComponent(m[1]);
  } catch {}
  return undefined;
}

export default function EditProfileModal({ open, onClose, initial, onSaved }: Props) {
  const [gender, setGender] = useState<string | ''>(initial?.gender || '');
  const [age, setAge] = useState<string>(initial?.age != null ? String(initial?.age) : '');
  const [about, setAbout] = useState<string>(initial?.about || '');
  const [avatar, setAvatar] = useState<string>(initial?.avatar_url || '');
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGender(initial?.gender || '');
    setAge(initial?.age != null ? String(initial?.age) : '');
    setAbout(initial?.about || '');
    setAvatar(initial?.avatar_url || '');
    setErr(null);
  }, [initial, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', color: '#0f172a', borderRadius: 12, padding: 20, width: 'min(520px, 92vw)' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Редактировать профиль</h3>
        {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>{err}</div>}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setSaving(true);
            try {
              const body: any = {
                gender: (gender || '').trim() || null,
                age: age ? Number(age) : null,
                about: (about || '').trim() || null,
                avatar_url: (avatar || '').trim() || null,
              };
              if (body.age != null) {
                if (isNaN(body.age) || body.age < 1 || body.age > 120) {
                  throw new Error('Возраст должен быть от 1 до 120');
                }
              }
              if (body.about && body.about.length > 100) {
                throw new Error('Поле «О себе» не должно превышать 100 символов');
              }
              const headers: any = { 'Content-Type': 'application/json' };
              const csrf = getCsrfToken();
              if (csrf) headers['X-CSRF-Token'] = csrf;
              const r = await fetch(`${API_BASE_URL}/profiles/me`, {
                method: 'PUT',
                credentials: 'include',
                headers,
                body: JSON.stringify(body),
              });
              if (!r.ok) {
                let msg = `Ошибка: ${r.status}`;
                try { const j = await r.json(); if (j?.detail) msg = j.detail; } catch {}
                throw new Error(msg);
              }
              const j = await r.json();
              onSaved?.({ gender: j.gender, age: j.age, about: j.about, avatar_url: j.avatar_url });
              onClose();
            } catch (e: any) {
              setErr(e?.message || 'Не удалось сохранить профиль');
            } finally {
              setSaving(false);
            }
          }}
          style={{ display: 'grid', gap: 12 }}
        >
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Пол</span>
            <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }}>
              <option value="">— Не указан —</option>
              <option value="мужской">Мужской</option>
              <option value="женский">Женский</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Возраст</span>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="1–120" inputMode="numeric" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>О себе (до 100 символов)</span>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} maxLength={100} rows={3} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Ссылка на аватар</span>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="header-control-button" style={{ padding: '10px 12px', borderRadius: 10 }}>Отмена</button>
            <MessageButton type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</MessageButton>
          </div>
        </form>
      </div>
    </div>
  );
}

