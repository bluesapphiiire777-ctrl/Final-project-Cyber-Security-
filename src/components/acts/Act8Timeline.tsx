import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, Globe, Cpu, User, Activity, CheckCircle2, Filter } from 'lucide-react';

const timelineEvents = [
  { time: '08:41:12 UTC', type: 'DEVICE ACCESS', category: 'device', icon: Cpu, detail: 'Authorized administrator workstation access detected on Node-77.', color: 'text-amber-400', border: 'border-amber-500/40' },
  { time: '09:12:05 UTC', type: 'FILE CREATED', category: 'file', icon: FileText, detail: 'Encrypted archive container "payroll_export.zip" initialized in temp directory.', color: 'text-red-500', border: 'border-red-500/40' },
  { time: '10:04:44 UTC', type: 'NETWORK EVENT', category: 'network', icon: Globe, detail: 'Outbound TLS connection to 198.51.100.42 (Port 443) confirmed via PCAP stream.', color: 'text-amber-400', border: 'border-amber-500/40' },
  { time: '11:26:18 UTC', type: 'MEMORY SNAPSHOT', category: 'memory', icon: Activity, detail: 'Volatile RAM dump captured during high kernel-CPU utilization spike.', color: 'text-red-500', border: 'border-red-500/40' },
  { time: '12:10:02 UTC', type: 'FILE MODIFIED', category: 'file', icon: FileText, detail: 'Security audit log modified; secondary mirror retained original SHA-256 hash.', color: 'text-amber-400', border: 'border-amber-500/40' },
  { time: '13:45:30 UTC', type: 'IDENTITY CORRELATION', category: 'user', icon: User, detail: 'Synthetic identity "Alpha-7" matched with remote VPN session credentials.', color: 'text-emerald-400', border: 'border-emerald-500/40' },
];

export default function Act8Timeline() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredEvents = activeFilter === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(e => e.category === activeFilter);

  return (
    <section id="timeline" className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-[0.25em] uppercase font-bold">
              SECTION_07 // TEMPORAL RECONSTRUCTION
            </div>
            <h2 className="text-white text-3xl sm:text-5xl font-display font-black tracking-tight uppercase leading-tight">
              TIME LEAVES<br />
              <span className="text-red-500 italic font-editorial">AN IMMUTABLE TRACE.</span>
            </h2>
            <p className="text-zinc-300 font-mono text-sm sm:text-base max-w-xl">
              Chronological alignment across multiple disparate machines, networks, and volatile storage snapshots.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'ALL EVENTS' },
              { id: 'device', label: 'DEVICE' },
              { id: 'network', label: 'NETWORK' },
              { id: 'file', label: 'FILES' },
              { id: 'memory', label: 'RAM' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider transition-all ${
                  activeFilter === tab.id
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-[#14151e] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-32 space-y-8 pl-6 md:pl-10">
          {filteredEvents.map((event, i) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.time}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative group"
              >
                {/* Timeline node icon on the line */}
                <div className="absolute -left-[35px] md:-left-[51px] top-4 w-6 h-6 rounded-full bg-[#14151e] border-2 border-red-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>

                {/* Left Timestamp for desktop */}
                <div className="hidden md:block absolute -left-36 top-4 w-28 text-right font-mono text-xs font-bold text-zinc-400">
                  {event.time.split(' ')[0]}
                  <span className="block text-[10px] text-zinc-500">UTC</span>
                </div>

                {/* Event Card */}
                <div className={`p-5 sm:p-6 bg-[#14151e]/95 border ${event.border} rounded-lg space-y-3 hover:bg-[#1a1c29] transition-all`}>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded bg-black/40 ${event.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{event.type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="md:hidden text-xs font-mono text-zinc-400">{event.time}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                        <CheckCircle2 size={12} /> HASH VERIFIED
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-200 text-sm sm:text-base font-sans leading-relaxed">
                    {event.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
