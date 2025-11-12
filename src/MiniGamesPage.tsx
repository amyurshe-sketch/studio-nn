import React from 'react';
import './leisure-styles.css';
import './mini-games.css';

export default function MiniGamesPage() {
  const [src, setSrc] = React.useState('/games/devil-glitches/index.html');

  React.useEffect(() => {
    try {
      const isTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
      const isSmall = window.innerWidth < 769;
      const ua = (navigator.userAgent || '').toLowerCase();
      const isMobileUA = /android|iphone|ipad|ipod|mobile/.test(ua);
      const useMobile = isTouch || isSmall || isMobileUA;
      setSrc(useMobile ? '/games/devil-mobile/index.html' : '/games/devil-glitches/index.html');
    } catch {
      setSrc('/games/devil-glitches/index.html');
    }
  }, []);

  return (
    <div className="leisure-page">
      <div className="leisure-content">
        <div className="mg-iframe-wrap">
          <iframe src={src} title="Mini Game" loading="lazy" allow="fullscreen; gamepad" allowFullScreen />
        </div>
      </div>
    </div>
  );
}
