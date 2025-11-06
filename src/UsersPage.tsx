import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useApiData } from './hooks/useApiData';
import { useAuth } from './hooks/useAuth';
import { wsClient } from './lib/wsClient';
import { API_BASE_URL } from './lib/env';
import UserCard from './components/UserCard';
import { Link, useNavigate } from 'react-router-dom';
import { ButtonText } from './components/ButtonText';
import MessageButton from './components/MessageButton';
import { useI18n } from './i18n';

function UsersPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [aggregatedUsers, setAggregatedUsers] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  // Messaging removed
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all'); // all | male | female
  const [currentUserAge, setCurrentUserAge] = useState(null);
  const pageLimit = 5;
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const genderMenuRef = useRef(null);
  const autoFetchRef = useRef(false);
  const scrollRestoreRef = useRef(null);
  
  const { users: pageUsers = [], loading, error, pagination } = useApiData(currentPage, pageLimit);
  // SSE removed; rely on API flags if present

  // Новые состояния для загрузки всех пользователей без пагинации
  const [allUsers, setAllUsers] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState(null);

  const handleSendNotification = () => {};

  const handleNotificationSubmit = async () => {};

  const handleCloseModal = () => {};

  useEffect(() => {
    if (!loading) {
      setAggregatedUsers(prev => {
        if (currentPage === 1 || prev.length === 0) {
          return pageUsers;
        }
        const existingIds = new Set(prev.map(user => user.id));
        const newUsers = pageUsers.filter(user => !existingIds.has(user.id));
        return [...prev, ...newUsers];
      });
    }
  }, [pageUsers, loading, currentPage]);

  // Загрузка всех пользователей (без пагинации): последовательно проходим все страницы
  useEffect(() => {
    let cancelled = false;
    const fetchAllUsers = async () => {
      try {
        setAllLoading(true);
        setAllError(null);

        const limit = 100; // разумный размер страницы для пачек
        let pageNum = 1;
        const collected = [];

        while (true) {
          // Prefer WS; fallback to HTTP
          let data: any;
          if (!authUser?.user_id) { break; }
          if (!wsClient.isReady()) {
            await wsClient.connect().catch(() => {});
          }
          data = await wsClient.request('users.with_info', { page: pageNum, limit });
          if (cancelled) return;

          if (Array.isArray(data.users) && data.users.length > 0) {
            collected.push(...data.users);
          }

          if (!data.pagination?.has_next) {
            break;
          }
          pageNum += 1;
        }

        if (!cancelled) {
          setAllUsers(collected);
        }
      } catch (e) {
        if (!cancelled) {
          setAllError(e.message || 'Ошибка при загрузке данных');
        }
      } finally {
        if (!cancelled) {
          setAllLoading(false);
        }
      }
    };

    fetchAllUsers();
    return () => { cancelled = true; };
  }, [authUser?.user_id]);

  useEffect(() => {
    setDisplayCount(5);
  }, [showOnlineOnly]);

  useEffect(() => {
    if (genderFilter === 'all') {
      setDisplayCount(5);
    }
  }, [genderFilter]);

  // Если все пользователи загружены, используем их; иначе — прежний механизм
  const baseUsers = allUsers.length > 0 ? allUsers : (aggregatedUsers.length > 0 ? aggregatedUsers : pageUsers);

  // SSE removed; use API-provided is_online if available
  const usersWithStatus = baseUsers.map(user => ({ ...user, is_online: !!user.is_online }));

  const visibleUsers = usersWithStatus.filter(user => user.id !== authUser?.user_id);

  useEffect(() => {
    if (!authUser?.user_id) {
      setCurrentUserAge(null);
      return;
    }

    let isCancelled = false;

    const fetchCurrentUserAge = async () => {
      try {
        if (!wsClient.isReady()) {
          await wsClient.connect().catch(() => {});
        }
        const profile = await wsClient.request('user.profile', { user_id: authUser.user_id });
        if (!isCancelled) {
          setCurrentUserAge(typeof profile.age === 'number' ? profile.age : null);
        }
      } catch (err) {
        if (!isCancelled) {
          setCurrentUserAge(null);
        }
      }
    };

    fetchCurrentUserAge();

    return () => {
      isCancelled = true;
    };
  }, [authUser?.user_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderMenuRef.current && !genderMenuRef.current.contains(event.target)) {
        setShowGenderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOnlineToggle = () => {
    setShowOnlineOnly(prev => !prev);
    setCurrentPage(1);
    setAggregatedUsers([]);
    setDisplayCount(5);
  };

  const filteredUsers = visibleUsers.filter(user => {
    if (showOnlineOnly && !user.is_online) {
      return false;
    }

    if (genderFilter === 'male' && user.gender !== 'мужской') {
      return false;
    }

    if (genderFilter === 'female' && user.gender !== 'женский') {
      return false;
    }

    return true;
  });

  const showAllByGender = genderFilter !== 'all';
  // Без пагинации: отображаем все отфильтрованные элементы сразу
  const displayedUsers = filteredUsers;
  const hasMoreToDisplay = false;
  const canFetchMore = false;
  const showLoadMoreButton = false;

  // Подсчет онлайн пользователей на текущем видимом наборе
  const onlineCountOnPage = displayedUsers.filter(user => user.is_online).length;

  const handleGenderSelect = (value) => {
    setGenderFilter(value);
    setShowGenderMenu(false);
    setCurrentPage(1);
    setAggregatedUsers([]);
    if (value === 'all') {
      setDisplayCount(5);
    }
  };

  // Подпись для кнопки выбора пола
  const genderLabels = {
    all: t('users.filter.gender.all'),
    male: t('users.filter.gender.male'),
    female: t('users.filter.gender.female'),
  };

  const handleLoadMore = useCallback(() => {
    if (loading) return;
    if (currentUserAge !== null && currentUserAge < 18) return;
    if (genderFilter !== 'all') return;

    if (typeof window !== 'undefined') {
      scrollRestoreRef.current = window.scrollY;
    }

    const nextDisplay = displayCount + 5;
    if (!showOnlineOnly && pagination?.has_next && filteredUsers.length <= displayCount) {
      setCurrentPage(prev => prev + 1);
    }
    setDisplayCount(nextDisplay);
  }, [displayCount, filteredUsers.length, loading, pagination, showOnlineOnly, genderFilter, currentUserAge]);

  useLayoutEffect(() => {
    if (scrollRestoreRef.current === null || typeof window === 'undefined') {
      return;
    }

    const target = scrollRestoreRef.current;
    scrollRestoreRef.current = null;

    requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: 'auto' });
    });
  }, [displayCount, aggregatedUsers.length]);

  useEffect(() => {
    const shouldAutoFetch = showOnlineOnly || genderFilter !== 'all';
    if (!shouldAutoFetch || loading) {
      autoFetchRef.current = false;
      return;
    }

    if (pagination?.has_next && !autoFetchRef.current) {
      autoFetchRef.current = true;
      setCurrentPage(prev => prev + 1);
    }
  }, [showOnlineOnly, genderFilter, loading, pagination]);

  if (error || allError) return <div className="error">{t('profile.error')} {allError || error}</div>;

  return (
    <div className="users-page page-elevated">
      <header>
        <Link to="/" className="back-button">{t('back.home')}</Link>
        <h1 className="page-title">{t('users.title')}</h1>
        <p className="page-description">{t('users.subtitle')}</p>
      </header>
      
      {/* Контент */}
      <div className="users-content">
        <div className="user-filters">
          <MessageButton
            onClick={handleOnlineToggle}
            className={`filter-button-message ${showOnlineOnly ? 'filter-button-message--active' : ''}`}
            aria-pressed={showOnlineOnly}
          >
            {showOnlineOnly ? t('users.filter.offline') : t('users.filter.online')}
          </MessageButton>

          <div
            className={`filter-dropdown ${showGenderMenu ? 'filter-dropdown--open' : ''}`}
            ref={genderMenuRef}
          >
            <MessageButton
              onClick={() => setShowGenderMenu(prev => !prev)}
              className={`filter-button-message filter-button-message--dropdown ${(showGenderMenu || genderFilter !== 'all') ? 'filter-button-message--active' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={showGenderMenu}
            >
              <span className="filter-button-message__label">{t('users.filter.gender')} {genderLabels[genderFilter]}</span>
              <span className="filter-button-message__caret" aria-hidden="true">▾</span>
            </MessageButton>

            {showGenderMenu && (
              <div className="filter-dropdown__menu" role="listbox">
                <button
                  type="button"
                  className={`filter-dropdown__option ${genderFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => handleGenderSelect('all')}
                >
                  {t('users.filter.gender.all')}
                </button>
                <button
                  type="button"
                  className={`filter-dropdown__option ${genderFilter === 'male' ? 'is-active' : ''}`}
                  onClick={() => handleGenderSelect('male')}
                >
                  {t('users.filter.gender.male')}
                </button>
                <button
                  type="button"
                  className={`filter-dropdown__option ${genderFilter === 'female' ? 'is-active' : ''}`}
                  onClick={() => handleGenderSelect('female')}
                >
                  {t('users.filter.gender.female')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          key={`${showOnlineOnly}-${genderFilter}-${filteredUsers.length}`}
          className="users-list"
          data-animate={(!loading && filteredUsers.length > 0) ? 'true' : 'false'}
        >
          {displayedUsers.length === 0 ? (
            <div className="no-users">{t('users.empty')}</div>
          ) : (
            displayedUsers.map((user, index) => (
              <UserCard 
                key={user.id} 
                name={user.name} 
                age={user.age} 
                gender={user.gender}
                is_online={user.is_online}
                userId={user.id}
                rowIndex={index}
              />
            ))
          )}
        </div>

        {showLoadMoreButton && (
          <div className="load-more-container">
            <ButtonText
              as="button"
              onClick={handleLoadMore}
              disabled={
                loading ||
                (!hasMoreToDisplay && !canFetchMore) ||
                (currentUserAge !== null && currentUserAge < 18)
              }
              className="load-more-button"
            >
              {t('users.loadMore')}
            </ButtonText>
          </div>
        )}

        {/* Индикатор загрузки для пагинации */}
        {(loading || allLoading) && (
          <div className="users-loading-backdrop">
            <div className="users-loading-indicator">
              <span className="loading-spinner">⏳</span>
              <span className="users-loading-text">{t('users.loading')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Информация о пагинации и онлайн-статус */}
      <div className="page-footer">
        <div className="online-stats-footer">
          <span className="online-count">
            {t('users.footer.prefix')} {onlineCountOnPage} <ButtonText as={Link} to="/stats">{t('users.footer.of')}</ButtonText> {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Messaging modal removed */}
    </div>
  );
}

export default UsersPage;
