'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useMemo, useEffect, useState, type ReactNode } from 'react';
import * as THREE from 'three';

function Sphere({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.5 * intensity;
    ref.current.rotation.x += dt * 0.18 * intensity;
  });

  const c = useMemo(() => new THREE.Color(color), [color]);

  return (
    <Float speed={2.4 * intensity} rotationIntensity={0.7} floatIntensity={1.1}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.95, 32]} />
        <MeshDistortMaterial
          color={c}
          metalness={0.4}
          roughness={0.28}
          distort={0.5}
          speed={2.3 * intensity}
          emissive={c}
          emissiveIntensity={0.7}
        />
      </mesh>
    </Float>
  );
}

function GoldRing({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * 0.18 * intensity;
    ref.current.rotation.x =
      Math.sin(s.clock.elapsedTime * 0.5 * intensity) * 0.55;
    ref.current.rotation.y =
      Math.cos(s.clock.elapsedTime * 0.4 * intensity) * 0.3;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusGeometry args={[1.55, 0.025, 12, 96]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={1}
        roughness={0.25}
        emissive="#8a6717"
        emissiveIntensity={0.7}
      />
    </mesh>
  );
}

/**
 * MiniBolla: oggetto 3D dorato animato con anello orbitante.
 * `icon`: ReactNode disegnato in overlay sopra il canvas (sta fermo, la bolla
 * gira dietro). Pensato per le card servizi/valori.
 */
export function MiniBolla({
  color,
  hover = false,
  className,
  icon,
}: {
  color: string;
  hover?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        <div
          className="relative h-full w-full"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color}cc 0%, ${color}80 40%, transparent 70%)`,
          }}
        >
          {icon && (
            <div className="absolute inset-0 flex items-center justify-center text-white/90">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 4]} intensity={1.6} color="#fff7e0" />
        <directionalLight position={[-3, -2, 2]} intensity={0.9} color={color} />
        <pointLight position={[0, 0, 2.5]} intensity={1.3} color="#ffd28a" />
        <pointLight position={[2, -2, 1]} intensity={0.7} color={color} />
        <Sphere color={color} intensity={hover ? 1.7 : 1} />
        <GoldRing color={color} intensity={hover ? 1.5 : 1} />
      </Canvas>

      {/* halo CSS pulsante */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle, ${color}33 30%, transparent 70%)`,
          filter: 'blur(8px)',
          transform: 'scale(1.15)',
        }}
      />

      {/* icona statica in overlay — sopra al canvas */}
      {icon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full bg-canvas-paper/70 p-2 shadow-soft backdrop-blur-sm"
            style={{ color }}
          >
            {icon}
          </div>
        </div>
      )}
    </div>
  );
}
