/**
 * Sfondo IDENTITARIO di AALA — "le Bolle di Zhiva" che fluttuano.
 * Bolle di vetro con bordo oro iridescente che salgono piano dietro la pagina.
 * È il marchio di AALA (la Bolla) come atmosfera. Pura CSS: zero WebGL,
 * leggerissimo (solo transform/opacity sul compositor). Rispetta reduced-motion.
 */

// dimensione · sinistra% · durata(s) · ritardo(s) · oscillazione orizzontale(px)
const BUBBLES: Array<[number, number, number, number, number]> = [
  [170, 6, 30, -4, 40],
  [70, 16, 22, -12, -30],
  [120, 27, 27, -2, 36],
  [44, 38, 18, -9, -22],
  [150, 50, 32, -16, 30],
  [60, 60, 20, -6, 26],
  [100, 70, 25, -14, -34],
  [38, 80, 16, -3, 18],
  [134, 88, 29, -20, -28],
  [54, 94, 21, -8, 24],
  [82, 45, 24, -18, -20],
  [48, 12, 19, -15, 28],
];

export function LuxeBackground() {
  return (
    <div aria-hidden className="luxe-bg">
      {BUBBLES.map(([size, left, dur, delay, sway], i) => (
        <span
          key={i}
          className="lux-bubble"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
            // @ts-expect-error -- CSS custom property
            '--sway': `${sway}px`,
          }}
        />
      ))}
    </div>
  );
}
