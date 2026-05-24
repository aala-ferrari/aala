'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Pianeta dorato smooth con sistema di anelli stile Saturno.
 * Sostituisce la bolla morfante.
 */
function RingedPlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringSysRef = useRef<THREE.Group>(null);

  useFrame((_s, dt) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += dt * 0.15;
    }
    if (ringSysRef.current) {
      ringSysRef.current.rotation.z += dt * 0.04;
    }
  });

  return (
    <Float speed={1.0} rotationIntensity={0.18} floatIntensity={0.5}>
      <group>
        {/* Pianeta — perla d'oro lucida, iridescente */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[0.95, 96, 96]} />
          <meshPhysicalMaterial
            color="#e8c97a"
            metalness={0.45}
            roughness={0.32}
            emissive="#c9a849"
            emissiveIntensity={0.3}
            clearcoat={0.7}
            clearcoatRoughness={0.2}
            iridescence={0.5}
            iridescenceIOR={1.3}
          />
        </mesh>

        {/* Highlight bianco di lustro */}
        <mesh position={[-0.3, 0.35, 0.7]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color="#fff7e0" transparent opacity={0.25} />
        </mesh>

        {/* Sistema anelli tipo Saturno — inclinato */}
        <group ref={ringSysRef} rotation={[Math.PI / 2.4, 0, Math.PI / 9]}>
          {/* Anello principale ampio dorato */}
          <mesh>
            <ringGeometry args={[1.35, 2.0, 128, 1]} />
            <meshStandardMaterial
              color="#d4af37"
              emissive="#8a6717"
              emissiveIntensity={0.55}
              side={THREE.DoubleSide}
              transparent
              opacity={0.78}
            />
          </mesh>

          {/* Cassini division — gap nel mezzo */}
          <mesh>
            <ringGeometry args={[1.68, 1.74, 128, 1]} />
            <meshBasicMaterial
              color="#fbf8f0"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Anello esterno luminoso */}
          <mesh>
            <ringGeometry args={[2.08, 2.22, 128, 1]} />
            <meshStandardMaterial
              color="#ecdcb0"
              emissive="#f5e6a8"
              emissiveIntensity={0.9}
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Sub-ring interno sottile */}
          <mesh>
            <ringGeometry args={[1.12, 1.22, 128, 1]} />
            <meshStandardMaterial
              color="#f5e6a8"
              emissive="#d4af37"
              emissiveIntensity={0.5}
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>

        {/* Alone diffuso attorno al pianeta */}
        <mesh>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshBasicMaterial
            color="#f5e6a8"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

function OrbitalRing({
  radius,
  thickness,
  speed,
  tilt,
  color = '#d4af37',
  emissive = '#8a6717',
}: {
  radius: number;
  thickness: number;
  speed: number;
  tilt: [number, number, number];
  color?: string;
  emissive?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <meshStandardMaterial
        color={color}
        metalness={1}
        roughness={0.25}
        emissive={emissive}
        emissiveIntensity={0.7}
      />
    </mesh>
  );
}

/**
 * Pianeta in orbita: piccolo orb gold che gira attorno al centro a quota fissa.
 */
function OrbitingDot({
  radius,
  speed,
  tilt,
  offset = 0,
}: {
  radius: number;
  speed: number;
  tilt: [number, number, number];
  offset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = s.clock.elapsedTime * speed + offset;
  });
  return (
    <group ref={groupRef} rotation={tilt}>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#f5e6a8"
          emissive="#f5e6a8"
          emissiveIntensity={2}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({ count = 120 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    const arr: { pos: [number, number, number]; size: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.95;
      arr.push({
        pos: [
          Math.cos(theta) * Math.cos(phi) * r,
          Math.sin(phi) * r,
          Math.sin(theta) * Math.cos(phi) * r,
        ],
        size: 0.015 + Math.random() * 0.025,
        speed: 0.3 + Math.random() * 0.6,
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
        <ParticleDot key={i} {...p} />
      ))}
    </group>
  );
}

function ParticleDot({
  pos,
  size,
  speed,
  phase,
}: {
  pos: [number, number, number];
  size: number;
  speed: number;
  phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    const wave = (Math.sin(t * speed + phase) + 1) / 2;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + wave * 1.8;
    ref.current.scale.setScalar(0.8 + wave * 0.6);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#d4af37"
        emissive="#f5e6a8"
        emissiveIntensity={1}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <RingedPlanet />

      {/* Anelli orrery oltre il sistema di Saturno (più esterni per non sovrapporsi) */}
      <OrbitalRing radius={2.7} thickness={0.018} speed={0.15} tilt={[0, Math.PI / 4, Math.PI / 6]} color="#c9a849" />
      <OrbitalRing radius={3.3} thickness={0.013} speed={-0.10} tilt={[Math.PI / 2.5, Math.PI / 5, 0]} />
      <OrbitalRing radius={3.9} thickness={0.01} speed={0.07} tilt={[Math.PI / 4, -Math.PI / 6, 0]} color="#ecdcb0" />

      {/* Pianeti orbitanti sugli anelli esterni */}
      <OrbitingDot radius={2.7} speed={0.22} tilt={[0, Math.PI / 4, Math.PI / 6]} offset={3} />
      <OrbitingDot radius={3.3} speed={-0.15} tilt={[Math.PI / 2.5, Math.PI / 5, 0]} offset={1.5} />
      <OrbitingDot radius={3.9} speed={0.10} tilt={[Math.PI / 4, -Math.PI / 6, 0]} offset={4} />

      <FloatingParticles count={90} />
    </>
  );
}

export function Orrery() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(212,175,55,0.35), transparent 70%)',
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 1.2, 7.5], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
      className="!absolute inset-0"
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 4, 5]} intensity={1.6} color="#fff7e0" />
      <directionalLight position={[-4, -2, 3]} intensity={0.7} color="#d4af37" />
      <pointLight position={[0, 0, 3]} intensity={1.4} color="#f5e6a8" />
      <pointLight position={[2, -2, 2]} intensity={0.6} color="#ecdcb0" />
      <Scene />
    </Canvas>
  );
}
