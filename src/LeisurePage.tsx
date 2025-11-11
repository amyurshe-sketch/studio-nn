import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useNews } from './hooks/useNews';
import './leisure-styles.css';
import { useI18n, getLocale } from './i18n';
import { API_BASE_URL } from './lib/env';

function LeisurePage() {
  const { language, t } = useI18n();
  const { user } = useAuth();
  // Источники: RU → CNews/Habr, EN → Wired/Ars
  const isEn = language === 'en';
  const leftSource = isEn ? 'wired' : 'cnews';
  const rightSource = isEn ? 'ars' : 'habr';
  // Берем из БД; автообновление отключено — сервер освежает раз в сутки по первому запросу
  const { news: leftNews,  loading: leftLoading,  error: leftError }  = useNews(leftSource, 5, { auto: false });
  const { news: rightNews, loading: rightLoading, error: rightError } = useNews(rightSource, 5, { auto: false });
  // Mobile-only: show one news column at a time, with toggle
  const [mobileShown, setMobileShown] = useState<'left' | 'right'>('left');
  
  const [leisureTheme, setLeisureTheme] = useState('light');
  const [themeCycle] = useState(['light', 'dark', 'night']);
  const [quote, setQuote] = useState<{ text: string; author?: string } | null>(null);

  // Автоматическая синхронизация с глобальной темой при загрузке
  useEffect(() => {
    const globalTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setLeisureTheme(globalTheme);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/quotes/random?lang=${encodeURIComponent(language)}` as any, { credentials: 'include' });
        if (!r.ok) throw new Error('Failed to load quote');
        const j = await r.json();
        if (!cancelled) setQuote(j);
      } catch {
        if (!cancelled) setQuote(null);
      }
    })();
    return () => { cancelled = true; };
  }, [language]);

  const toggleLeisureTheme = () => {
    setLeisureTheme(prev => {
      const currentIndex = themeCycle.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themeCycle.length;
      return themeCycle[nextIndex];
    });
  };

  const getThemeIcon = () => {
    switch(leisureTheme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'night': return '🌌';
      default: return '🎨';
    }
  };

  const getThemeName = () => {
    switch(leisureTheme) {
      case 'light': return t('leisure.theme.light');
      case 'dark': return t('leisure.theme.dark');
      case 'night': return t('leisure.theme.night');
      default: return t('leisure.theme.light');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(getLocale(language as any), {
      day: 'numeric',
      month: 'long'
    });
  };

  const cleanHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="leisure-page" data-leisure-theme={leisureTheme}>
      <header>
        <h1 className="page-title">{t('leisure.title', { name: user?.name || '' })}</h1>
        <p className="page-description">{t('leisure.subtitle')}</p>
        
        {/* Блок индикации/переключения темы скрыт по просьбе пользователя */}
      </header>

      <div className="leisure-content">
        {/* Две колонки новостей */}
        <div className="news-columns-container">
          
          {/* Левая колонка - CNews */}
          <div className={"news-column news-column-left " + (mobileShown === 'left' ? 'mobile-visible' : 'mobile-hidden')}>
            <h2 className="content-title">
              {t('leisure.col.left')}
              <button
                type="button"
                className="news-toggle-btn mobile-only"
                title="Сменить блок новостей"
                aria-label="Сменить блок новостей"
                onClick={() => setMobileShown('right')}
              >
                ⇆
              </button>
            </h2>
            {leftLoading && <p className="news-loading">{t('leisure.loading.cnews')}</p>}
            {leftError && <p className="news-error">❌ {leftError}</p>}
            {!leftLoading && !leftError && leftNews.map((item) => (
              <div key={item.id} className="news-content-item">
                <h3 className="news-content-title">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                {item.summary && (
                  <p className="news-content-summary">
                    {cleanHtml(item.summary)}
                  </p>
                )}
                <div className="news-content-meta">
                  {formatDate(item.published_at)}
                </div>
              </div>
            ))}
          </div>

          {/* Правая колонка - Habr */}
          <div className={"news-column news-column-right " + (mobileShown === 'right' ? 'mobile-visible' : 'mobile-hidden')}>
            <h2 className="content-title">
              {t('leisure.col.right')}
              <button
                type="button"
                className="news-toggle-btn mobile-only"
                title="Сменить блок новостей"
                aria-label="Сменить блок новостей"
                onClick={() => setMobileShown('left')}
              >
                ⇆
              </button>
            </h2>
            {rightLoading && <p className="news-loading">{t('leisure.loading.habr')}</p>}
            {rightError && <p className="news-error">❌ {rightError}</p>}
            {!rightLoading && !rightError && rightNews.map((item) => (
              <div key={item.id} className="news-content-item">
                <h3 className="news-content-title">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                {item.summary && (
                  <p className="news-content-summary">
                    {cleanHtml(item.summary)}
                  </p>
                )}
                <div className="news-content-meta">
                  {formatDate(item.published_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Секция интересных фактов */}
        <div className="fun-facts">
          <h3>{t('leisure.facts.title')}</h3>
          <div className="facts-grid">
            <div className="fact-card">
              <span className="fact-emoji">💡</span>
              <p>{t('leisure.fact.1')}</p>
            </div>
            <div className="fact-card">
              <span className="fact-emoji">⌨️</span>
              <p>{t('leisure.fact.2')}</p>
            </div>
            <div className="fact-card">
              <span className="fact-emoji">🌐</span>
              <p>{t('leisure.fact.3')}</p>
            </div>
            <div className="fact-card">
              <span className="fact-emoji">📧</span>
              <p>{t('leisure.fact.4')}</p>
            </div>
          </div>
        </div>

        {/* Секция быстрых действий */}
        <div className="quick-actions">
          <h3>{t('leisure.actions.title')}</h3>
          <div className="actions-grid">
            <div className="action-card">
              <span className="action-emoji">🎵</span>
              <div>
                <h4>{t('leisure.actions.music.title')}</h4>
                <p>{t('leisure.actions.music.text')}</p>
              </div>
            </div>
            <Link to="/mini-games" className="action-card" style={{ textDecoration: 'none' }}>
              <span className="action-emoji">🎮</span>
              <div>
                <h4>{t('leisure.actions.games.title')}</h4>
                <p>{t('leisure.actions.games.text')}</p>
              </div>
            </Link>
            <div className="action-card disabled">
              <span className="action-emoji">🧘</span>
              <div>
                <h4>{t('leisure.actions.exercises.title')}</h4>
                <p>{t('leisure.actions.exercises.text')}</p>
              </div>
              <span className="coming-badge">{t('leisure.actions.soon')}</span>
            </div>
          </div>
        </div>

        {/* Мотивационная секция */}
        <div className="motivation-section">
          <h3>{t('leisure.motivation.title')}</h3>
          <blockquote className="motivation-quote">
            {quote?.text || t('leisure.motivation.quote')}
            <footer>{quote?.author || t('leisure.motivation.author')}</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default LeisurePage;
