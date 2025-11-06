// src/components/AnswerModal.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

type Conversation = {
  id: string | number;
  name: string;
  unread: number;
  avatarUrl?: string;
  lastMessagePreview?: string;
};

type Message = {
  id: string | number;
  from: string;
  text: string;
  ts: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Заголовок (используется, когда conversation не задан) */
  title?: string;
  /** Если передать — покажем диалог; иначе — список бесед */
  conversation?: Conversation;
  /** Клик по беседе в режиме списка */
  onOpenConversation?: (conv: Conversation) => void;
  /** Источник списка бесед в режиме списка */
  conversations?: Conversation[];
  /** затемнять фон; для «дополняющего» окна лучше false */
  dimBackground?: boolean;
  /** клик по фону закрывает окно (актуально, если dimBackground=true) */
  closeOnBackdrop?: boolean;
};

// Расширенная версия с большим количеством сообщений для ThreadModal
const SAMPLE_THREAD = (name: string) => [
  { id: "m1", from: name, text: "Привет! Есть минутка?", ts: Date.now() - 3600000 },
  { id: "m2", from: "You", text: "Да, слушаю тебя 👋", ts: Date.now() - 3500000 },
  { id: "m3", from: name, text: "Хотел уточнить по макетам…", ts: Date.now() - 3400000 },
  { id: "m4", from: name, text: "Там в третьем разделе нужно поправить шрифты", ts: Date.now() - 3300000 },
  { id: "m5", from: "You", text: "Понял, сейчас посмотрю", ts: Date.now() - 3200000 },
  { id: "m6", from: name, text: "И еще по цветовой схеме есть вопросы", ts: Date.now() - 3100000 },
  { id: "m7", from: "You", text: "Какой именно цвет не нравится?", ts: Date.now() - 3000000 },
  { id: "m8", from: name, text: "Синий слишком яркий, может сделать потемнее?", ts: Date.now() - 2900000 },
];

export default function AnswerModal({
  open,
  onClose,
  title = "Messages",
  conversation,
  onOpenConversation,
  conversations = [
    { id: "alex", name: "Alex", unread: 1, lastMessagePreview: "Привет! Есть минутка?" },
    { id: "lazy", name: "Lazy", unread: 2, lastMessagePreview: "Загляни позже… Спасибо!" },
  ],
  dimBackground = true,
  closeOnBackdrop = true,
}: Props) {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Thread interactions removed

  if (!open) return null;

  const conv = conversation ?? activeConv ?? null;

  const overlayClasses = dimBackground
    ? "fixed inset-0 z-[1100] flex items-start justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
    : "pointer-events-none fixed inset-0 z-[1100] flex items-start justify-center p-4 sm:p-6";

  const modal = (
    <>
      <div
        className={overlayClasses}
        onClick={dimBackground && closeOnBackdrop ? onClose : undefined}
        role="dialog"
        aria-modal={dimBackground ? true : false}
        aria-label={conv ? `Dialog with ${conv.name}` : title}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            pointer-events-auto w-full max-w-md select-none
            rounded-2xl border border-black/10 bg-white/90 shadow-2xl backdrop-blur
            ring-1 ring-black/5
            dark:bg-neutral-900/90 dark:border-white/10 dark:ring-white/10
            transition-transform duration-200 ease-out translate-y-0
          `}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3">
            {conv ? (
              <>
                {conv.avatarUrl ? (
                  <img
                    src={conv.avatarUrl}
                    alt={conv.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {conv.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-[0.98rem] font-semibold text-neutral-900 dark:text-neutral-100">
                    {conv.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {conv.unread > 0 ? `${conv.unread} непрочит.` : "все прочитано"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</div>
            )}
            <button
              onClick={onClose}
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mx-5 border-t border-neutral-300 dark:border-white/20" />

          {conv ? (
            <>
              {/* Thread */}
              <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-3">
                {SAMPLE_THREAD(conv.name).slice(0, 3).map((m) => {
                  const mine = m.from === "You";
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          rounded-xl px-3 py-2 text-sm shadow-sm
                          ${mine
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            : "bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-white/20"}
                        `}
                      >
                        <div>{m.text}</div>
                        <div className="mt-1 text-[10px] opacity-70">
                          {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer (быстрый ответ) */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2">
                  <input
                    placeholder={`Ответить ${conv.name}…`}
                    className="flex-1 rounded-xl border border-neutral-300/70 bg-white/70 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:bg-neutral-900/60 dark:text-neutral-100 dark:border-white/10 dark:placeholder:text-neutral-500"
                  />
                  <button className="rounded-xl bg-neutral-900 px-3 py-2 text-white hover:brightness-110 dark:bg-white dark:text-neutral-900">
                    Отправить
                  </button>
                </div>
              </div>
            </>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto px-2 py-2">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      if (onOpenConversation) onOpenConversation(c);
                      else setActiveConv(c);
                    }}
                    className="
                      w-full rounded-xl px-3 py-3 text-left transition
                      hover:bg-neutral-100/70 dark:hover:bg-white/5
                      focus:outline-none focus:ring-2 focus:ring-blue-500/40
                      flex items-center gap-3
                    "
                  >
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        {c.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[0.98rem] font-semibold text-neutral-900 dark:text-neutral-100">
                          {c.name}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-neutral-900 px-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      {c.lastMessagePreview && (
                        <div className="mt-0.5 line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {c.lastMessagePreview}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Thread Modal */}
      {/* Thread modal usage removed */}
    </>
  );

  // Render on top of everything via portal to body
  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
}
