import { motion, useScroll, useTransform } from 'motion/react';

export default function BackgroundEngine() {
  const { scrollYProgress } = useScroll();
  
  // Parallax layers with different speeds
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0d12]">
      {/* Layer 1: Visible Technical Grid */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 blueprint-grid opacity-60"
      />

      {/* Layer 1.5: Secondary Dense Crimson Grid */}
      <div className="absolute inset-0 blueprint-grid-dense opacity-30" />

      {/* High-tech Coordinate Overlay Watermarks */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 select-none opacity-25">
        <div className="flex justify-between font-mono text-[10px] text-zinc-400">
          <span>+ GRID: FORENSIC_SEC_01</span>
          <span>LAT: 47.3769° N // LON: 8.5417° E</span>
          <span>SYS_CORE: ONLINE</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-zinc-400">
          <span>ENC: AES-256-GCM</span>
          <span>FIP_INTEGRITY_LEDGER_V4</span>
          <span>+ COORD: 0x88F9</span>
        </div>
      </div>

      {/* Layer 2: Floating Digital Forensic Data Badges */}
      <div className="absolute inset-0">
        {[
          { top: '15%', left: '8%', id: '0x4A19', status: 'SYNTHETIC_ACTIVE' },
          { top: '35%', right: '10%', id: '0x88B2', status: 'CORRELATED' },
          { top: '65%', left: '12%', id: '0xF104', status: 'SECURE_NODE' },
          { top: '80%', right: '15%', id: '0x3C90', status: 'TRACED' },
        ].map((item, i) => (
          <motion.div
            key={i}
            style={{ 
              y: i % 2 === 0 ? y2 : y1,
              rotate: i % 2 === 0 ? rotate1 : 0,
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            className="absolute p-3 border border-red-500/20 bg-[#14151e]/60 backdrop-blur-sm hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: i * 0.2 }}
          >
            <div className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest space-y-1">
              <div className="text-red-400 font-bold">NODE: {item.id}</div>
              <div className="w-10 h-0.5 bg-red-500/50" />
              <div className="text-[8px] text-zinc-400">{item.status}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Layer 3: Vibrant Ambient Glowing Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(220,38,38,0.25)_0%,rgba(220,38,38,0.08)_45%,transparent_70%)] blur-[80px]"
      />
      <motion.div 
        animate={{ 
          scale: [1.15, 1, 1.15],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.2)_0%,rgba(220,38,38,0.08)_40%,transparent_70%)] blur-[90px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(220,38,38,0.2)_0%,transparent_70%)] blur-[100px]"
      />

      {/* Scanning Laser Line */}
      <motion.div 
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.8)] z-10"
      />
    </div>
  );
}
