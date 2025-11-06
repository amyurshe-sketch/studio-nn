import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { wsClient } from './lib/wsClient';
import { API_BASE_URL } from './lib/env';
import { useI18n } from './i18n';

function ProfilePage() {
  const { t } = useI18n();
  const { user, getAuthHeaders } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
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
    if (userProfile?.gender === 'женский') {
      return t('profile.role.pretty');
    }
    return t('profile.role.common');
  };

  // Функция для определения эмодзи аватара
  const getAvatarEmoji = () => {
    if (userProfile?.gender === 'женский') return '💁‍♀️';
    if (userProfile?.gender === 'мужской') return '💁‍♂️';
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
        const profileData: any = await wsClient.request('user.profile', { user_id: user.user_id });
        setUserProfile(profileData);
        
        // Загружаем статистику системы (если эндпоинт есть)
        let statsData: any = null;
        try {
          statsData = await wsClient.request('system.statistics', {});
        } catch {}
        if (statsData) {
          setStatistics(prev => ({
            ...prev,
            total_users: statsData.total_users,
            female_users: statsData.female_users,
            male_users: statsData.male_users,
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
    <div className="profile-page">
      <header>
        <Link to="/" className="back-button">{t('back.home')}</Link>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-description">{t('profile.subtitle')}</p>
      </header>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getAvatarEmoji()}
          </div>
          <h2>{userProfile?.name || user?.name}</h2>
          <span className="user-role">
            {getSpecialRole()}
          </span>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">{t('profile.id')}</span>
            <span className="info-value">{user?.user_id}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">{t('profile.name')}</span>
            <span className="info-value">{userProfile?.name || user?.name}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">{t('profile.age')}</span>
            <span className="info-value">{userProfile?.age || t('profile.age.unknown')}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">{t('profile.gender')}</span>
            <span className="info-value">
              {userProfile?.gender === 'женский' ? t('profile.gender.female') : 
               userProfile?.gender === 'мужской' ? t('profile.gender.male') : t('profile.gender.unknown')}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">{t('profile.email')}</span>
            <span className="info-value">{userProfile?.email || 'Не указан'}</span>
          </div>
          
          {userProfile?.gender === 'женский' && (
            <div className="info-item special-role">
              <span className="info-label">{t('profile.role.special')}</span>
              <span className="info-value special">{t('profile.role.pretty')}</span>
            </div>
          )}
        </div>

        <div className="profile-stats">
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

          {userProfile?.gender === 'женский' && (
            <div className="special-notice">
              <div className="special-icon">💫</div>
              <div className="special-text">
                <strong>{t('profile.notice.title')}</strong><br />
                {t('profile.notice.text')}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <Link to="/users" className="action-button">{t('profile.actions.users')}</Link>
          <Link to="/leisure" className="action-button secondary">{t('profile.actions.leisure')}</Link>
          <Link to="/" className="action-button secondary">{t('profile.actions.home')}</Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
