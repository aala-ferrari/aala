'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function GoldSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
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

function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      positions[i * 3 + 0] = Math.cos(theta) * Math.cos(phi) * r;
      positions[i * 3 + 1] = Math.sin(phi) * r;
      positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r;
      sizes[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions, sizes };
  }, [count]);

  useFrame((s, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#b08a3e"
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
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
      <color attach="background" args={['#00000000']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 4, 5]} intensity={1.4} color="#ffe9b0" />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#fff7e0" />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#c9a849" distance={6} />

      <Environment preset="studio" />

      <GoldSphere />
      <GoldRing />
      <Particles count={120} />
    </Canvas>
  );
}
