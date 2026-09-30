import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Fingerprint, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Fire Shadow Admin Trap Webhook
      const res = await fetch('/api/honeypot/trap-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Trigger Honeypot Containment Protocol
      setError(data.error || '🚨 SHADOW ADMIN TRAP TRIGGERED: Probe logged and reported to Senior Lead (bluesapphiiire777@gmail.com). Access denied.');
    } catch (err: any) {
      setError('🚨 CONTAINMENT TRAP ACTIVE: Unauthorized access probe logged and reported to Senior Manager (bluesapphiiire777@gmail.com).');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-red-600 mb-6 bg-black">
            <Fingerprint size={40} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none mb-2">SECURE <span className="text-red-600">AUTH</span></h1>
          <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">ACCESS TO RESTRICTED DATA ONLY</p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 p-8 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">OFFICER EMAIL</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 p-4 text-white font-mono focus:border-red-600 outline-none transition-colors pr-12"
                  placeholder="name@fip.gov"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">CLEARANCE CODE (PASSWORD)</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 p-4 text-white font-mono focus:border-red-600 outline-none transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-900/10 border border-red-900/30 text-red-500 text-[10px] font-black tracking-widest uppercase">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all active:scale-[0.98]"
            >
              AUTHENTICATE →
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest leading-relaxed">
              BY ATTEMPTING TO LOG IN, YOU ACKNOWLEDGE THAT ALL ACTIONS ARE BEING RECORDED AND MONITORED BY THE INTERNAL AFFAIRS BUREAU.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
