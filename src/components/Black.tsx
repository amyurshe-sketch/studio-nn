import React, { forwardRef } from 'react';

const baseClasses = [
  'inline-flex items-center justify-center',
  'px-6 py-3 rounded-full font-semibold text-sm', // Овальная форма и меньше размер
  'bg-black text-white',
  'border border-gray-300 dark:border-gray-600',
  'shadow-md',
  'transition-all duration-200',
  'hover:bg-gray-800 hover:shadow-lg',
  'active:bg-gray-700 active:shadow-inner',
  'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'disabled:hover:bg-black disabled:hover:shadow-md',
  'appearance-none',
  '-webkit-appearance-none', 
  '-moz-appearance-none',
];

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Black = forwardRef<HTMLButtonElement, ButtonProps>(function Black(
  { children = 'Кнопка', className = '', disabled = false, type = 'button', ...rest },
  ref
) {
  const classes = [
    ...baseClasses,
    className,
  ].join(' ');

  return (
    <button ref={ref} type={type} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
});

export default Black;
