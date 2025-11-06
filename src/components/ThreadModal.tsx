// src/components/ThreadModal.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

type Message = {
  id: string | number;
  from: string;
  text: string;
  ts: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Сообщения в переписке */
  messages: Message[];
  /** Имя отправителя */
  senderName: string;
  /** Аватар отправителя */
  senderAvatar?: string;
  /** Референс на элемент, к которому прикрепляем окно */
  anchorElement?: HTMLElement | null;
  /** затемнять фон */
  dimBackground?: boolean;
  /** клик по фону закрывает окно */
  closeOnBackdrop?: boolean;
  /** Нажатие на кнопку "Ответить" */
  onReply?: () => void;
};

export default function ThreadModal({
  open,
  onClose,
  messages,
  senderName,
  senderAvatar,
  anchorElement,
  dimBackground = true,
  closeOnBackdrop = true,
  onReply,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Вычисляем позицию относительно anchorElement
  const getPositionStyles = () => {
    if (!anchorElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = anchorElement.getBoundingClientRect();
    return {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  };

  const positionStyles = getPositionStyles();

  const overlayClasses = dimBackground
    ? "fixed inset-0 z-[1200] bg-black/50 dark:bg-black/60 backdrop-blur-sm"
    : "fixed inset-0 z-[1200]";

  const modal = (
    <div
      className={overlayClasses}
      onClick={dimBackground && closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal={dimBackground ? true : false}
      aria-label={`Full conversation with ${senderName}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          pointer-events-auto absolute select-none
          rounded-2xl border border-black/10 bg-white/95 shadow-2xl backdrop-blur
          ring-1 ring-black/5
          dark:bg-neutral-900/95 dark:border-white/10 dark:ring-white/10
          transition-all duration-200 ease-out
          max-h-[70vh] flex flex-col
        `}
        style={positionStyles}
      >
        {/* Header: back arrow to return to Answer */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Back"
            title="Назад"
          >
            ←
          </button>
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              {senderName.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-[0.95rem] font-semibold text-neutral-900 dark:text-neutral-100">
              {senderName}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {messages.length} сообщений
            </div>
          </div>
          <div className="ml-auto" />
        </div>

        <div className="mx-5 border-t border-neutral-300 dark:border-white/20" />

        {/* Thread Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m) => {
            const mine = m.from === "You";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`
                    rounded-xl px-3 py-2 text-sm shadow-sm max-w-[85%]
                    ${mine
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-100"}
                  `}
                >
                  <div className="break-words">{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70 text-right">
                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: single reply button */}
        <div className="px-5 pb-4 pt-3 border-t border-neutral-300 dark:border-white/20 flex-shrink-0">
          <button
            onClick={onReply}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2 text-white hover:brightness-110 dark:bg-white dark:text-neutral-900 text-sm font-semibold"
          >
            Ответить
          </button>
        </div>
      </div>
    </div>
  );

  // Render on top of everything via portal to body
  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
}
