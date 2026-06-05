/**
 * Sfondo "Oro liquido / seta" — luce dorata che scorre lenta dietro tutta la
 * pagina. Pura CSS (transform/opacity sul compositor): zero WebGL, leggerissimo.
 * Soffuso e premium, si fonde col crema. Rispetta prefers-reduced-motion.
 */
export function LuxeBackground() {
  return (
    <div aria-hidden className="luxe-bg">
      <div className="luxe-blob luxe-blob-1" />
      <div className="luxe-blob luxe-blob-2" />
      <div className="luxe-blob luxe-blob-3" />
      <div className="luxe-sheen" />
    </div>
  );
}
