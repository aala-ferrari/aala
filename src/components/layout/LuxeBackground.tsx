/**
 * Sfondo IDENTITARIO di AALA — "le Bolle di Zhiva" come SPUMA DI CHAMPAGNE.
 * Tante bollicine piccole, sferette di vetro 3D col bordo oro, che salgono
 * dritte e veloci come le bollicine in un calice. Pura CSS: zero WebGL,
 * leggerissimo. Rispetta reduced-motion.
 */

// generazione deterministica (Math.sin, uguale su server e client → niente
// hydration mismatch; NON usare Math.random qui).
const rnd = (seed: number) => {
  const x = Math.sin(seed * 99.137) * 43758.545;
  return x - Math.floor(x);
};

const COUNT = 38;
const BUBBLES = Array.from({ length: COUNT }, (_, i) => {
  // dimensioni piccole (champagne): per lo più 5–22px, qualcuna fino ~34px
  const size = 4 + Math.round(Math.pow(rnd(i + 2), 1.7) * 30);
  const left = Math.round(rnd(i + 7) * 99);
  const dur = 9 + Math.round(rnd(i + 3) * 11); // 9–20s (salita svelta)
  const delay = -Math.round(rnd(i + 5) * 22); // sfasate
  const sway = Math.round((rnd(i + 11) - 0.5) * 36); // micro-ondeggio ±18px
  return { size, left, dur, delay, sway };
});

export function LuxeBackground() {
  return (
    <div aria-hidden className="luxe-bg">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="lux-bubble"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            // @ts-expect-error -- CSS custom property
            '--sway': `${b.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
