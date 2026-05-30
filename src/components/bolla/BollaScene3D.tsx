'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import type { BollaMood } from '@/lib/bolla-brain';

/**
 * La Bolla di Zhiva incarnata nell'assistente — reagisce allo stato:
 *  - idle: morfa dolce, ruota lenta
 *  - thinking: morfa intenso, pulsa, gira veloce
 *  - speaking: pulsazione ritmica
 * Il colore transiziona dolcemente (lerp) quando cambia argomento.
 */

function ReactiveSphere({ mood, color }: { mood: BollaMood; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<any>(null);
  const targetColor = useMemo(() => new THREE.Color(color), [color]);
  const targetEmissive = useMemo(() => new THREE.Color(color).multiplyScalar(0.35), [color]);

  useFrame((s, dt) => {
    if (!ref.current || !matRef.current) return;
    const t = s.clock.elapsedTime;

    // velocità rotazione e morphing per mood
    const spin = mood === 'thinking' ? 0.6 : mood === 'speaking' ? 0.3 : 0.18;
    ref.current.rotation.y += dt * spin;
    ref.current.rotation.x += dt * spin * 0.4;

    // distorsione/velocità del materiale
    const targetDistort = mood === 'thinking' ? 0.55 : mood === 'speaking' ? 0.4 : 0.3;
    const targetSpeed = mood === 'thinking' ? 4 : mood === 'speaking' ? 2.5 : 1.4;
    matRef.current.distort = THREE.MathUtils.lerp(matRef.current.distort, targetDistort, dt * 3);
    matRef.current.speed = THREE.MathUtils.lerp(matRef.current.speed, targetSpeed, dt * 3);

    // pulsazione scale quando parla / pensa
    const pulse =
      mood === 'speaking'
        ? 1 + Math.sin(t * 8) * 0.05
        : mood === 'thinking'
        ? 1 + Math.sin(t * 5) * 0.03
        : 1;
    ref.current.scale.setScalar(pulse);

    // transizione colore dolce
    matRef.current.color.lerp(targetColor, dt * 2.5);
    matRef.current.emissive.lerp(targetEmissive, dt * 2.5);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.5, 32]} />
        <MeshDistortMaterial
          ref={matRef}
          color={color}
          metalness={0.9}
          roughness={0.18}
          distort={0.3}
          speed={1.4}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function OrbitDots({ mood, color }: { mood: BollaMood; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const c = useMemo(() => new THREE.Color(color), [color]);

  const dots = useMemo(() => {
    const arr: { pos: [number, number, number]; size: number; phase: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const r = 2.1 + Math.random() * 0.8;
      const theta = (i / 14) * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.4;
      arr.push({
        pos: [
          Math.cos(theta) * Math.cos(phi) * r,
          Math.sin(phi) * r,
          Math.sin(theta) * Math.cos(phi) * r,
        ],
        size: 0.03 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame((s, dt) => {
    if (!groupRef.current) return;
    const spin = mood === 'thinking' ? 0.5 : 0.12;
    groupRef.current.rotation.y += dt * spin;
  });

  return (
    <group ref={groupRef}>
      {dots.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.size, 16, 16]} />
          <meshStandardMaterial
            color={c}
            emissive={c}
            emissiveIntensity={1.4}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function BollaScene3D({ mood, color }: { mood: BollaMood; color: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(!reduced);
  }, []);

  if (!enabled) {
    return (
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color} 0%, ${color}88 50%, transparent 75%)`,
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 5]} intensity={1.5} color="#fff7e0" />
      <directionalLight position={[-4, 2, -2]} intensity={0.7} color={color} />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#ffe9b0" />
      <Environment preset="studio" />
      <ReactiveSphere mood={mood} color={color} />
      <OrbitDots mood={mood} color={color} />
    </Canvas>
  );
}
