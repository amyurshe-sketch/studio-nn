import { type CSSProperties, type ElementType } from 'react';

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

  return (
    <Component
      className={baseClasses}
      style={{ ...baseStyle, ...style }}
      aria-label="Studio NN logo"
    >
      Studio NN
    </Component>
  );
};

export default StudioLogo;
