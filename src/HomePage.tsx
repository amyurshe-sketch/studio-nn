import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './HomePage.css';
import { useI18n } from './i18n';
import MessageButton from './components/MessageButton';
import { ButtonText } from './components/ButtonText';

// Type shape for particles used in canvas animation
type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  update: () => void;
  draw: () => void;
};

function useVibe(t: (k: string) => string) {
  return [
    { title: t('home.vibe.1.title'), text: t('home.vibe.1.text'), emoji: '🤝' },
    { title: t('home.vibe.2.title'), text: t('home.vibe.2.text'), emoji: '🎮' },
    { title: t('home.vibe.3.title'), text: t('home.vibe.3.text'), emoji: '👤' },
  ];
}

function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([] as any);
  const vibeHighlights = useVibe(t);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/users', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animationFrameId;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = 'rgba(148, 163, 184, 0.6)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const connectParticles = () => {
      const maxDistance = 110;
      const particles = particlesRef.current;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const p1 = particles[a];
          const p2 = particles[b];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.strokeStyle = `rgba(226, 232, 240, ${opacity * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    particlesRef.current = Array.from({ length: 140 }, () => new Particle());

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      connectParticles();

      particlesRef.current.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasDimensions();
      particlesRef.current = Array.from({ length: 140 }, () => new Particle());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isAuthenticated) {
    return null;
  }

  const scrollProgress = Math.min(scrollY / 120, 1);

  return (
    <div className="modern-home-page">
      <canvas ref={canvasRef} className="particles-canvas" />

      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-tagline">{t('home.hero.tagline')}</span>
            <h1 className="hero-title">{t('home.hero.title')}</h1>
            <p className="hero-description">{t('home.hero.desc')}</p>

            <div className="hero-cta-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <MessageButton className="hero-primary-cta" onClick={() => navigate('/register')}>
                {t('auth.register')}
              </MessageButton>
              <ButtonText as={Link} to="/login">вход</ButtonText>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-device">
              <div className="hero-device__notch" />
              <div className="hero-device__screen">
                <span className="hero-device__badge">{t('home.device.badge')}</span>
                <h3>{t('home.device.title')}</h3>
                <p>{t('home.device.text')}</p>
                <span className="hero-device__cta">{t('home.device.cta')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line">
            <div className="scroll-progress" style={{ transform: `scaleY(${scrollProgress})` }} />
          </div>
          <span className="scroll-text">{t('home.scroll.down')}</span>
        </div>
      </section>

      <section className="vibe-section">
        <div className="section-heading">
          <h2>{t('home.vibe.title')}</h2>
          <p>{t('home.vibe.desc')}</p>
        </div>
        <div className="vibe-grid">
          {vibeHighlights.map((item) => (
            <article className="vibe-card" key={item.title}>
              <div className="vibe-card__emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="invite-section">
        <div className="invite-card">
          <div className="invite-content">
            <h2>{t('home.invite.title')}</h2>
            <p>{t('home.invite.text')}</p>
          </div>
          <div className="invite-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <MessageButton className="invite-cta" onClick={() => navigate('/register')}>
              {t('auth.register')}
            </MessageButton>
            <ButtonText as={Link} to="/login">вход</ButtonText>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
