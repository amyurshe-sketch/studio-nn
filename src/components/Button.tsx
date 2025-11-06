import React from 'react';
import { useButtonToggle } from '../hooks/useButtonToggle';

function Button({ initialColor = 'red', text = "Кнопка" }) {
  const { color, clickCount, toggleColor, isRed } = useButtonToggle(initialColor);

  const buttonText = `${text} (${clickCount} кликов)`;
  const emoji = isRed ? '🔴' : '🟢';

  return (
    <button 
      onClick={toggleColor}
      style={{ 
        backgroundColor: color, 
        color: "white", 
        padding: "10px",
        margin: "5px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      {emoji} {buttonText}
    </button>
  );
}

export default Button;