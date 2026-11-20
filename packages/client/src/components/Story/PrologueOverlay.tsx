import { useEffect, useState } from 'react';
import { ChevronRight, Flame, Shield, Sparkles, Zap } from 'lucide-react';
import { PROLOGUE_SLIDES } from '../../game/data/story';
import { COLORS, css } from '../../game/scenes/palette';

interface PrologueOverlayProps {
  heroName: string;
  onFinish: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

export function PrologueOverlay({ heroName, onFinish }: PrologueOverlayProps) {
  const [index, setIndex] = useState(0);
  const slide = PROLOGUE_SLIDES[index];
  const isLast = index === PROLOGUE_SLIDES.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (isLast) onFinish();
        else setIndex((i) => Math.min(PROLOGUE_SLIDES.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLast, onFinish]);

  const icon =
    slide.accent === 'storm' ? <Zap size={34} color={GOLD} /> :
    slide.accent === 'fire' ? <Flame size={34} color="#f97316" /> :
    slide.accent === 'agora' ? <Sparkles size={34} color={GOLD} /> :
    <Shield size={34} color={SKY} />;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'radial-gradient(circle at 50% 30%, rgba(31, 53, 80, 0.96), rgba(11, 19, 43, 0.99))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        width: 'min(680px, 94vw)',
        background: 'rgba(20, 34, 56, 0.96)',
        border: `2px solid ${MARBLE}`,
        boxShadow: `inset 0 0 0 4px rgba(20, 34, 56, 0.96), inset 0 0 0 5px ${GOLD}, 0 24px 60px rgba(0, 0, 0, 0.55)`,
        borderRadius: 6,
        padding: '32px 36px',
        color: MARBLE,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 11, letterSpacing: 3, color: GOLD, fontWeight: 700 }}>
            {slide.chapter} • {index + 1}/{PROLOGUE_SLIDES.length}
          </span>
          <button
            onClick={onFinish}
            style={{
              background: 'transparent',
              border: `1px solid ${SKY}`,
              color: SKY,
              borderRadius: 3,
              padding: '4px 10px',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Passer l'introduction
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.7)',
            border: `2px solid ${GOLD}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {icon}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: GOLD, margin: 0 }}>
              {slide.title}
            </h1>
            <div style={{ fontSize: 12, color: SKY, marginTop: 3 }}>
              Destinée de {heroName}
            </div>
          </div>
        </div>

        <p style={{
          fontSize: 16,
          lineHeight: 1.75,
          color: '#f1f5f9',
          minHeight: 108,
          marginBottom: 24
        }}>
          {slide.body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {PROLOGUE_SLIDES.map((s, i) => (
              <span
                key={s.chapter}
                style={{
                  width: i === index ? 24 : 8,
                  height: 6,
                  borderRadius: 3,
                  background: i === index ? GOLD : 'rgba(244, 237, 224, 0.25)',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => (isLast ? onFinish() : setIndex(index + 1))}
            style={{
              background: GOLD,
              color: '#1f3550',
              border: 'none',
              borderRadius: 4,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{isLast ? "S'éveiller sur l'Agora" : 'Suivant'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
