'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function GoldSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.18;
    ref.current.rotation.x += dt * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.55, 24]} />
        <MeshDistortMaterial
          color="#d4a857"
          metalness={1}
          roughness={0.15}
          distort={0.28}
          speed={1.1}
          emissive="#7a5a18"
          emissiveIntensity={0.18}
        />
      </mesh>
    </Float>
  );
}

function GoldRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * 0.08;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.4;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.2]}>
      <torusGeometry args={[2.6, 0.025, 16, 200]} />
      <meshStandardMaterial
        color="#c9a849"
        metalness={1}
        roughness={0.3}
        emissive="#8a6717"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

/**
 * Sfere distanti orbitanti — danno profondità e scala
 */
function DistantSpheres() {
  const groupRef = useRef<THREE.Group>(null);

  const spheres = useMemo(
    () => [
      { radius: 5.5, speed: 0.05, phase: 0, size: 0.4, tilt: 0.3, color: '#c9a849' },
      { radius: 6.8, speed: -0.03, phase: 2.1, size: 0.32, tilt: -0.5, color: '#ecdcb0' },
      { radius: 7.5, speed: 0.04, phase: 4.5, size: 0.28, tilt: 0.7, color: '#b08a3e' },
      { radius: 8.2, speed: -0.02, phase: 5.8, size: 0.5, tilt: -0.2, color: '#d4af37' },
    ],
    []
  );

  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const sp = spheres[i];
      const t = s.clock.elapsedTime * sp.speed + sp.phase;
      child.position.x = Math.cos(t) * sp.radius;
      child.position.z = Math.sin(t) * sp.radius - 2; // sempre dietro la bolla
      child.position.y = Math.sin(t * 1.3 + sp.tilt) * 1.5;
    });
  });

  return (
    <group ref={groupRef}>
      {spheres.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[s.size, 24, 24]} />
          <meshStandardMaterial
            color={s.color}
            metalness={0.85}
            roughness={0.25}
            emissive={s.color}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Micro-bolle d'oro che orbitano in spazio attorno alla bolla principale.
 * Sostituiscono le vecchie "particelle squadrate" (point sprites).
 */
function MicroBolle({ count = 40 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    const arr: {
      pos: [number, number, number];
      size: number;
      pulseSpeed: number;
      phase: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 2.7 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.85;
      // ~1 su 6 è una bollicina "grande" per varietà
      const big = i % 6 === 0;
      arr.push({
        pos: [
          Math.cos(theta) * Math.cos(phi) * r,
          Math.sin(phi) * r,
          Math.sin(theta) * Math.cos(phi) * r,
        ],
        size: big ? 0.09 + Math.random() * 0.05 : 0.025 + Math.random() * 0.04,
        pulseSpeed: 0.5 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  useFrame((_s, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.04;
  });

  return (
    <group ref={groupRef}>
      {items.map((p, i) => (
        <MicroBollaDot key={i} {...p} />
      ))}
    </group>
  );
}

function MicroBollaDot({
  pos,
  size,
  pulseSpeed,
  phase,
}: {
  pos: [number, number, number];
  size: number;
  pulseSpeed: number;
  phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    const wave = (Math.sin(t * pulseSpeed + phase) + 1) / 2;
    const mat = ref.current.material as THREE.MeshPhysicalMaterial;
    mat.emissiveIntensity = 0.4 + wave * 1.2;
    ref.current.scale.setScalar(0.85 + wave * 0.45);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshPhysicalMaterial
        color="#e8c97a"
        emissive="#f5e6a8"
        emissiveIntensity={0.8}
        metalness={0.35}
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.1}
        iridescence={0.6}
        iridescenceIOR={1.3}
      />
    </mesh>
  );
}

export function LuxuryScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      {/* Illuminazione morbida — fa scorrere riflessi dolci sulla superficie
          morfante (effetto "bolla di Zhiva" viva). Niente spotlight forti che
          creano hotspot bianchi e appiattiscono il morphing. */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 4, 5]} intensity={1.4} color="#ffe9b0" />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#fff7e0" />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#c9a849" distance={6} />

      <Environment preset="studio" />

      <DistantSpheres />

      <GoldSphere />
      <GoldRing />
      <MicroBolle count={40} />
    </Canvas>
  );
}
