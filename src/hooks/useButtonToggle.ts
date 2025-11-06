import { useState } from 'react';

export function useButtonToggle(initialColor = 'red') {
  const [color, setColor] = useState(initialColor);
  const [clickCount, setClickCount] = useState(0);

  const toggleColor = () => {
    setColor(prevColor => prevColor === 'red' ? 'green' : 'red');
    setClickCount(prev => prev + 1);
  };

  const reset = () => {
    setColor(initialColor);
    setClickCount(0);
  };

  return {
    color,
    clickCount,
    toggleColor,
    reset,
    isRed: color === 'red',
    isGreen: color === 'green'
  };
}