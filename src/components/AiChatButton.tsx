import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AiChatButton.css';
import { useI18n } from '../i18n';

type AiChatButtonProps = {
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const AiChatButton: React.FC<AiChatButtonProps> = ({ compact = false, onClick, disabled = false }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/ai-chat');
    }
  };
  return (
    <button
      type="button"
      className={`ai-chat-button ${compact ? 'ai-chat-button--compact' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="ai-chat-button__label">{t('ai.cta.line1')}</span>
      <span className="ai-chat-button__accent">{t('ai.cta.line2')}</span>
    </button>
  );
};

export default AiChatButton;
