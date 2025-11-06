import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { wsClient } from '../lib/wsClient';
import { useAuth } from '../hooks/useAuth';
import MessageModal from './MessageModal';
import { useI18n } from '../i18n';

type Item = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  created_at?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: Item[];
  onAck: (id: number) => void;
};

export default function NotificationsModal({ open, onClose, items, onAck }: Props) {
  const { user: authUser } = useAuth();
  const { t, language } = useI18n();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedSenderId, setSelectedSenderId] = useState<number | null>(null);
  const [senderNames, setSenderNames] = useState<Record<number, string>>({});
  const selectedItems = useMemo(() => items.filter(i => i.sender_id === selectedSenderId), [items, selectedSenderId]);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const handleReplySend = useCallback(async (payload: { to: string; subject: string; body: string }) => {
    const text = payload.body?.trim();
    if (!text || !selectedSenderId) return;
    try {
      if (authUser?.user_id && !wsClient.isReady()) {
        await wsClient.connect().catch(() => {});
      }
      await wsClient.request('notifications.send', { receiver_id: selectedSenderId, message_text: text });
      setIsReplyOpen(false);
    } catch {}
  }, [selectedSenderId]);

  useEffect(() => {
    if (!open) {
      setView('list');
      setSelectedSenderId(null);
    }
  }, [open]);

  // Resolve sender name on demand
  useEffect(() => {
    const sid = selectedSenderId;
    if (!sid || senderNames[sid]) return;
    (async () => {
      try {
        if (!authUser?.user_id) return;
        const profile: any = await wsClient.request('user.profile', { user_id: sid });
        if (profile?.name) {
          setSenderNames(prev => ({ ...prev, [sid]: profile.name }));
        }
      } catch {}
    })();
  }, [selectedSenderId, senderNames, authUser?.user_id]);

  const groups = useMemo(() => {
    const map = new Map<number, { sender_id: number; count: number; latest?: string }>();
    for (const it of items) {
      const g = map.get(it.sender_id) || { sender_id: it.sender_id, count: 0, latest: it.created_at };
      g.count += 1;
      if (!g.latest || (it.created_at && it.created_at > g.latest)) g.latest = it.created_at;
      map.set(it.sender_id, g);
    }
    return Array.from(map.values()).sort((a, b) => (b.latest || '').localeCompare(a.latest || ''));
  }, [items]);

  // Prefetch sender names for all senders present in the list so the list view shows names immediately
  useEffect(() => {
    const uniqueIds = Array.from(new Set(items.map(i => i.sender_id)));
    const missing = uniqueIds.filter(id => !senderNames[id]);
    if (missing.length === 0) return;
    (async () => {
      try {
        if (!wsClient.isReady()) {
          await wsClient.connect().catch(() => {});
        }
        await Promise.all(
          missing.map(async (sid) => {
            try {
              const profile: any = await wsClient.request('user.profile', { user_id: sid });
              const name = profile?.name;
              if (name) {
                setSenderNames(prev => (prev[sid] ? prev : { ...prev, [sid]: name }));
              }
            } catch {}
          })
        );
      } catch {}
    })();
  }, [items, senderNames]);

  if (!open) return null;

  return (
    <>
      {!isReplyOpen && (
        <div className="fixed inset-0 z-[1300] flex items-start justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <div className="pointer-events-auto w-full max-w-md select-none rounded-2xl border border-black/10 bg-white/95 shadow-2xl backdrop-blur ring-1 ring-black/5 dark:bg-neutral-900/95 dark:border-white/10 dark:ring-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-5 pt-5 pb-3">
          {view === 'detail' ? (
            <>
              <button
                onClick={() => setView('list')}
                className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                aria-label="Назад"
              >
                ←
              </button>
              <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {selectedSenderId ? (senderNames[selectedSenderId] || `Пользователь #${selectedSenderId}`) : t('notifications.title')}
              </div>
              <button onClick={onClose} className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" aria-label="Close">×</button>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t('notifications.title')}</div>
              <button onClick={onClose} className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" aria-label="Close">×</button>
            </>
          )}
        </div>
        <div className="mx-5 border-t border-neutral-300 dark:border-white/20" />

        {view === 'list' ? (
          <ul className="max-h-[60vh] overflow-y-auto px-2 py-2">
            {groups.length === 0 && (
              <li className="px-3 py-4 text-neutral-500 dark:text-neutral-400">{t('notifications.empty')}</li>
            )}
            {groups.map((g) => (
              <li key={g.sender_id} className="px-2 py-2">
                <button
                  className="w-full rounded-xl bg-neutral-100/70 dark:bg-white/10 px-3 py-3 text-left hover:bg-neutral-200 dark:hover:bg-white/20 transition"
                  onClick={() => { setSelectedSenderId(g.sender_id); setView('detail'); }}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {senderNames[g.sender_id] || `Пользователь #${g.sender_id}`}
                    </div>
                    <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-neutral-900 px-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
                      {g.count}
                    </span>
                  </div>
                  {g.latest && (
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t('notifications.latest')} {new Date(g.latest).toLocaleTimeString(language === 'en' ? 'en-US' : 'ru-RU', {hour: '2-digit', minute: '2-digit'})}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
            {selectedItems.length === 0 && (
              <div className="px-3 py-4 text-neutral-500 dark:text-neutral-400">{t('notifications.empty')}</div>
            )}
            {selectedItems.map((n) => (
              <div key={n.id} className="px-2 py-2">
                <div className="rounded-xl bg-neutral-100/70 dark:bg-white/10 px-3 py-3">
                  <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">{n.message_text}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{n.created_at ? new Date(n.created_at).toLocaleString(language === 'en' ? 'en-US' : 'ru-RU') : ''}</span>
                    <button onClick={() => onAck(n.id)} className="ml-auto rounded-lg bg-neutral-900 px-3 py-1 text-xs font-semibold text-white hover:brightness-110 dark:bg-white dark:text-neutral-900">{t('notifications.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
            {/* Reply button (green style) */}
            {selectedSenderId && (
              <div className="px-2 py-2 flex gap-2">
                <button
                  onClick={() => setIsReplyOpen(true)}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition text-sm font-semibold"
                >
                  {t('notifications.reply')}
                </button>
              </div>
            )}
            {selectedItems.length > 0 && (
              <div className="px-2 py-2">
                <button
                  onClick={() => { selectedItems.forEach(m => onAck(m.id)); }}
                  className="w-full rounded-xl bg-neutral-900 px-4 py-2 text-white hover:brightness-110 dark:bg-white dark:text-neutral-900 text-sm font-semibold"
                >
                  {t('notifications.deleteAll')}
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      )}
      {isReplyOpen && (
        <MessageModal
          open={isReplyOpen}
          onClose={() => setIsReplyOpen(false)}
          onSend={handleReplySend}
          initialTo={selectedSenderId ? (senderNames[selectedSenderId] || `Пользователь #${selectedSenderId}`) : ''}
          dimBackground={true}
          closeOnBackdrop={true}
          lockTo={true}
        />
      )}
    </>
  );
}
