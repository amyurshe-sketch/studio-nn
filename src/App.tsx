import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import UsersPage from './UsersPage';
import ProfilePage from './ProfilePage';
import LeisurePage from './LeisurePage';
// Removed password/username auth pages
import MessageButton from './components/MessageButton';
import TelegramLoginModal from './components/TelegramLoginModal';
import TelegramIcon from './components/icons/TelegramIcon';
import { useAuth } from './hooks/useAuth';
import { usePresence } from './hooks/usePresence';
import { useNotifications } from './hooks/useNotifications';
import NotificationsModal from './components/NotificationsModal';
import { ButtonText } from './components/ButtonText';
import HomePage from './HomePage';
import StatsPage from './StatsPage';
import TgCallbackPage from './TgCallbackPage';
import { useI18n } from './i18n';
import { API_UNCONFIGURED, API_BASE_URL } from './lib/env';

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppShell() {
  const { isAuthenticated, user, logout } = useAuth();
  // Messaging removed; presence via WS heartbeat
  usePresence();
  const { items: notifItems, ack: ackNotif } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showTgModal, setShowTgModal] = useState(false);
  const { t, language, setLanguage } = useI18n();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('app_theme') || 'light';
  });
  // Messaging removed
  const location = useLocation();

  const unreadCount = 0;

  const handleUserNameClick = () => {};

  // Обработчик закрытия окна уведомлений
  const handleNotificationsClose = () => {};

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ru' ? 'en' : 'ru'));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // language is handled by I18nProvider

  // Expose opener for HomePage buttons
  useEffect(() => {
    (window as any).__openTelegramLogin = () => setShowTgModal(true);
    return () => { delete (window as any).__openTelegramLogin; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`App ${isAuthenticated ? 'App--auth' : ''}`}>
        {/* Protective banner if backend is not configured */}
        {API_UNCONFIGURED && (
          <div
            style={{
              background: 'linear-gradient(90deg, #fde68a, #f59e0b)',
              color: '#111827',
              padding: '8px 16px',
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            Backend is not configured. Set VITE_API_BASE_URL and VITE_WS_URL in your deployment.
          </div>
        )}
        <header className="main-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="logo">{t('app.logo')}</h1>
              {isAuthenticated && (
                <nav className="main-nav">
                  <ButtonText as={Link} to="/users">{t('nav.users')}</ButtonText>
                  <ButtonText as={Link} to="/profile">{t('nav.profile')}</ButtonText>
                  <ButtonText as={Link} to="/leisure">{t('nav.leisure')}</ButtonText>
                </nav>
              )}
            </div>
            
            <div className="header-right">
              <div className="header-controls">
                <div className="header-control-group">
                  <button
                    type="button"
                    className="header-control-button"
                    onClick={toggleLanguage}
                    title={language === 'ru' ? t('header.lang.tooltip_en') : t('header.lang.tooltip_ru')}
                  >
                    {language === 'ru' ? 'EN' : 'RU'}
                  </button>
                </div>
                <button
                  type="button"
                  className="header-control-button"
                  onClick={toggleTheme}
                  title={theme === 'light' ? t('theme.tooltip.dark') : t('theme.tooltip.light')}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
              {!isAuthenticated ? (
                <>
                  <MessageButton
                    className="register-button"
                    onClick={() => setShowTgModal(true)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <TelegramIcon /> {t('auth.login.telegram')}
                    </span>
                  </MessageButton>
                </>
              ) : (
                <div className="user-menu">
                  <div className="user-info-container">
                    <span className="user-name">
                      <strong>{user?.name}</strong>
                    </span>
                    {/* Removed SSE online indicator */}
                  </div>
                  <button
                    type="button"
                    className="header-control-button"
                    onClick={() => setIsNotifOpen(true)}
                    title={t('notifications.title')}
                    aria-label={`${t('notifications.title')}: ${notifItems.length}`}
                    style={{ position: 'relative' }}
                  >
                    🔔
                    {notifItems.length > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 9999,
                          background: '#ef4444',
                          color: 'white',
                          fontSize: 10,
                          lineHeight: '16px',
                          textAlign: 'center',
                          padding: '0 4px',
                          fontWeight: 700,
                        }}
                      >
                        {notifItems.length}
                      </span>
                    )}
                  </button>
                  {/* Desktop logout button; hidden on mobile */}
                  <MessageButton onClick={logout} className="logout-desktop">
                    {t('auth.logout')}
                  </MessageButton>
                  {/* Mobile burger toggle */}
                  <button
                    type="button"
                    className="header-control-button mobile-nav-toggle"
                    aria-label="Open menu"
                    onClick={() => setMobileNavOpen(true)}
                    title="Menu"
                  >
                    ☰
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <div key={location.pathname} className="page-transition">
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tg-callback" element={<TgCallbackPage />} />
              {/* Password auth routes removed */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leisure"
                element={
                  <ProtectedRoute>
                    <LeisurePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>

        {/* Messaging/notifications UI removed */}
        <NotificationsModal
          open={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          items={notifItems}
          onAck={ackNotif}
        />

        {/* Mobile drawer navigation */}
        {isAuthenticated && mobileNavOpen && (
          <>
            <div className="mobile-overlay" onClick={() => setMobileNavOpen(false)} />
            <nav className="mobile-drawer" role="dialog" aria-modal="true">
              <div className="mobile-drawer__header">
                <span className="mobile-drawer__title">{t('app.logo')}</span>
                <button className="mobile-drawer__close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">×</button>
              </div>
              <div className="mobile-drawer__links">
                <Link to="/users" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{t('nav.users')}</Link>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{t('nav.profile')}</Link>
                <Link to="/leisure" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{t('nav.leisure')}</Link>
              </div>
              <div className="mobile-drawer__footer">
                <button className="mobile-nav-link mobile-nav-link--danger" onClick={() => { setMobileNavOpen(false); logout(); }}>
                  {t('auth.logout')}
                </button>
              </div>
            </nav>
          </>
        )}

        {/* Telegram Login Modal */}
        <TelegramLoginModal open={showTgModal} onClose={() => setShowTgModal(false)} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
