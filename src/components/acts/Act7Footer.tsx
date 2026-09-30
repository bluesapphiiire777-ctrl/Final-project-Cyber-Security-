import React from 'react';
import { motion } from 'motion/react';
import { Shield, Github, Globe, Mail, ChevronRight, Share2, Activity, Database, CheckCircle2, KeyRound, Fingerprint, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Act7Footer: React.FC = () => {
  return (
    <footer id="footer" className="relative pt-24 pb-16 bg-transparent border-t border-zinc-800 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Call to action typography */}
        <div className="mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold"
          >
            INVESTIGATION CONCLUSION
          </motion.div>
          <h2 className="text-white text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight uppercase leading-tight">
            EVERY DIGITAL TRACE<br />
            <span className="text-red-500 italic font-editorial">MATTERS.</span>
          </h2>
          <p className="text-zinc-300 font-mono text-sm sm:text-base max-w-2xl leading-relaxed">
            Unified forensic intelligence platform designed for law enforcement, incident response units, and enterprise forensic examiners.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/signin"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
            >
              <KeyRound size={15} />
              <span>ACCESS VAULT SIGN IN</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-[#14151e] hover:bg-zinc-800 border border-zinc-700 hover:border-red-500 text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all"
            >
              <Fingerprint size={15} className="text-amber-400" />
              <span>REGISTER BADGE / ACCOUNT</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                 <Shield size={22} />
              </div>
              <div>
                <span className="text-xl font-display font-black tracking-wider text-white uppercase">F.I.P</span>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Forensic Investigation Platform</div>
              </div>
            </div>
            <p className="text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed max-w-md">
               Multi-tool normalization, automated timeline reconstruction, and interactive spatial relationship correlation.
            </p>
            
            <div className="flex items-center gap-3">
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Database, label: 'Ledger' },
                { icon: Activity, label: 'Telemetry' },
                { icon: Share2, label: 'Graph' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="w-9 h-9 rounded bg-[#14151e] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer">
                    <Icon size={16} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="text-amber-400 font-mono text-xs tracking-wider uppercase font-bold">CORE CAPABILITIES</div>
            <ul className="space-y-2.5">
              {[
                { label: 'Artifact Ingestion', href: '#features' },
                { label: 'Evidence Board', href: '#evidence' },
                { label: 'Analysis Engine', href: '#analysis' },
                { label: 'Temporal Reconstruction', href: '#timeline' },
                { label: 'Visual Intelligence Graph', href: '#graph' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-zinc-400 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5 group">
                    <ChevronRight size={12} className="text-red-500 group-hover:translate-x-0.5 transition-transform" /> {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-4">
             <div className="text-amber-400 font-mono text-xs tracking-wider uppercase font-bold">SYSTEM TELEMETRY</div>
             <div className="p-5 bg-[#14151e]/90 border border-zinc-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                      <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">ALL SUBSYSTEMS NOMINAL</span>
                   </div>
                   <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">v4.2 PROD</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-zinc-300">
                   <div className="flex justify-between">
                      <span className="text-zinc-500">INGESTION ENGINE:</span>
                      <span className="text-zinc-200 font-bold">ACTIVE (0 LAG)</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-zinc-500">INTEGRITY LEDGER:</span>
                      <span className="text-zinc-200 font-bold">CRYPTOGRAPHICALLY SEALED</span>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-400">
          <div>
            © 2026 FORENSIC INVESTIGATION PLATFORM (F.I.P) // ALL RIGHTS RESERVED
          </div>
          <div className="flex flex-wrap gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Chain of Custody Standard</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Ledger</span>
            <span className="hover:text-white transition-colors cursor-pointer">ISO/IEC 27037 Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Act7Footer;
