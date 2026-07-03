'use client';

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// CursorFx — cometa dorata (movimento a "catena elastica" come nel taxi) che
// segue il mouse + micro "big bang" di scintille oro al click. Colori AALA
// (oro champagne su fondo crema). Canvas unico, leggero (RAF). Off su touch
// e con reduced-motion.
// ─────────────────────────────────────────────────────────────────────────

const GOLD = ['#B08A3E', '#C9A24B', '#D9B968', '#E7CE8E', '#8A6717'];
const CHAMPAGNE = '#F3E7C9';
const CHAIN = 10;         // punti della cometa (come i "6 dots" del taxi, più fluido)
const LERP = 0.4;         // rincorsa: più alto = più scattante (stile taxi)

function rgba(hex: string, a: number): string {
  const m = hex.replace('#', '').match(/.{1,2}/g)!;
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${a})`;
}

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; flash?: boolean };

export function CursorFx() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return;

    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: W / 2, y: H / 2, seen: false };
    // catena elastica: ogni punto rincorre il precedente (come il taxi)
    const chain = Array.from({ length: CHAIN }, () => ({ x: W / 2, y: H / 2 }));
    const parts: P[] = [];

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; };
    const onDown = (e: MouseEvent) => burst(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });

    function burst(x: number, y: number) {
      const n = 17 + Math.floor(Math.random() * 6);      // un po' più numerose
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const sp = 1.6 + Math.random() * 3.6;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 30 + Math.random() * 22, size: 1.7 + Math.random() * 2.8, color: GOLD[(Math.random() * GOLD.length) | 0] });
      }
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 18, size: 16, color: CHAMPAGNE, flash: true }); // flash centrale
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 24, size: 5, color: '#D9B968', flash: true });   // anello
    }

    let raf = 0;
    const frame = () => {
      // catena: testa rincorre il mouse, gli altri rincorrono il precedente
      chain[0].x += (mouse.x - chain[0].x) * LERP;
      chain[0].y += (mouse.y - chain[0].y) * LERP;
      for (let i = 1; i < CHAIN; i++) {
        chain[i].x += (chain[i - 1].x - chain[i].x) * LERP;
        chain[i].y += (chain[i - 1].y - chain[i].y) * LERP;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (mouse.seen) {
        // coda cometa: palline oro PIENE e visibili, dalla testa (grande) alla coda (piccola)
        for (let i = CHAIN - 1; i >= 0; i--) {
          const p = chain[i]; const t = 1 - i / CHAIN; // 1 alla testa, →0 in coda
          const r = 2.5 + t * 6;
          // alone morbido
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
          g.addColorStop(0, rgba('#C9A24B', 0.32 * t + 0.06));
          g.addColorStop(1, rgba('#B08A3E', 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.2, 0, 6.2832); ctx.fill();
          // pallina oro piena (ben visibile sul crema)
          ctx.fillStyle = rgba('#9A7220', 0.6 * t + 0.22);
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
        }
        // testa: alone oro caldo + cuore oro/champagne marcato
        const h = chain[0];
        const hg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 18);
        hg.addColorStop(0, rgba('#E7CE8E', 0.6));
        hg.addColorStop(0.45, rgba('#B08A3E', 0.34));
        hg.addColorStop(1, rgba('#B08A3E', 0));
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(h.x, h.y, 18, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgba('#8A6717', 0.9); ctx.beginPath(); ctx.arc(h.x, h.y, 3.6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgba('#FFF8E6', 0.95); ctx.beginPath(); ctx.arc(h.x, h.y, 1.8, 0, 6.2832); ctx.fill();
      }

      // scintille del big-bang (un filo più visibili)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        const t = 1 - p.life / p.max;
        if (t <= 0) { parts.splice(i, 1); continue; }
        if (!p.flash) { p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy = p.vy * 0.9 + 0.04; }
        const rr = p.flash ? p.size * t + 1 : p.size * 2.3 + 1.5;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        g.addColorStop(0, rgba(p.color, (p.flash ? 0.6 : 1.0) * t));
        g.addColorStop(0.6, rgba(p.color, 0.45 * t));
        g.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.2832); ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60]" />;
}
