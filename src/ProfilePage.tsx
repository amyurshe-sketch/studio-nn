import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { wsClient } from './lib/wsClient';
import { API_BASE_URL } from './lib/env';
import { useI18n } from './i18n';
import styles from './ProfilePage.module.css';
import MessageButton from './components/MessageButton';

function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, getAuthHeaders } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileExtra, setProfileExtra] = useState<{ gender?: string | null; age?: number | null; about?: string | null; avatar_url?: string | null } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formGender, setFormGender] = useState<string>('');
  const [formAge, setFormAge] = useState<string>('');
  const [formAbout, setFormAbout] = useState<string>('');
  const [formAvatar, setFormAvatar] = useState<string>('');
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Emoji presets and gender-based defaults (emoji), stored as "emoji:<char>"
  const defaultMale = 'emoji:👨';
  const defaultFemale = 'emoji:👩';
  const emojiPresets = ['😀','😎','🤠','🤖','🦊','🐼','🐯','🐸','🦄','🐵'];
  // Debounced autosave
  useEffect(() => {
    if (!editMode) return;
    const body: any = {
      gender: (formGender || '').trim() || null,
      age: formAge ? Number(formAge) : null,
      about: (formAbout || '').trim() || null,
      avatar_url: (formAvatar || '').trim() || null,
    };
    const key = JSON.stringify(body);
    const timer = setTimeout(async () => {
      try {
        // avoid resending the same unchanged state consecutively
        if ((window as any).__last_profile_autosave === key) return;
        setSaving(true);
        setSaveErr(null);
        if (body.age != null && (isNaN(body.age) || body.age < 1 || body.age > 120)) {
          throw new Error('Возраст должен быть от 1 до 120');
        }
        if (body.about && body.about.length > 100) {
          throw new Error('Поле «О себе» не должно превышать 100 символов');
        }
        const headers: any = { 'Content-Type': 'application/json' };
        try {
          const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
          if (m && m[1]) headers['X-CSRF-Token'] = decodeURIComponent(m[1]);
        } catch {}
        const r = await fetch(`${API_BASE_URL}/profiles/me`, { method: 'PUT', credentials: 'include', headers, body: JSON.stringify(body) });
        if (!r.ok) {
          let msg = `Ошибка: ${r.status}`;
          try { const j = await r.json(); if (j?.detail) msg = j.detail; } catch {}
          throw new Error(msg);
        }
        (window as any).__last_profile_autosave = key;
        const j = await r.json();
        setProfileExtra({ gender: j.gender ?? null, age: j.age ?? null, about: j.about ?? null, avatar_url: j.avatar_url ?? null });
      } catch (e: any) {
        setSaveErr(e?.message || 'Не удалось сохранить профиль');
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [editMode, formGender, formAge, formAbout, formAvatar]);

  const getCsrfToken = (): string | undefined => {
    try {
      const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    } catch {}
    return undefined;
  };
  const [statistics, setStatistics] = useState({
    total_users: 0,
    female_users: 0,
    male_users: 0,
    online_users: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Функция для определения специальной роли
  const getSpecialRole = () => {
    if ((profileExtra?.gender || userProfile?.gender) === 'женский') {
      return t('profile.role.pretty');
    }
    return t('profile.role.common');
  };

  // Функция для определения эмодзи аватара
  const getAvatarEmoji = () => {
    const g = profileExtra?.gender || userProfile?.gender;
    if (g === 'женский') return '💁‍♀️';
    if (g === 'мужской') return '💁‍♂️';
    return '👤';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!user?.user_id) {
          throw new Error(t('profile.error') + ' ' + 'Unauthorized');
        }

        // Загружаем профиль пользователя
        if (user?.user_id && !wsClient.isReady()) {
          await wsClient.connect().catch(() => {});
        }
        try {
          const profileData: any = await wsClient.request('user.profile', { user_id: user.user_id });
          setUserProfile(profileData);
        } catch {}
        // Дополнительный профиль через HTTP
        try {
          const r = await fetch(`${API_BASE_URL}/profiles/me`, { credentials: 'include' });
          if (r.ok) {
            const j = await r.json();
            setProfileExtra({ gender: j.gender ?? null, age: j.age ?? null, about: j.about ?? null, avatar_url: j.avatar_url ?? null });
          }
        } catch {}
        
        // Загружаем статистику системы (если эндпоинт есть)
        let statsData: any = null;
        try {
          statsData = await wsClient.request('system.statistics', {});
        } catch {}
        if (statsData) {
          setStatistics(prev => ({
            ...prev,
            total_users: statsData.total_users ?? prev.total_users,
            female_users: statsData.female_users ?? 0,
            male_users: statsData.male_users ?? 0,
            online_users: statsData.online_users ?? prev.online_users,
          }));
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchData();
    }
  }, [user]);

  // SSE removed; online_users comes from API stats only

  if (loading) {
    return (
      <div className="profile-page">
        <header>
          <Link to="/" className="back-button">{t('back.home')}</Link>
          <h1 className="page-title">{t('profile.title')}</h1>
        </header>
        <div className="loading">{t('profile.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <header>
          <Link to="/" className="back-button">{t('back.home')}</Link>
          <h1 className="page-title">{t('profile.title')}</h1>
        </header>
        <div className="error">{t('profile.error')} {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <header>
        <Link to="/" className="back-button">{t('back.home')}</Link>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-description">{t('profile.subtitle')}</p>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar} style={{ overflow: 'hidden' }}>
            {(() => {
              const val = profileExtra?.avatar_url || (
                profileExtra?.gender === 'женский' ? defaultFemale : profileExtra?.gender === 'мужской' ? defaultMale : ''
              );
              if (val && val.startsWith('emoji:')) {
                const ch = val.slice(6) || getAvatarEmoji();
                return <span style={{ fontSize: 34, lineHeight: 1 }}>{ch}</span>;
              }
              if (val) {
                return <img src={val} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />;
              }
              return <span>{getAvatarEmoji()}</span>;
            })()}
          </div>
          <h2 className={styles.titleRow}>
            {userProfile?.name || user?.name}
            <button
              type="button"
              className="header-control-button"
              title="Редактировать профиль"
              onClick={() => {
                setEditMode(true);
                setSaveErr(null);
                setFormGender(profileExtra?.gender || '');
                setFormAge(profileExtra?.age != null ? String(profileExtra?.age) : '');
                setFormAbout(profileExtra?.about || '');
                setFormAvatar(profileExtra?.avatar_url || '');
              }}
            >
              ✏️
            </button>
          </h2>
          <span className={styles.role}>
            {getSpecialRole()}
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.item}>
            <span className={styles.label}>{t('profile.id')}</span>
            <span className={styles.value}>{user?.user_id}</span>
          </div>
          
          <div className={styles.item}>
            <span className={styles.label}>{t('profile.name')}</span>
            <span className={styles.value}>{userProfile?.name || user?.name}</span>
          </div>
          
          <div className={styles.item} style={{ transition: 'all 250ms ease' }}>
            <span className={styles.label}>{t('profile.age')}</span>
            {editMode ? (
              <input className={styles.input} value={formAge} onChange={(e) => setFormAge(e.target.value)} placeholder="1–120" inputMode="numeric" />
            ) : (
              <span className={styles.value}>{(profileExtra?.age != null) ? profileExtra?.age : t('profile.age.unknown')}</span>
            )}
          </div>
          
          <div className={styles.item} style={{ transition: 'all 250ms ease' }}>
            <span className={styles.label}>{t('profile.gender')}</span>
            {editMode ? (
              <select className={styles.select} value={formGender} onChange={(e) => setFormGender(e.target.value)}>
                <option value="">— Не указан —</option>
                <option value="мужской">{t('profile.gender.male')}</option>
                <option value="женский">{t('profile.gender.female')}</option>
              </select>
            ) : (
              <span className={styles.value}>
                {profileExtra?.gender === 'женский' ? t('profile.gender.female') : profileExtra?.gender === 'мужской' ? t('profile.gender.male') : t('profile.gender.unknown')}
              </span>
            )}
          </div>
          
          <div className={styles.item} style={{ transition: 'all 250ms ease' }}>
            <span className={styles.label}>О себе</span>
            {editMode ? (
              <textarea className={styles.textarea} value={formAbout} onChange={(e) => setFormAbout(e.target.value)} maxLength={100} rows={3} placeholder="До 100 символов" />
            ) : (
              <span className={styles.value}>{profileExtra?.about || '—'}</span>
            )}
          </div>

          <div className={styles.item} style={{ transition: 'all 250ms ease', alignItems: 'flex-start' }}>
            <span className={styles.label}>Аватар</span>
            {editMode ? (
              <div style={{ flex: 1 }}>
                <div className={styles.emojiGrid}>
                  {emojiPresets.map((ch) => {
                    const val = `emoji:${ch}`;
                    const selected = formAvatar === val;
                    return (
                      <button
                        type="button"
                        key={val}
                        className={[styles.emojiOption, selected ? styles.emojiOptionSelected : ''].join(' ')}
                        onClick={() => setFormAvatar(val)}
                        title="Выбрать эмодзи"
                      >
                        <span className={styles.emojiChar}>{ch}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Desktop: keep Reset button */}
                  <div className={styles.desktopOnly}>
                    <button type="button" className="header-control-button" onClick={() => setFormAvatar('')}>Сбросить</button>
                  </div>
                  {/* Mobile: show Cancel/Save here instead of bottom */}
                  <div className={styles.mobileOnly} style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="header-control-button"
                      onClick={() => { setEditMode(false); setSaveErr(null); }}
                    >
                      Отмена
                    </button>
                    <MessageButton
                      onClick={() => {
                        const local = {
                          gender: (formGender || '').trim() || null,
                          age: formAge ? Number(formAge) : null,
                          about: (formAbout || '').trim() || null,
                          avatar_url: (formAvatar || '').trim() || null,
                        } as any;
                        setProfileExtra(local);
                        setSaveErr(null);
                        setEditMode(false);
                      }}
                      disabled={saving}
                    >
                      Сохранить
                    </MessageButton>
                  </div>
                </div>
              </div>
            ) : (
              <span className={styles.value}>{profileExtra?.avatar_url ? 'Установлен' : 'По умолчанию'}</span>
            )}
          </div>
          
          {userProfile?.gender === 'женский' && (
            <div className={styles.item}>
              <span className={styles.label}>{t('profile.role.special')}</span>
              <span className={styles.value} style={{ color: '#db2777' }}>{t('profile.role.pretty')}</span>
            </div>
          )}
        </div>

        <div className={styles.stats}>
          <h3>{t('profile.stats.title')}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{statistics.total_users}</span>
              <span className="stat-label">{t('profile.stats.total')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.female_users}</span>
              <span className="stat-label">{t('profile.stats.female')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statistics.male_users}</span>
              <span className="stat-label">{t('profile.stats.male')}</span>
            </div>
            <div className="stat-item online">
              <span className="stat-number">{statistics.online_users}</span>
              <span className="stat-label">{t('profile.stats.online')}</span>
            </div>
          </div>

          {profileExtra?.gender === 'женский' && (
            <div className={styles.notice}>
              <div className="special-icon">💫</div>
              <div className="special-text">
                <strong>{t('profile.notice.title')}</strong><br />
                {t('profile.notice.text')}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <MessageButton onClick={() => navigate('/users')}>
            {t('profile.actions.users')}
          </MessageButton>
          <Link to="/leisure" className="action-button secondary">{t('profile.actions.leisure')}</Link>
          <Link to="/" className="action-button secondary">{t('profile.actions.home')}</Link>
          {editMode && (
            <>
              {saveErr && <span style={{ color: '#ef4444' }}>{saveErr}</span>}
              <div className={styles.desktopOnly} style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button type="button" className="header-control-button" onClick={() => { setEditMode(false); setSaveErr(null); }}>
                  Отмена
                </button>
                <MessageButton
                  onClick={() => {
                    // Не форсируем сохранение — автосейв уже работает.
                    // Просто выходим из режима редактирования и применяем локально видимые изменения.
                    const local = {
                      gender: (formGender || '').trim() || null,
                      age: formAge ? Number(formAge) : null,
                      about: (formAbout || '').trim() || null,
                      avatar_url: (formAvatar || '').trim() || null,
                    } as any;
                    setProfileExtra(local);
                    setSaveErr(null);
                    setEditMode(false);
                  }}
                  disabled={saving}
                >
                  Сохранить
                </MessageButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
