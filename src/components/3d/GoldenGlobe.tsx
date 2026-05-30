'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

const RADIUS = 1.5;

interface City {
  name: string;
  lat: number;
  lon: number;
  aala?: boolean;
}

// Città principali + quelle dove AALA è attiva/target (aala:true)
const CITIES: City[] = [
  // ───── AALA (puntini più grandi e brillanti) ─────
  { name: 'Tirana',    lat: 41.33,  lon: 19.82,   aala: true },
  { name: 'Milano',    lat: 45.46,  lon: 9.19,    aala: true },
  { name: 'Roma',      lat: 41.90,  lon: 12.50,   aala: true },
  { name: 'London',    lat: 51.51,  lon: -0.13,   aala: true },
  { name: 'Paris',     lat: 48.86,  lon: 2.35,    aala: true },
  { name: 'Berlin',    lat: 52.52,  lon: 13.40,   aala: true },
  { name: 'Madrid',    lat: 40.42,  lon: -3.70,   aala: true },
  { name: 'New York',  lat: 40.71,  lon: -74.01,  aala: true },
  { name: 'Seoul',     lat: 37.57,  lon: 126.98,  aala: true },  // import auto
  { name: 'Dubai',     lat: 25.20,  lon: 55.27,   aala: true },  // import auto
  // ───── puntini di contesto (mondo) ─────
  { name: 'Lisbon',     lat: 38.72,  lon: -9.14 },
  { name: 'Amsterdam',  lat: 52.37,  lon: 4.90 },
  { name: 'Brussels',   lat: 50.85,  lon: 4.35 },
  { name: 'Vienna',     lat: 48.21,  lon: 16.37 },
  { name: 'Warsaw',     lat: 52.23,  lon: 21.01 },
  { name: 'Prague',     lat: 50.08,  lon: 14.44 },
  { name: 'Budapest',   lat: 47.50,  lon: 19.04 },
  { name: 'Bucharest',  lat: 44.43,  lon: 26.10 },
  { name: 'Sofia',      lat: 42.70,  lon: 23.32 },
  { name: 'Athens',     lat: 37.98,  lon: 23.73 },
  { name: 'Belgrade',   lat: 44.79,  lon: 20.45 },
  { name: 'Sarajevo',   lat: 43.86,  lon: 18.41 },
  { name: 'Zagreb',     lat: 45.81,  lon: 15.98 },
  { name: 'Pristina',   lat: 42.66,  lon: 21.16 },
  { name: 'Skopje',     lat: 41.99,  lon: 21.43 },
  { name: 'Istanbul',   lat: 41.01,  lon: 28.98 },
  { name: 'Stockholm',  lat: 59.33,  lon: 18.07 },
  { name: 'Copenhagen', lat: 55.68,  lon: 12.57 },
  { name: 'Helsinki',   lat: 60.17,  lon: 24.94 },
  { name: 'Oslo',       lat: 59.91,  lon: 10.75 },
  { name: 'Dublin',     lat: 53.35,  lon: -6.26 },
  { name: 'Cairo',      lat: 30.04,  lon: 31.24 },
  { name: 'Algiers',    lat: 36.75,  lon: 3.06 },
  { name: 'Tel Aviv',   lat: 32.08,  lon: 34.78 },
  { name: 'Mumbai',     lat: 19.08,  lon: 72.88 },
  { name: 'Singapore',  lat: 1.35,   lon: 103.82 },
  { name: 'Hong Kong',  lat: 22.32,  lon: 114.17 },
  { name: 'Tokyo',      lat: 35.68,  lon: 139.65 },
  { name: 'Sydney',     lat: -33.87, lon: 151.21 },
  { name: 'São Paulo',  lat: -23.55, lon: -46.63 },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.38 },
  { name: 'Toronto',    lat: 43.65,  lon: -79.38 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
  { name: 'Cape Town',  lat: -33.92, lon: 18.42 },
  { name: 'Lagos',      lat: 6.52,   lon: 3.38 },
];

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ];
}

