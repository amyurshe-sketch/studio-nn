import React, { useCallback, useState } from 'react';
import { useI18n } from './i18n';
import { API_BASE_URL } from './lib/env';
import './AiChatPage.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const AiChatPage = () => {
  const { t } = useI18n();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          chat_id: chatId,
          channel: 'web',
        }),
        credentials: 'include',
      });
      const text = await resp.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Ignore JSON parse errors; handled below
      }
      if (!resp.ok) {
        throw new Error(data?.detail || 'Не удалось получить ответ от ИИ');
      }
      setAnswer(data.answer || '');
      setChatId(data.chat_id || null);
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.answer || '' },
      ]);
      setMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  }, [message, history, chatId]);

  return (
    <div className="ai-chat">
      <div className="ai-chat__card">
        <p className="ai-chat__eyebrow">{t('ai.eyebrow')}</p>
        <h1 className="ai-chat__title">{t('ai.title')}</h1>
        <p className="ai-chat__subtitle">
          {t('ai.subtitle')}
        </p>

        <div className="ai-chat__prompt">
          <label className="ai-chat__label" htmlFor="ai-message">
            Текст запроса
          </label>
          <textarea
            id="ai-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спросите что угодно…"
            rows={3}
          />
          <div className="ai-chat__actions">
            <button
              type="button"
              className="ai-chat__cta"
              onClick={handleSend}
              disabled={loading}
            >
              <span>{t('ai.cta.line1')}</span>
              <span>{t('ai.cta.line2')}</span>
            </button>
            {loading && <span className="ai-chat__status">Отправка…</span>}
            {error && <span className="ai-chat__status ai-chat__status--error">{error}</span>}
          </div>
        </div>

        {answer && (
          <div className="ai-chat__answer">
            <div className="ai-chat__answer-label">Ответ</div>
            <p>{answer}</p>
          </div>
        )}

        <div className="ai-chat__meta">
          <span>{t('ai.meta.availability')}</span>
          <span className="ai-chat__dot" />
          <span>{t('ai.meta.updated')}</span>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
