import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ForensicNodes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  const nodes = [
    { pos: [2.2, 0.4, 0], color: '#EF4444' },
    { pos: [-2.2, 1.2, 0.8], color: '#F59E0B' },
    { pos: [0, -2.0, -0.8], color: '#EF4444' },
    { pos: [1.2, 1.8, -1.0], color: '#10B981' },
    { pos: [-1.4, -1.2, 1.6], color: '#EF4444' },
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <group key={i} position={node.pos as [number, number, number]}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1.5} wireframe />
            </mesh>
          </Float>
          {/* Connection Lines to Center */}
          <line>
            <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(...node.pos as [number, number, number])])} />
            <lineBasicMaterial attach="material" color="#6B7280" transparent opacity={0.4} />
          </line>
        </group>
      ))}

      {/* Central Core */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial color="#F59E0B" speed={2} distort={0.25} radius={1} />
      </mesh>
    </group>
  );
}

export default function Act9Reconstruction() {
  return (
    <section id="reconstruction" className="relative min-h-[85vh] py-20 md:py-28 bg-transparent overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#EF4444" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#F59E0B" />
          
          <Suspense fallback={null}>
            <ForensicNodes />
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
          />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 pointer-events-none flex flex-col justify-between min-h-[70vh]">
        <div className="space-y-4 max-w-xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
             SECTION_08 // SPATIAL RECONSTRUCTION
           </div>
           <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-tight">
              RECONSTRUCT<br />
              <span className="text-amber-400 italic font-editorial">THE TRACE.</span>
           </h2>
           <p className="text-zinc-200 font-mono text-sm sm:text-base leading-relaxed bg-[#14151e]/80 p-4 rounded-lg border border-zinc-800 backdrop-blur">
              Interactive 3D spatial reconstruction of digital entity clusters. Correlate memory blocks, network nodes, and file extractions in real-time.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-12">
           <div className="p-4 rounded-lg border border-zinc-800 bg-[#14151e]/90 backdrop-blur-xl">
              <div className="text-amber-400 font-mono text-xs tracking-wider uppercase font-bold mb-2">ENGINE TELEMETRY</div>
              <div className="space-y-1 text-xs font-mono text-zinc-300">
                 <div className="flex justify-between gap-8">
                    <span className="text-zinc-400">3D RENDERING:</span>
                    <span className="text-emerald-400 font-bold">WEBGL ACCELERATED</span>
                 </div>
                 <div className="flex justify-between gap-8">
                    <span className="text-zinc-400">NODE TOPOLOGY:</span>
                    <span className="text-white font-bold">5 MULTI-LINKED CLUSTERS</span>
                 </div>
              </div>
           </div>
           
           <div className="text-right bg-[#14151e]/80 px-4 py-2 rounded border border-zinc-800">
              <div className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-bold">DRAG TO ROTATE 3D PERSPECTIVE</div>
           </div>
        </div>
      </div>
    </section>
  );
}
