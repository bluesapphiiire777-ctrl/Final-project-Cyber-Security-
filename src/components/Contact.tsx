import { motion } from 'motion/react';
import { Mail, Shield, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-red-600/30 rounded-full mb-6 text-red-600 bg-red-600/5">
            <Mail size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4">DIRECT <span className="text-red-600">CHANNELS</span></h1>
          <p className="text-slate-500 text-xs font-black tracking-[0.3em] uppercase">ENCRYPTED COMMUNICATION LINES OPEN</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center shrink-0 text-red-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-widest uppercase mb-2">HEADQUARTERS</h3>
                <p className="text-slate-500 text-sm font-mono uppercase leading-relaxed">
                  BUREAU OF INVESTIGATION<br />
                  SECTOR 9, DISTRICT C<br />
                  SUITE 404 - CRYPTO WING
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center shrink-0 text-red-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-widest uppercase mb-2">SIGNAL LINE</h3>
                <p className="text-slate-500 text-sm font-mono uppercase leading-relaxed">
                  +1 (888) 992-0044<br />
                  SECURE EXT: 777
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center shrink-0 text-red-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-widest uppercase mb-2">SECURITY OFFICE</h3>
                <p className="text-slate-500 text-sm font-mono uppercase leading-relaxed">
                  SO-INTEL@FIP.GOV<br />
                  PGP: 0x88F2A192
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-white/5 p-8 relative">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-600" />
            <h3 className="text-white font-black tracking-widest uppercase mb-8 flex items-center gap-3">
              <MessageSquare size={18} className="text-red-600" /> SECURE MESSAGE
            </h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">IDENTIFIER</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-white/10 p-4 text-white font-mono text-xs focus:border-red-600 outline-none" placeholder="ANONYMOUS" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">MESSAGE BODY</label>
                <textarea rows={6} className="w-full bg-[#0a0a0a] border border-white/10 p-4 text-white font-mono text-xs focus:border-red-600 outline-none resize-none" placeholder="ENCRYPTED TRANSMISSION..." />
              </div>
              <button className="w-full py-4 bg-red-600 text-black font-black text-xs tracking-widest uppercase hover:bg-white transition-all">
                SEND SECURE TRANSMISSION →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
