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
 * Pavimento riflettente sotto la bolla — luxury showroom feel.
 */
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial
        color="#f6f1e6"
        metalness={0.6}
        roughness={0.45}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Ombra-alone del pianeta sul pavimento
 */
function GroundShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.55, 0]}>
      <circleGeometry args={[2.2, 48]} />
      <meshBasicMaterial color="#15192a" transparent opacity={0.12} depthWrite={false} />
    </mesh>
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
      const r = 3 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      arr.push({
        pos: [
          Math.cos(theta) * Math.cos(phi) * r,
          Math.sin(phi) * r,
          Math.sin(theta) * Math.cos(phi) * r,
        ],
        size: 0.025 + Math.random() * 0.045,
        pulseSpeed: 0.6 + Math.random() * 0.9,
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
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + wave * 1.6;
    ref.current.scale.setScalar(0.85 + wave * 0.4);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color="#d4af37"
        emissive="#f5e6a8"
        emissiveIntensity={1}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

export function LuxuryScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5.4], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <color attach="background" args={['#00000000']} />

      {/* Lighting drammatico da showroom di lusso */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 5]} intensity={1.8} color="#ffe9b0" castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.5} color="#fff7e0" />
      <directionalLight position={[3, -2, 4]} intensity={0.5} color="#d4af37" />
      <pointLight position={[0, 0, 3]} intensity={1.3} color="#c9a849" distance={6} />
      {/* Spotlight dall'alto sulla bolla — effetto teatro */}
      <spotLight
        position={[0, 6, 2]}
        angle={0.6}
        penumbra={0.5}
        intensity={2.2}
        color="#fff2c4"
        target-position={[0, 0, 0]}
      />

      <Environment preset="studio" />

      <DistantSpheres />
      <ReflectiveFloor />
      <GroundShadow />

      <GoldSphere />
      <GoldRing />
      <MicroBolle count={40} />
    </Canvas>
  );
}
