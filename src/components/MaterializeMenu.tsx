import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';

type LinkItem = { label: string; href: string };

type Props = {
  onClose?: () => void;
  links?: LinkItem[];
};

const defaultLinks: LinkItem[] = [
  { label: 'Landing', href: 'https://e-omlet.ru' },
  { label: 'Git site', href: 'https://amyurshe-sketch.github.io/site/' },
  { label: 'Feedback', href: 'https://portfolio-hazel-rho-80.vercel.app/#contact' },
];

const MaterializeMenu: React.FC<Props> = ({ onClose, links = defaultLinks }) => {
  const [showLinks, setShowLinks] = useState(true);
  const { language } = useI18n();
  const isRu = language === 'ru';

  useEffect(() => {
    setShowLinks(true);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" />
      <div
        className="relative w-[320px] max-w-[86vw] rounded-2xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl shadow-emerald-500/20
                   animate-[fadeIn_0.4s_ease_out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-white/40 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 shadow-lg shadow-indigo-500/30
                        animate-[materialize_1.2s_ease_out_forwards] flex items-center justify-center text-white font-black text-3xl tracking-wide">
          SNN
        </div>
        <div className="text-lg font-semibold text-white/90">
          {isRu ? 'Привет!' : 'Hello!'}
        </div>
        <div className="mt-2 text-sm text-white/70">
          {isRu ? 'Посмотрите мои другие проекты.' : 'Check out my other projects.'}
        </div>

        <div
          className={`mt-6 flex flex-col gap-3 transition-opacity duration-400 ${
            showLinks ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-white font-semibold shadow-lg shadow-emerald-500/30
                         hover:shadow-indigo-500/40 transition-transform duration-200 hover:-translate-y-0.5"
              onClick={handleClose}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes materialize {
          0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default MaterializeMenu;
