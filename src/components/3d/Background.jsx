import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSwarm({ completionRatio }) {
  const ref = useRef();
  
  const [positions] = useState(() => {
    const count = 1000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    const isPerfect = completionRatio === 1;
    const speedMult = isPerfect ? 5 : (1 + completionRatio * 2);
    ref.current.rotation.y += delta * 0.05 * speedMult;
    ref.current.rotation.x += delta * 0.02 * speedMult;
    
    const pulseIntensity = isPerfect ? 0.15 : 0.05;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * (isPerfect ? 4 : 2)) * pulseIntensity * completionRatio;
    ref.current.scale.set(pulse, pulse, pulse);
  });

  const color = new THREE.Color();
  if (completionRatio === 1) {
    color.set('#FBBF24'); // Vibrant Gold for perfect day
  } else {
    color.lerpColors(new THREE.Color('#3f3f46'), new THREE.Color('#4ADE80'), completionRatio);
  }

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.05 + completionRatio * 0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6 + completionRatio * 0.4}
      />
    </Points>
  );
}

export default function Background({ completionRatio = 0 }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-background">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <fog attach="fog" args={['#0B0B0C', 2, 10]} />
        <ambientLight intensity={0.5} />
        <ParticleSwarm completionRatio={completionRatio} />
      </Canvas>
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
    </div>
  );
}
