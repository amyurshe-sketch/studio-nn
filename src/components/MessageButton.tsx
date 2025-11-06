import React, { forwardRef } from 'react';

const baseClasses = [
  'inline-flex items-center justify-center gap-2',
  'px-6 py-3 rounded-full font-semibold text-sm',
  'bg-slate-900/5 text-slate-800 shadow-sm',
  'dark:bg-indigo-400/15 dark:text-slate-100',
  'transition-all duration-200 ease-out',
  'hover:-translate-y-0.5 hover:shadow-xl',
  'hover:text-white hover:bg-gradient-to-r',
  'hover:from-indigo-800 hover:via-indigo-700 hover:to-indigo-600',
  'dark:hover:from-indigo-400 dark:hover:via-sky-400 dark:hover:to-emerald-300',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900'
];

const disabledClasses = [
  'opacity-60 cursor-not-allowed pointer-events-none',
  'hover:translate-y-0 hover:shadow-sm hover:bg-slate-900/5 hover:text-slate-600'
];

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const MessageButton = forwardRef<HTMLButtonElement, ButtonProps>(function MessageButton(
  { children = 'Сообщение', className = '', disabled = false, type = 'button', ...rest },
  ref
) {
  const classes = [
    ...baseClasses,
    className,
    disabled ? disabledClasses.join(' ') : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
});

export default MessageButton;
