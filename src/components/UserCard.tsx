import React, { useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import MessageButton from './MessageButton';
import MessageModal from './MessageModal';
import { wsClient } from '../lib/wsClient';
type Props = {
  name: string;
  age?: number | string | null;
  gender?: string;
  is_online?: boolean;
  userId: number;
  rowIndex?: number;
};

function UserCard({ name, age, gender, is_online, userId, rowIndex = 0 }: Props) {
  const { user } = useAuth();
  const genderEmoji = gender === 'женский' ? '👩' : gender === 'мужской' ? '👨' : '⚧';
  const genderLabel = gender ? `${genderEmoji} ${gender}` : '⚧ не указан';
  
  // Не показывать кнопку самому себе
  const isCurrentUser = user?.user_id === userId;

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const openMessage = useCallback(() => setIsMessageOpen(true), []);
  const closeMessage = useCallback(() => setIsMessageOpen(false), []);
  const handleSend = useCallback(async (payload: { to: string; subject: string; body: string }) => {
    const text = payload.body?.trim();
    if (!text) return;
    try {
      if (!user?.user_id) return;
      if (!wsClient.isReady()) {
        await wsClient.connect().catch(() => {});
      }
      await wsClient.request('notifications.send', { receiver_id: userId, message_text: text });
    } catch (e) {
      try { console.error('Send notification error', e); } catch {}
    }
  }, [user?.user_id, userId]);

  const style: React.CSSProperties & { ['--row-index']?: string } = { ['--row-index']: rowIndex.toString() } as any;

  return (
    <div
      className={`user-row ${is_online ? 'user-row--online' : 'user-row--offline'}`}
      tabIndex={0}
      data-user-id={userId}
      style={style}
    >
      <div className="user-row__summary">
        <span className="user-row__index">{rowIndex + 1}.</span>
        <span className="user-row__name">{name}</span>
        <span className={`user-row__status ${is_online ? 'user-row__status--online' : 'user-row__status--offline'}`}>
          {is_online ? 'online' : 'offline'}
        </span>
      </div>

      {!isCurrentUser && (
        <div className="user-row__actions" style={{ marginLeft: 'auto' }}>
          <MessageButton onClick={openMessage}>написать</MessageButton>
        </div>
      )}

      <MessageModal
        open={isMessageOpen}
        onClose={closeMessage}
        onSend={handleSend}
        initialTo={name}
        lockTo={true}
        dimBackground={true}
        closeOnBackdrop={true}
      />

      <div className="user-row__tooltip">
        <div className="user-row__tooltip-title">Быстрая информация</div>
        <div className="user-row__tooltip-grid">
          <span>Имя:</span>
          <span>{name}</span>
          <span>Возраст:</span>
          <span>{age || '—'}</span>
          <span>Пол:</span>
          <span>{genderLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
