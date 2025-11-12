import React, { useState, useCallback } from 'react';
import { ButtonText } from './components/ButtonText';
import MessageModal from './components/MessageModal';
import Black from './components/Black';
import MessageButton from './components/MessageButton';
import AnswerModal from './components/AnswerModal';
import NotificationsModal from './components/NotificationsModal';
import { useNotifications } from './hooks/useNotifications';
import ThreadModal from './components/ThreadModal';
import { API_BASE_URL } from './lib/env';
import { useI18n } from './i18n';


function StatsPage() {
  const { t, language } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { items: notifItems, ack: ackNotif } = useNotifications();

  const handleOpen = useCallback(() => setIsModalOpen(true), []);
  const handleClose = useCallback(() => setIsModalOpen(false), []);
  const openAnswer = useCallback(() => setIsAnswerOpen(true), []);
  const closeAnswer = useCallback(() => setIsAnswerOpen(false), []);
  const openThread = useCallback(() => setIsThreadOpen(true), []);
  const closeThread = useCallback(() => setIsThreadOpen(false), []);
  
  const handleSend = useCallback((payload: { to: string; subject: string; body: string }) => {
    // В реальном проекте можно отправить на API; здесь просто лог
    try { console.log('MessageModal send:', payload); } catch {}
  }, []);

  const runSelfTest = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/self-test`, { credentials: 'include' });
      const j = await res.json();
      alert(
        `${t('test.run')}:\n` +
        `API: ${j.api_ok ? 'OK' : 'FAIL'}\n` +
        `DB: ${j.db_ok ? 'OK' : 'FAIL'}\n` +
        `Redis: ${j.redis_ok === null ? 'N/A' : (j.redis_ok ? 'OK' : 'FAIL')}\n` +
        `${language === 'ru' ? 'Авторизован' : 'Auth'}: ${j.authenticated ? 'YES' : 'NO'}`
      );
    } catch (e) {
      alert('Self-test failed to run');
    }
  }, [t, language]);


  return (
    <div className="stats-page">
      <div className="stats-page__media">
        <img
          src={`${process.env.PUBLIC_URL || ''}/7.jpeg`}
          alt="Демонстрационное изображение"
          className="stats-page__image"
        />
      </div>
      <div className="stats-page__preview-grid">
        <div className="stats-page__preview-item">
          <span className="stats-page__preview-label">ButtonText</span>
          <ButtonText className="stats-page__preview-button" onClick={handleOpen}>ButtonText</ButtonText>
        </div>
        <div className="stats-page__preview-item">
          <span className="stats-page__preview-label">Black</span>
          <Black onClick={openThread}>Black</Black>
        </div>
        <div className="stats-page__preview-item">
          <span className="stats-page__preview-label">MessageButton</span>
          <MessageButton onClick={openAnswer}>MessageButton</MessageButton>
        </div>
        <div className="stats-page__preview-item">
          <span className="stats-page__preview-label">Notifications</span>
          <MessageButton onClick={() => setIsNotifOpen(true)}>Показать новые</MessageButton>
        </div>
        <div className="stats-page__preview-item">
          <span className="stats-page__preview-label">Self-test</span>
          <MessageButton onClick={runSelfTest}>{t('test.run')}</MessageButton>
        </div>
      </div>

      <MessageModal
        open={isModalOpen}
        onClose={handleClose}
        onSend={handleSend}
        dimBackground={true}
        closeOnBackdrop={true}
      />

      <AnswerModal open={isAnswerOpen} onClose={closeAnswer} title="Ответ" />

      <NotificationsModal
        open={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        items={notifItems}
        onAck={ackNotif}
      />

      <ThreadModal
        open={isThreadOpen}
        onClose={closeThread}
        messages={[
          { id: 'm1', from: 'Alex', text: 'Привет! Есть минутка?', ts: Date.now() - 120000 },
          { id: 'm2', from: 'You', text: 'Да, слушаю тебя 👋', ts: Date.now() - 90000 },
          { id: 'm3', from: 'Alex', text: 'Хотел уточнить по макетам…', ts: Date.now() - 45000 },
        ]}
        senderName="Alex"
        dimBackground={true}
        closeOnBackdrop={true}
      />
    </div>
  );
}

export default StatsPage;
