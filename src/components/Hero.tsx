import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, PerspectiveCamera, Float, Text, ScreenSpace, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration, Scanline, Glitch } from '@react-three/postprocessing';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

function MagnifyingGlass({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const x = (mouse.x * viewport.width) / 2.5;
    const y = (mouse.y * viewport.height) / 2.5;
    meshRef.current.position.set(x, y, 2.5);
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Handle */}
      <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 16]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Rim */}
      <mesh>
        <torusGeometry args={[0.8, 0.05, 16, 100]} />
        <meshStandardMaterial color="#222222" roughness={0.1} metalness={1} />
      </mesh>
      {/* Lens */}
      <mesh ref={lensRef}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.2}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

function EvidenceMarker({ position, number }: { position: [number, number, number], number: number }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshStandardMaterial color="#E2C044" />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.2}
          color="black"
          font="https://fonts.gstatic.com/s/stardosstencil/v13/6xKtdS_v8m69U1Qv08m5mY6-S9tI.woff"
        >
          {number}
        </Text>
      </group>
    </Float>
  );
}

function DeskSurface() {
  return (
    <group position={[0, -1, 0]} rotation={[-Math.PI / 2.2, 0, 0]}>
      {/* Wood Desk */}
      <mesh receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Large Fingerprint Decal */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial 
          color="#D91A2A" 
          transparent 
          opacity={0.3}
          emissive="#D91A2A"
          emissiveIntensity={0.5}
          alphaTest={0.1}
        />
        <Text
          position={[0, 0, 0.02]}
          fontSize={1.5}
          color="#D91A2A"
          font="https://fonts.gstatic.com/s/shadowsintolight/v15/056_Xm9Z7LpNvGa-W9U09S08mXo.woff"
          fillOpacity={0.1}
        >
          ?
        </Text>
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0A0A0B"]} />
      <ambientLight intensity={0.2} />
      
      {/* Dramatic Red Spotlights */}
      <spotLight 
        position={[5, 10, 5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={100} 
        color="#D91A2A" 
        castShadow 
      />
      <spotLight 
        position={[-5, 5, 2]} 
        angle={0.2} 
        penumbra={1} 
        intensity={50} 
        color="#8B0000" 
      />
      
      <DeskSurface />
      <EvidenceMarker position={[-2, 0, 0]} number={3} />
      <EvidenceMarker position={[2, 1, -1]} number={4} />
      <MagnifyingGlass position={[0, 0, 0]} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} intensity={2} radius={0.6} />
        <Noise opacity={0.08} />
        <Vignette eskil={false} offset={0.2} darkness={1.2} />
        <ChromaticAberration offset={new THREE.Vector2(0.004, 0.004)} />
      </EffectComposer>
    </>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-[#0A0A0B] overflow-hidden">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <Scene />
      </Canvas>
      
      {/* Cinema Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 lg:p-16">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <div className="font-typewriter text-red-600 text-[10px] tracking-[0.4em] uppercase">LIVE_FORENSIC_FEED</div>
            </div>
            <div className="font-typewriter text-white/30 text-[9px] tracking-widest uppercase">CASE_ID: #4092-B // SECTOR: URBAN_VOID</div>
          </div>
          <div className="text-right">
            <div className="font-typewriter text-white/40 text-[10px] tracking-widest uppercase">EVIDENCE_COUNT: 12</div>
            <div className="font-typewriter text-white/20 text-[9px] tracking-widest">2026.08.19_13:05</div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-typewriter text-red-600 text-xs tracking-[0.6em] uppercase"
            >
              Secure Digital Evidence &amp; Case Resolution
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white font-stencil text-7xl lg:text-[10rem] tracking-tighter leading-none uppercase"
            >
              FORE<span className="text-red-600">NSIC</span>
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-lg mx-auto font-sans text-slate-300 text-xs sm:text-sm leading-relaxed"
          >
            Submit confidential documents, compromised credentials, and digital case files directly to Senior Police Inspector FIPG 3638 (<span className="text-amber-400 font-mono">bluesapphire777@gmail.com</span>) for cryptographic verification and resolution.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <button 
              onClick={() => navigate('/vault')}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              Submit Case Documents
            </button>
            <button 
              onClick={() => navigate('/signin')}
              className="px-8 py-3.5 border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              ★ Senior Investigator Login
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="font-typewriter text-[9px] text-white/20 tracking-[0.4em] uppercase">Scroll to explore the platform</div>
          <div className="w-px h-16 bg-gradient-to-b from-red-600 to-transparent" />
        </div>
      </div>

      {/* Blood Splatter Accent */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-red-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-900/5 blur-[120px] pointer-events-none" />
    </div>
  );
}
