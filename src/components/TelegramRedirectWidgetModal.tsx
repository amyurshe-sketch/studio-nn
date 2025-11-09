import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';

type Props = {
  open: boolean;
  onClose: () => void;
  botUsername?: string; // falls back to env
};

export default function TelegramRedirectWidgetModal({ open, onClose, botUsername }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const bot = botUsername || (import.meta as any).env?.VITE_TG_BOT_USERNAME;
  const [loadError, setLoadError] = useState<string | null>(null);
  const { language } = useI18n();

  useEffect(() => {
    if (!open) return;
    if (!hostRef.current) return;
    if (!bot) {
      setLoadError('Бот не настроен на фронтенде (VITE_TG_BOT_USERNAME).');
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', bot);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-lang', language === 'en' ? 'en' : 'ru');
    s.setAttribute('data-radius', '8');
    // Redirect mode: send user to our callback with auth params
    const origin = window.location.origin.replace(/\/$/, '');
    s.setAttribute('data-auth-url', origin + '/tg-callback');
    s.onerror = () => setLoadError('Не удалось загрузить скрипт Telegram Widget. Проверьте блокировщики/сеть.');
    hostRef.current.innerHTML = '';
    hostRef.current.appendChild(s);

    return () => {
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [open, bot, language]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', color: '#0f172a', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        {loadError ? (
          <div style={{ maxWidth: 360 }}>
            <p style={{ marginBottom: 12 }}>{loadError}</p>
            {bot && (
              <a
                href={`https://oauth.telegram.org/auth?bot=${encodeURIComponent(bot)}&origin=${encodeURIComponent(window.location.origin)}&embed=1&request_access=write&return_to=${encodeURIComponent(window.location.origin + '/tg-callback')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: '#229ED9',
                  color: 'white',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Открыть Telegram Login
              </a>
            )}
            <p style={{ marginTop: 10, fontSize: 12, color: '#475569' }}>
              Подсказки: отключите блокировщики, разрешите загрузку с telegram.org, проверьте VPN/сетевые ограничения.
            </p>
          </div>
        ) : (
          <div ref={hostRef} />
        )}
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', borderRadius: 8, background: '#e2e8f0' }}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

