// src/components/MessageModal.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ButtonText } from "./ButtonText";
import { useI18n } from "../i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (payload: { to: string; subject: string; body: string }) => void;
  initialTo?: string;
  dimBackground?: boolean;
  closeOnBackdrop?: boolean;
  /** Зафиксировать поле получателя (нельзя менять) */
  lockTo?: boolean;
};

const MAX_LEN = 100;

export default function MessageModal({
  open,
  onClose,
  onSend,
  initialTo = "",
  dimBackground = true,
  closeOnBackdrop = true,
  lockTo = false,
}: Props) {
  const { t } = useI18n();
  const [to, setTo] = useState(initialTo);
  const [body, setBody] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = cardRef.current?.querySelector<HTMLInputElement>('[name="to"]');
    t?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const bodyLen = body.length;
  const tooLong = bodyLen > MAX_LEN;
  const canSend = !!to.trim() && !!body.trim() && !tooLong;

  const handleSend = () => {
    if (!canSend) return;
    onSend({ to: to.trim(), subject: "", body: body.trim() });
    setBody("");
    onClose();
  };

  const overlayClasses = dimBackground
    ? "fixed inset-0 z-[1000] flex items-start justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/60 backdrop-blur-sm overflow-y-auto"
    : "pointer-events-none fixed inset-0 z-[1000] flex items-start justify-center p-4 sm:p-6 overflow-y-auto";

  const modal = (
    <div
      className={overlayClasses}
      onClick={dimBackground && closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="
          pointer-events-auto w-full max-w-md select-none
          rounded-2xl border border-black/10 bg-white/90 shadow-2xl backdrop-blur
          ring-1 ring-black/5 dark:bg-neutral-900/90 dark:border-white/10 dark:ring-white/10
          transition-transform duration-200 ease-out translate-y-0
          max-h-[90vh] overflow-y-auto
        "
        role="dialog"
        aria-modal={dimBackground ? true : false}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t('message.new')}</h2>
          <div className="ml-auto" />
          <button
            onClick={onClose}
            className="
              inline-flex h-9 w-9 items-center justify-center rounded-lg
              text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100
              dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-white/5
              focus:outline-none focus:ring-2 focus:ring-blue-500/40
            "
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mx-5 border-t border-neutral-300 dark:border-white/20" />

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          {/* To */}
          <label className="block">
            <span className="mb-1 block text-[0.9rem] text-neutral-600 dark:text-neutral-300">
              {t('message.to')}
            </span>
            <input
              name="to"
              value={to}
              onChange={lockTo ? undefined : (e) => setTo(e.target.value)}
              readOnly={lockTo}
              disabled={lockTo}
              placeholder="username or email"
              className="
                w-full rounded-xl border border-neutral-300/70 bg-white/70 px-3 py-2
                text-neutral-900 placeholder:text-neutral-400 shadow-inner
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                dark:bg-neutral-900/60 dark:text-neutral-100 dark:border-white/10
                dark:placeholder:text-neutral-500
              "
            />
          </label>

          {/* Message */}
          <label className="block">
            <span className="mb-1 block text-[0.9rem] text-neutral-600 dark:text-neutral-300">
              {t('message.body')}
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={MAX_LEN}
              className="
                w-full resize-none rounded-xl border border-neutral-300/70 bg-white/70 px-3 py-2
                text-neutral-900 placeholder:text-neutral-400 shadow-inner
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                dark:bg-neutral-900/60 dark:text-neutral-100 dark:border-white/10
                dark:placeholder:text-neutral-500
              "
              placeholder={t('message.placeholder')}
            />
            <div
              className={`
                mt-2 text-sm
                ${tooLong ? "text-red-500" : "text-neutral-500 dark:text-neutral-400"}
              `}
            >
              {t('message.hint_length', { max: MAX_LEN })}
              <span className="ml-2 tabular-nums">
                ({bodyLen}/{MAX_LEN})
              </span>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <ButtonText as="button" onClick={handleSend} disabled={!canSend} className="w-full">
            {t('message.send')}
          </ButtonText>
        </div>
      </div>
    </div>
  );

  // Render on top of everything via portal to body to avoid clipping/stacking issues
  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
}
