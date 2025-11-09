import React from 'react';

type Props = { size?: number };

export default function TelegramIcon({ size = 18 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9.036 15.47l-.375 5.297c.536 0 .768-.23 1.045-.507l2.507-2.41 5.193 3.807c.951.527 1.628.25 1.891-.881l3.43-16.065h.001c.304-1.414-.51-1.964-1.444-1.62L1.18 9.51c-1.382.536-1.362 1.31-.235 1.658l5.283 1.648 12.27-7.747c.577-.377 1.101-.169.67.208"
        fill="#229ED9"
      />
    </svg>
  );
}

