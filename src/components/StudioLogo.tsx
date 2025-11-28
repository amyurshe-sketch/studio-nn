import { type CSSProperties, type ElementType, useState } from 'react';
import MaterializeMenu from './MaterializeMenu';

type StudioLogoProps = {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const StudioLogo = ({
  as: Component = 'div',
  className = '',
  style,
}: StudioLogoProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const baseClasses = ['logo', 'handwrite', className].filter(Boolean).join(' ');
  const baseStyle: CSSProperties = {
    fontFamily: "'Pacifico', 'Brush Script MT', 'Caveat', cursive",
    fontSize: '1.7rem',
    fontWeight: 700,
    fontStyle: 'italic',
    letterSpacing: '0.06em',
    margin: 0,
    background: 'linear-gradient(120deg, #0f172a, #2563eb 35%, #ec4899 65%, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const showPreloader = () => {
    setMenuOpen(true);
  };

  return (
    <Component
      className={baseClasses}
      style={{ ...baseStyle, ...style }}
      aria-label="Studio NN logo"
    >
      Studio{' '}
      <a className="logo-nn" aria-label="На главную" onClick={(e) => { e.preventDefault(); showPreloader(); }}>
        NN
      </a>
      {menuOpen && (
        <MaterializeMenu onClose={() => setMenuOpen(false)} />
      )}
    </Component>
  );
};

export default StudioLogo;