function CityDot({
  position,
  aala = false,
  pulsePhase,
}: {
  position: [number, number, number];
  aala?: boolean;
  pulsePhase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    if (aala) {
      // pulsazione per le città AALA
      const v = 1 + Math.sin(s.clock.elapsedTime * 1.5 + pulsePhase) * 0.25;
      ref.current.scale.setScalar(v);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[aala ? 0.026 : 0.012, 12, 12]} />
      <meshStandardMaterial
        color={aala ? '#f5e6a8' : '#b08a3e'}
        emissive={aala ? '#f5e6a8' : '#8a6717'}
        emissiveIntensity={aala ? 1.5 : 0.4}
      />
    </mesh>
  );
}

function Arc({
  from,
  to,
  delay = 0,
}: {
  from: [number, number, number];
  to: [number, number, number];
  delay?: number;
}) {
  // Curva tra due punti che si solleva verso l'alto
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...from);
    const v2 = new THREE.Vector3(...to);
    const mid = v1.clone().add(v2).multiplyScalar(0.5);
    const dist = v1.distanceTo(v2);
    mid.normalize().multiplyScalar(RADIUS + dist * 0.4);
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [from, to]);

  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const wave = (Math.sin(s.clock.elapsedTime * 1.2 + delay) + 1) / 2;
    mat.opacity = 0.45 + wave * 0.5;
  });

  return (
    <mesh ref={ref}>
      <tubeGeometry args={[curve, 64, 0.012, 8, false]} />
      <meshBasicMaterial color="#f5e6a8" transparent opacity={0.7} />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_s, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.32;
      // Tilt fisso (~26°): inclina il polo nord verso lo spettatore così le
      // città AALA (Europa/USA, latitudini nord) e gli archi da Tirana
      // restano al centro della vista invece che schiacciati in alto.
      groupRef.current.rotation.x = 0.72 + Math.sin(_s.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  // Coordinate 3D pre-calcolate
  const dots = useMemo(
    () => CITIES.map((c, i) => ({
      ...c,
      pos: latLonToXYZ(c.lat, c.lon, RADIUS + 0.005),
      phase: (i % 7) * 0.6,
    })),
    []
  );

  const tirana = dots.find((d) => d.name === 'Tirana')!;
  const arcs = useMemo(
    () =>
      dots
        .filter((d) => d.aala && d.name !== 'Tirana')
        .map((d, i) => ({
          from: tirana.pos,
          to: d.pos,
          delay: i * 0.5,
        })),
    [dots, tirana.pos]
  );

  return (
    <group ref={groupRef}>
      {/* Sfera base — cream con leggera luminosità */}
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          color="#fbf8f0"
          metalness={0.15}
          roughness={0.35}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          emissive="#f6f1e6"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Wireframe oro ben visibile — meridiani + paralleli */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.002, 18, 14]} />
        <meshBasicMaterial
          color="#d4af37"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Secondo wireframe più fitto e più tenue per stratificare */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.001, 32, 24]} />
        <meshBasicMaterial
          color="#ecdcb0"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Puntini città */}
      {dots.map((d, i) => (
        <CityDot key={i} position={d.pos} aala={d.aala} pulsePhase={d.phase} />
      ))}

      {/* Archi da Tirana al mondo */}
      {arcs.map((a, i) => (
        <Arc key={i} from={a.from} to={a.to} delay={a.delay} />
      ))}
    </group>
  );
}

export function GoldenGlobe() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="aspect-square w-full rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #fbf8f0 0%, #efe7d3 50%, #c9a849 100%)',
          boxShadow: '0 20px 60px -20px rgba(176,138,62,0.4)',
        }}
      />
    );
  }

  return (
    <div className="relative aspect-square w-full">
      {/* alone d'oro dietro */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,175,55,0.45), transparent 70%)',
          transform: 'scale(0.85)',
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 3, 5]} intensity={1.5} color="#fff7e0" />
        <directionalLight position={[-3, -2, 2]} intensity={0.6} color="#c9a849" />
        <pointLight position={[0, 0, 3]} intensity={0.6} color="#f5e6a8" />
        <Globe />
      </Canvas>
    </div>
  );
}
