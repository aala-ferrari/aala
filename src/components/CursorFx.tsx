'use client';

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// CursorFx — cometa dorata che segue il mouse + micro "big bang" di scintille
// oro al click. Colori AALA (oro champagne su fondo crema). Canvas unico,
// leggero (requestAnimationFrame). Disattivo su touch e con reduced-motion.
// ─────────────────────────────────────────────────────────────────────────

// Palette oro AALA
const GOLD = ['#B08A3E', '#C9A24B', '#D9B968', '#E7CE8E', '#8A6717'];
const CHAMPAGNE = '#F3E7C9';

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
    if (reduce || coarse) return; // niente effetto su mobile / reduced motion

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
    const head = { x: W / 2, y: H / 2 };
    const trail: { x: number; y: number }[] = [];
    const parts: P[] = [];

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; };
    const onDown = (e: MouseEvent) => burst(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });

    function burst(x: number, y: number) {
      const n = 13 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const sp = 1.4 + Math.random() * 3.2;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 26 + Math.random() * 20, size: 1.3 + Math.random() * 2.2, color: GOLD[(Math.random() * GOLD.length) | 0] });
      }
      // flash centrale champagne (bagliore breve)
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 16, size: 13, color: CHAMPAGNE, flash: true });
      // anello sottile
      parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 20, size: 4, color: '#D9B968', flash: true });
    }

    let raf = 0;
    const frame = () => {
      head.x += (mouse.x - head.x) * 0.16;
      head.y += (mouse.y - head.y) * 0.16;
      if (mouse.seen) { trail.push({ x: head.x, y: head.y }); if (trail.length > 16) trail.shift(); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // scia cometa (oro che sfuma)
      if (mouse.seen) {
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i]; const t = i / trail.length; const r = (1.5 + t * 5) * 2.4;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, rgba('#B08A3E', 0.13 * t));
          g.addColorStop(1, rgba('#B08A3E', 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
        }
        // testa: alone oro + cuore champagne
        const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 15);
        hg.addColorStop(0, rgba('#E7CE8E', 0.42));
        hg.addColorStop(0.45, rgba('#B08A3E', 0.22));
        hg.addColorStop(1, rgba('#B08A3E', 0));
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(head.x, head.y, 15, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgba('#FFF8E6', 0.85); ctx.beginPath(); ctx.arc(head.x, head.y, 2, 0, 6.2832); ctx.fill();
      }

      // scintille del big-bang
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        const t = 1 - p.life / p.max;
        if (t <= 0) { parts.splice(i, 1); continue; }
        if (!p.flash) { p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy = p.vy * 0.9 + 0.04; }
        const rr = p.flash ? p.size * t + 1 : (p.size * 2.2 + 1);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        g.addColorStop(0, rgba(p.color, (p.flash ? 0.55 : 0.85) * t));
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
