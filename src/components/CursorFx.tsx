'use client';

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// CursorFx — cometa d'ORO LUCIDO che segue il mouse (movimento a catena
// elastica come nel taxi) + micro "big bang" di scintille oro lucide al click.
// Effetto metallico brillante: alone + perla oro con riflesso bianco (glint) +
// leggero scintillio. Colori AALA. Canvas unico (RAF). Off su touch/reduced-motion.
// ─────────────────────────────────────────────────────────────────────────

// Oro LUCIDO (brillante, metallico) + riflessi
const GOLD_BRIGHT = ['#FFD24A', '#FFCC33', '#F7C948', '#FFE08A', '#FFD23E'];
const GOLD_EDGE = '#C9971E';
const HILITE = '#FFFBEA';
const CHAIN = 11;
const LERP = 0.42;

function rgba(hex: string, a: number): string {
  const m = hex.replace('#', '').match(/.{1,2}/g)!;
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
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
    const chain = Array.from({ length: CHAIN }, () => ({ x: W / 2, y: H / 2 }));
    const parts: P[] = [];

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; };
    const onDown = (e: MouseEvent) => burst(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });

    function burst(x: number, y: number) {
      const n = 18 + Math.floor(Math.random() * 6);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const sp = 1.7 + Math.random() * 3.8;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 30 + Math.random() * 22, size: 1.8 + Math.random() * 2.8, color: GOLD_BRIGHT[(Math.random() * GOLD_BRIGHT.length) | 0] });
      }
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 18, size: 17, color: HILITE, flash: true }); // flash lucido
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 26, size: 6, color: '#FFD24A', flash: true }); // anello oro
    }

    // Perla d'oro lucida: alone + gradiente con riflesso spostato + glint bianco.
    function shinyBead(x: number, y: number, r: number, a: number, glow = true) {
      if (glow) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
        g.addColorStop(0, rgba('#FFD24A', 0.34 * a + 0.05));
        g.addColorStop(1, rgba('#E6B31E', 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.2832); ctx.fill();
      }
      const bead = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      bead.addColorStop(0, rgba(HILITE, a));
      bead.addColorStop(0.35, rgba('#FFD24A', a));
      bead.addColorStop(1, rgba(GOLD_EDGE, a * 0.92));
      ctx.fillStyle = bead; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      // glint bianco (riflesso lucido)
      ctx.fillStyle = rgba('#FFFFFF', a * 0.8);
      ctx.beginPath(); ctx.arc(x - r * 0.34, y - r * 0.34, r * 0.3, 0, 6.2832); ctx.fill();
    }

    let raf = 0;
    const frame = (now: number) => {
      chain[0].x += (mouse.x - chain[0].x) * LERP;
      chain[0].y += (mouse.y - chain[0].y) * LERP;
      for (let i = 1; i < CHAIN; i++) {
        chain[i].x += (chain[i - 1].x - chain[i].x) * LERP;
        chain[i].y += (chain[i - 1].y - chain[i].y) * LERP;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (mouse.seen) {
        // coda: perle d'oro lucide, dalla testa (grande) alla coda (piccola)
        for (let i = CHAIN - 1; i >= 0; i--) {
          const p = chain[i]; const t = 1 - i / CHAIN;
          const r = 2.5 + t * 6.5;
          const shimmer = 0.85 + 0.15 * Math.sin(now / 180 + i * 0.9); // leggero scintillio
          const a = (0.62 * t + 0.24) * shimmer;
          shinyBead(p.x, p.y, r, a);
        }
      }

      // scintille del big-bang — oro lucido con cuore bianco
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        const t = 1 - p.life / p.max;
        if (t <= 0) { parts.splice(i, 1); continue; }
        if (!p.flash) { p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy = p.vy * 0.9 + 0.04; }
        if (p.flash) {
          const rr = p.size * t + 1;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
          g.addColorStop(0, rgba(p.color, 0.7 * t));
          g.addColorStop(1, rgba(p.color, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.2832); ctx.fill();
        } else {
          shinyBead(p.x, p.y, p.size * (0.6 + 0.6 * t), t); // scintilla lucida che si spegne
        }
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
