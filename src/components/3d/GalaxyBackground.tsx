'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Sfondo galassia 3D dietro tutta la pagina — versione AALA su sfondo CREMA.
 * Spirale inclinata che ruota piano (come il riferimento "nabuel-galaxy"), ma
 * con palette scura/satura (oro profondo, bronzo, navy, rosé) così le particelle
 * si VEDONO sul crema invece di sbiadire. Sottile, non compete col contenuto.
 * Si mette pausa quando la scheda è nascosta, rispetta "riduci animazioni" ed è
 * più leggera su mobile (batteria).
 */
export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    // palette pensata per FONDO CHIARO (colori medio-scuri, si vedono sul crema)
    const CORE = new THREE.Color('#9c7322'); // oro profondo (centro)
    // particelle: oro profondo, oro, bronzo, oro scuro, navy soft, rosé
    const PAL = ['#a07a26', '#c9a849', '#b0883e', '#876326', '#2f3f5c', '#b07a6a'].map(
      (h) => new THREE.Color(h)
    );
    // stelle di sfondo: toni medi visibili sul chiaro
    const STAR = ['#c9a849', '#8f96a8', '#b0883e'].map((h) => new THREE.Color(h));

    const N = reduced ? 0 : isMobile ? 1700 : 3800;
    const STARS = reduced ? 0 : isMobile ? 400 : 750;
    const R = 255;
    const ARMS = 3;
    const TILT = -0.22;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(
      68,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    cam.position.set(0, 150, 300);

    const VERT =
      'attribute float aSize; attribute vec3 aColor; varying vec3 vColor;' +
      'void main(){ vColor=aColor; vec4 mv=modelViewMatrix*vec4(position,1.0);' +
      'gl_PointSize=clamp(aSize*(320.0/-mv.z),0.0,40.0); gl_Position=projectionMatrix*mv; }';
    const FRAG =
      'varying vec3 vColor; uniform float uAlpha;' +
      'void main(){ float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard;' +
      'float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(vColor, a*a*uAlpha); }';

    function makeCloud(
      n: number,
      build: (
        n: number,
        pos: Float32Array,
        tgt: Float32Array,
        col: Float32Array,
        siz: Float32Array
      ) => void,
      alpha: number
    ) {
      const pos = new Float32Array(n * 3);
      const tgt = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const siz = new Float32Array(n);
      build(n, pos, tgt, col, siz);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
      const m = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: { uAlpha: { value: alpha } },
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      return { pts: new THREE.Points(g, m), pos, tgt, g };
    }

    // ---- galassia a spirale ----
    const gx = makeCloud(
      N,
      (n, pos, tgt, col, siz) => {
        for (let i = 0; i < n; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 3;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
          const r = Math.pow(Math.random(), 0.6) * R + 6;
          const arm = Math.floor(Math.random() * ARMS) * ((Math.PI * 2) / ARMS);
          const a = arm + r * 0.016 + (Math.random() - 0.5) * 0.55;
          const thick =
            (Math.random() - 0.5) *
            36 *
            Math.pow(1 - Math.min(r, R + 45) / (R + 45), 1.4);
          tgt[i * 3] = Math.cos(a) * r;
          tgt[i * 3 + 1] = thick;
          tgt[i * 3 + 2] = Math.sin(a) * r;
          const f = r / R;
          const c = f < 0.16 ? CORE : PAL[(Math.random() * PAL.length) | 0];
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
          siz[i] = f < 0.16 ? 3.5 + Math.random() * 3.5 : 1.7 + Math.random() * 3.0;
        }
      },
      0.6
    );
    scene.add(gx.pts);

    // ---- stelle lontane ----
    const sf = makeCloud(
      STARS,
      (n, pos, tgt, col, siz) => {
        for (let i = 0; i < n; i++) {
          const RR = 650 + Math.random() * 800;
          const th = Math.random() * 6.283;
          const ph = Math.acos(2 * Math.random() - 1);
          const x = RR * Math.sin(ph) * Math.cos(th);
          const y = RR * Math.cos(ph) * 0.6;
          const z = RR * Math.sin(ph) * Math.sin(th);
          pos[i * 3] = x;
          pos[i * 3 + 1] = y;
          pos[i * 3 + 2] = z;
          tgt[i * 3] = x;
          tgt[i * 3 + 1] = y;
          tgt[i * 3 + 2] = z;
          const c = STAR[(Math.random() * STAR.length) | 0];
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
          siz[i] = 2.6 + Math.random() * 3.2;
        }
      },
      0.5
    );
    scene.add(sf.pts);

    // nucleo dorato + alone
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(5, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xa07a26 })
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(13, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xc9a849,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
    );
    scene.add(core);
    scene.add(halo);

    let t = 0;
    let mx = 0;
    let my = 0;
    let raf = 0;
    let running = true;
    const bigBang = 2.6;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    };
    const onVis = () => {
      running = !document.hidden;
      if (running) loop();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    resize();

    function loop() {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      t += 0.006;
      const k = Math.min(1, t / bigBang);
      const ease = 1 - Math.pow(1 - k, 3);
      if (k < 1 && N > 0) {
        const p = gx.g.attributes.position.array as Float32Array;
        for (let i = 0; i < N * 3; i++) {
          p[i] = gx.pos[i] + (gx.tgt[i] - gx.pos[i]) * ease;
        }
        gx.g.attributes.position.needsUpdate = true;
      }
      gx.pts.rotation.x = TILT;
      gx.pts.rotation.y += 0.00085;
      gx.pts.rotation.z = 0.12;
      sf.pts.rotation.y += 0.00022;
      const pulse = 1 + Math.sin(t * 3) * 0.16;
      core.scale.setScalar(pulse);
      halo.scale.setScalar(pulse);
      const orbit = t * 0.04;
      cam.position.x +=
        (Math.sin(orbit) * 80 + mx * 120 - cam.position.x) * 0.03;
      cam.position.y += (150 - my * 70 - cam.position.y) * 0.03;
      cam.position.z += (300 + Math.cos(orbit) * 40 - cam.position.z) * 0.02;
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
    }
    loop();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      gx.g.dispose();
      sf.g.dispose();
      (gx.pts.material as THREE.Material).dispose();
      (sf.pts.material as THREE.Material).dispose();
      core.geometry.dispose();
      halo.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // leggerissima profondità calda al centro per "reggere" la galassia
        background:
          'radial-gradient(ellipse at 50% 38%, rgba(14,25,42,0.05), rgba(160,122,38,0.02) 45%, transparent 70%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ opacity: 0.85 }}
      />
    </div>
  );
}
