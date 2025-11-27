import React from 'react';
import './Preloader.css';

type PreloaderProps = {
  visible: boolean;
  inline?: boolean;
};

const Preloader: React.FC<PreloaderProps> = ({ visible, inline = false }) => {
  if (!visible) return null;
  const className = inline ? 'preloader preloader--inline' : 'preloader';
  return (
    <div className={className}>
      {!inline && <div className="preloader__backdrop" />}
      <div className="preloader__spinner">
        <div className="preloader__circle preloader__circle--outer" />
        <div className="preloader__circle preloader__circle--inner" />
        <div className="preloader__dot" />
      </div>
    </div>
  );
};

export default Preloader;
