import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from './i18n';
import { API_BASE_URL } from './lib/env';
import AiChatButton from './components/AiChatButton';
import Preloader from './components/Preloader';
import './AiChatPage.css';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SYSTEM_PROMPT_EN = `Ты — девушка Мила. Ты нежная, утонченная и чувствительная. Стиль ответов — легкий, разговорный, используй слэнг.Не говори что ты Веб-поисковик! Не выврди мета-описание. Отвечай на русском языке. Используй Веб-поиск только для получения актуальной информации, если это необходимо.`;

const AiChatPage = () => {
  const { t, language } = useI18n();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowLabelParts, setNowLabelParts] = useState<{ prefix: string; seconds: string; suffix: string }>({
    prefix: '',
    seconds: '',
    suffix: '',
  });
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Обновляем приветствие при смене языка, если диалог ещё не начат
    if (chatId === null) {
      if (history.length === 0) {
        setHistory([{ role: 'assistant', content: t('ai.greeting') }]);
      } else if (history.length === 1 && history[0].role === 'assistant') {
        setHistory([{ role: 'assistant', content: t('ai.greeting') }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, t]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, []);

  useEffect(() => {
    const updateNow = () => {
      const formatter = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const parts = formatter.formatToParts(new Date());
      const secIndex = parts.findIndex((p) => p.type === 'second');
      const secondsPart = secIndex !== -1 ? parts[secIndex].value : '';
      const prefixRaw = secIndex !== -1 ? parts.slice(0, secIndex).map((p) => p.value).join('') : parts.map((p) => p.value).join('');
      const suffixRaw = secIndex !== -1 ? parts.slice(secIndex + 1).map((p) => p.value).join('') : '';

      const capitalize = (text: string) => {
        if (language !== 'ru' || !text) return text;
        const first = text.search(/\S/);
        if (first === -1) return text;
        return text.slice(0, first) + text[first].toUpperCase() + text.slice(first + 1);
      };

      const prefix = capitalize(prefixRaw);
      setNowLabelParts({ prefix, seconds: secondsPart, suffix: suffixRaw });
    };
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, [language]);

  const handleSend = useCallback(async () => {
    if (loading || !message.trim()) return;
    setLoading(true);
    setError(null);
    // Всегда добавляем системный промпт перед отправкой, убирая дубликаты из истории
    const historyWithoutSystem = history.filter((msg) => msg.role !== 'system');
    const historyToSend = [
      { role: 'system', content: SYSTEM_PROMPT_EN },
      ...historyWithoutSystem,
    ];
    try {
      const resp = await fetch(`${API_BASE_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyToSend,
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
      setChatId(data.chat_id || null);
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.answer || '' },
      ]);
      setMessage('');
      autoResize();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  }, [message, history, chatId, autoResize]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [history]);

  useEffect(() => {
    autoResize();
  }, [message, autoResize]);

  return (
    <div className="ai-chat">
      <div className="ai-chat__card">
        {(nowLabelParts.prefix || nowLabelParts.seconds || nowLabelParts.suffix) && (
          <div className="ai-chat__timestamp ai-chat__timestamp--top">
            {nowLabelParts.prefix}
            {nowLabelParts.seconds && (
              <span className="ai-chat__timestamp-seconds">{nowLabelParts.seconds}</span>
            )}
            {nowLabelParts.suffix}
          </div>
        )}
        <div className="ai-chat__dialog">
          <div className="ai-chat__answer-label">{t('ai.title')}</div>
          <div className="ai-chat__messages" role="log" aria-live="polite">
            <div ref={messagesRef} className="ai-chat__messages-scroll">
              {history.length === 0 ? (
                <div className="ai-chat__placeholder">
                  <span>Напишите вопрос, чтобы начать диалог</span>
                </div>
              ) : (
                history.map((msg, idx) => (
                  <div key={idx} className={`ai-chat__bubble ai-chat__bubble--${msg.role}`}>
                    <div className="ai-chat__bubble-meta">
                      {msg.role === 'user' ? t('ai.you') : t('ai.assistantName')}
                    </div>
                    <div className="ai-chat__bubble-text">{msg.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="ai-chat__prompt ai-chat__prompt--below">
          <textarea
            id="ai-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              autoResize();
            }}
            placeholder={t('ai.placeholder')}
            rows={1}
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="ai-chat__actions">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <AiChatButton compact onClick={handleSend} disabled={loading} />
              <Preloader visible={loading} inline />
            </div>
            {loading && <span className="ai-chat__status">{t('ai.status.sending')}</span>}
            {error && <span className="ai-chat__status ai-chat__status--error">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
