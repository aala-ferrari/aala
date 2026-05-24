'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

export type Shape3DKind = 'cube' | 'diamond' | 'ring' | 'knot';

function ShapeMesh({
  kind,
  color,
  intensity = 1,
}: {
  kind: Shape3DKind;
  color: string;
  intensity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const speeds = useMemo(() => {
    switch (kind) {
      case 'cube':    return { y: 0.40, x: 0.18 };
      case 'diamond': return { y: 0.60, x: 0.24 };
      case 'ring':    return { y: 0.28, x: 0.65 };
      case 'knot':    return { y: 0.50, x: 0.28 };
    }
  }, [kind]);

  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * speeds.y * intensity;
    ref.current.rotation.x += dt * speeds.x * intensity;
    // breath: scale pulse leggero
    const pulse = 1 + Math.sin(s.clock.elapsedTime * 1.2) * 0.04;
    ref.current.scale.setScalar(pulse);
  });

  const c = useMemo(() => new THREE.Color(color), [color]);

  const material = (
    <meshPhysicalMaterial
      color={c}
      metalness={0.5}
      roughness={0.2}
      emissive={c}
      emissiveIntensity={0.55}
      clearcoat={0.6}
      clearcoatRoughness={0.2}
    />
  );

  const geometry = (() => {
    switch (kind) {
      case 'cube':    return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case 'diamond': return <octahedronGeometry args={[1.2, 0]} />;
      case 'ring':    return <torusGeometry args={[0.95, 0.32, 24, 96]} />;
      case 'knot':    return <torusKnotGeometry args={[0.78, 0.28, 160, 28, 2, 3]} />;
    }
  })();

  return (
    <Float speed={2 * intensity} rotationIntensity={0.6} floatIntensity={0.9}>
      <mesh ref={ref}>
        {geometry}
        {material}
      </mesh>
    </Float>
  );
}

function OrbitRing({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * 0.2 * intensity;
    ref.current.rotation.x =
      Math.sin(s.clock.elapsedTime * 0.5 * intensity) * 0.65;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.75, 0.018, 12, 96]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={1}
        roughness={0.3}
        emissive="#8a6717"
        emissiveIntensity={0.7}
      />
    </mesh>
  );
}

function Particles({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const ref = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const arr: { r: number; theta: number; tilt: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        r: 1.95 + Math.random() * 0.35,
        theta: (i / 8) * Math.PI * 2 + Math.random() * 0.4,
        tilt: (Math.random() - 0.5) * 0.9,
        size: 0.05 + Math.random() * 0.05,
        speed: 0.3 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  useFrame((_s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.15 * intensity;
    ref.current.rotation.x += dt * 0.05 * intensity;
  });

  return (
    <group ref={ref}>
      {items.map((p, i) => {
        const x = Math.cos(p.theta) * p.r;
        const z = Math.sin(p.theta) * p.r;
        const y = Math.sin(p.tilt) * 0.6;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[p.size, 12, 12]} />
            <meshStandardMaterial
              color="#d4af37"
              emissive={color}
              emissiveIntensity={1.4}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function MiniShape3D({
  kind,
  color,
  hover = false,
  className,
}: {
  kind: Shape3DKind;
  color: string;
  hover?: boolean;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setMounted(true);
  }, []);

  if (!mounted) {
    const clipPath = (() => {
      switch (kind) {
        case 'cube':    return 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)';
        case 'diamond': return 'polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)';
        case 'ring':    return 'circle(45% at 50% 50%)';
        case 'knot':    return 'circle(45% at 50% 50%)';
      }
    })();
    return (
      <div className={className}>
        <div
          className="h-full w-full"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${color}cc 0%, ${color}80 50%, transparent 80%)`,
            clipPath,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <Canvas
        camera={{ position: [0, 0, 3.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 3, 4]} intensity={1.6} color="#fff7e0" />
        <directionalLight position={[-3, -2, 2]} intensity={0.9} color={color} />
        <pointLight position={[0, 0, 2.5]} intensity={1.3} color="#ffd28a" />
        <pointLight position={[2, -2, 1]} intensity={0.7} color={color} />
        <ShapeMesh kind={kind} color={color} intensity={hover ? 1.7 : 1} />
        <OrbitRing intensity={hover ? 1.6 : 1} />
        <Particles color={color} intensity={hover ? 1.8 : 1} />
      </Canvas>

      {/* halo CSS */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-50"
        style={{
          background: `radial-gradient(circle, ${color}33 25%, transparent 70%)`,
          filter: 'blur(10px)',
          transform: 'scale(1.2)',
        }}
      />
    </div>
  );
}
