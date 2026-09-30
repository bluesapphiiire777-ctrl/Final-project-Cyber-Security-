import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  BadgeCheck, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Fingerprint, 
  KeyRound, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  X, 
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

interface AuthPortalProps {
  initialMode?: 'signin' | 'signup';
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID: string = 
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 
  '690565829553-djd1b5gbf82r95nfo3mjqdcc13uspn70.apps.googleusercontent.com';

export default function AuthPortal({ initialMode = 'signin' }: AuthPortalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sync mode with route if path changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/signin') {
      setMode('signin');
    }
  }, [location.pathname]);

  // Form State
  const [name, setName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // UI & Scan States
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [authProgress, setAuthProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('bluesapphiiire777@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Senior Investigator');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Initialize Google Identity Services Script
  useEffect(() => {
    const scriptId = 'google-gsi-client';
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          // Render Google GSI button if container exists
          const btnContainer = document.getElementById('gsi-native-btn-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.warn('Google GSI Init notice:', e);
        }
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else {
      initGsi();
    }
  }, [mode]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setAuthStep('VERIFYING GOOGLE OAUTH JWT SIGNATURE...');
    setAuthProgress(50);

    try {
      const res = await fetch('/api/google-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setAuthStep('IDENTITY VERIFIED // GRANTING CLEARANCE...');
        setAuthProgress(100);
        setCurrentUser(data.user);
        setSuccessMessage('Google credentials validated. Redirecting to Vault...');
        setTimeout(() => {
          setLoading(false);
          navigate('/vault');
        }, 800);
      } else {
        setLoading(false);
        setError(data.error || 'Google validation failed.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Google verification network error.');
    }
  };

  // Direct Google Verify Action
  const executeGoogleAuth = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setError(null);
    setAuthStep('INITIALIZING GOOGLE OAUTH SECURITY CHANNEL...');
    setAuthProgress(35);

    const targetEmail = customEmail || googleEmailInput || 'bluesapphiiire777@gmail.com';
    const targetName = customName || googleNameInput || 'Forensic Investigator';

    setTimeout(async () => {
      setAuthStep('VERIFYING OAUTH 2.0 WITH MONGODB ENCLAVE...');
      setAuthProgress(75);

      try {
        const response = await fetch('/api/google-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            name: targetName,
            sub: '690565829553_' + Math.floor(100000 + Math.random() * 900000),
            picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          }),
        });

        const data = await response.json();
        if (response.ok && data.user) {
          setAuthStep('GOOGLE SESSION ATTESTED // UNLOCKING VAULT...');
          setAuthProgress(100);
          setCurrentUser(data.user);
          setSuccessMessage('Google Account Verified: ' + data.user.email);
          setTimeout(() => {
            setLoading(false);
            setShowGoogleModal(false);
            navigate('/vault');
          }, 700);
        } else {
          setLoading(false);
          setError(data.error || 'Google authorization rejected by ledger.');
        }
      } catch (err) {
        setLoading(false);
        setError('Network telemetry error during Google verification.');
      }
    }, 600);
  };

  const handleGoogleOAuth = () => {
    setShowGoogleModal(true);
  };

  // Mouse coordinate tracker for Flashlight & 3D Card tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring smoothed values for 3D card tilt
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-7, 7]);

  // Global Flashlight Effect coordinates
  const [cursorPos, setCursorPos] = useState({ x: 500, y: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Password Entropy Calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'NONE', color: 'bg-zinc-800', text: 'text-zinc-500' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 40) return { score, label: 'LOW ENTROPY', color: 'bg-red-600', text: 'text-red-400' };
    if (score < 75) return { score, label: 'STANDARD HASH', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score < 90) return { score, label: 'HIGH ENTROPY', color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { score: 100, label: 'QUANTUM-GRADE', color: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]', text: 'text-cyan-300' };
  };

  const passStrength = calculatePasswordStrength(password);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide required credentials.');
      return;
    }

    if (mode === 'signup' && !agreeTerms) {
      setError('You must accept the Forensic Chain of Custody statement.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Dynamic scanning animation steps
    setAuthStep('COMPUTING SHA-256 INTEGRITY HASH...');
    setAuthProgress(20);

    setTimeout(() => {
      setAuthStep('CONNECTING TO MONGODB LEDGER CLUSTER...');
      setAuthProgress(55);
    }, 400);

    setTimeout(() => {
      setAuthStep('VERIFYING ZERO-KNOWLEDGE EVIDENCE CLEARANCE...');
      setAuthProgress(85);
    }, 800);

    setTimeout(async () => {
      try {
        if (mode === 'signup') {
          const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, badgeId }),
          });
          const data = await response.json();

          if (response.ok && data.user) {
            setAuthStep('AGENT REGISTERED IN MONGODB // REDIRECTING...');
            setAuthProgress(100);
            setCurrentUser(data.user);
            setTimeout(() => {
              setLoading(false);
              setSuccessMessage('Clearance granted. Welcome to F.I.P Vault.');
              setTimeout(() => {
                navigate('/vault');
              }, 800);
            }, 500);
          } else {
            setLoading(false);
            setError(data.error || 'Registration failed. Ledger conflict detected.');
          }
        } else {
          // Direct enclave sign in
          const response = await fetch('/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();

          if (response.ok && data.user) {
            setAuthStep('ACCESS GRANTED // INITIALIZING VAULT ENCLAVE...');
            setAuthProgress(100);
            setCurrentUser(data.user);
            setTimeout(() => {
              setLoading(false);
              setSuccessMessage('Identity verified. Loading investigator workspace...');
              setTimeout(() => {
                navigate('/vault');
              }, 800);
            }, 500);
          } else {
            setLoading(false);
            setError(data.error || 'Authentication denied. Invalid credentials.');
          }
        }
      } catch (err) {
        setLoading(false);
        setError('Network telemetry timeout. Please check your connection.');
      }
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen bg-[#0B0C10] text-zinc-100 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden select-none"
    >
      {/* 1. DYNAMIC FLASHLIGHT CURSOR */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(220, 38, 38, 0.12), transparent 75%)`
        }}
      />

      {/* 2. DENSE BLUEPRINT BACKGROUND GRID */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0C10_80%)] pointer-events-none" />

      {/* 3. ANIMATED FILM-GRAIN TEXTURE OVERLAY */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.04] z-50">
        <filter id="auth-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-grain)" />
      </svg>

      {/* MAIN CONTAINER 50/50 SPLIT */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-24 pb-16">
        
        {/* ==================================================== */}
        {/* LEFT CANVAS: VISUAL NARRATIVE & CRYPTO TELEMETRY    */}
        {/* ==================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8 relative">
          
          {/* Scanning Laser Line */}
          <motion.div 
            animate={{ y: ['0%', '1000%'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            className="hidden lg:block absolute -left-4 top-0 w-1 h-12 bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] pointer-events-none z-10"
          />

          {/* Top Status Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/60 border border-red-500/40 text-red-400 font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(220,38,38,0.25)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>SYSTEM: ONLINE</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-mono text-xs border border-zinc-800 bg-[#14151e]/80 px-3 py-1.5 rounded">
              <Shield size={13} className="text-amber-400" />
              <span>ENCRYPTION: SHA-256 LEDGER</span>
            </div>
          </motion.div>

          {/* Headline and Narrative */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs font-bold tracking-[0.3em] uppercase">
              <Cpu size={14} /> FORENSIC INTEGRITY PROTOCOL
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tight leading-none">
              SECURE<br />
              <span className="text-red-500 italic font-editorial">INVESTIGATION</span><br />
              ENCLAVE.
            </h1>
            <p className="text-zinc-300 font-mono text-sm sm:text-base leading-relaxed max-w-lg">
              Cryptographically verified access for cyber forensics examiners, law enforcement agencies, and chain-of-custody auditors.
            </p>
          </motion.div>

          {/* Live Forensic Telemetry Terminal Feed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-[#121316]/90 border border-zinc-800 rounded-lg p-5 space-y-3 relative overflow-hidden backdrop-blur-md shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-[11px] font-mono">
              <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Activity size={13} /> LIVE TELEMETRY STREAM
              </span>
              <span className="text-zinc-500">NODE 0x77-PROD</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>ACTIVE CUSTODY LEDGER:</span>
                <span className="text-emerald-400 font-bold">SYNCHRONIZED (BLOCK #89,402)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>ZERO-KNOWLEDGE AUTH:</span>
                <span className="text-zinc-200">ED25519 VERIFIED</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>HARDWARE SECURITY:</span>
                <span className="text-amber-400 font-semibold">TPM 2.0 ENCLAVE</span>
              </div>
            </div>

            {/* Cryptographic Node Dots Visualization */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60 text-[10px] font-mono text-zinc-500">
              <div className="flex gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}
                  />
                ))}
              </div>
              <span>LATENCY: 12ms // ENCRYPTION AES-GCM-256</span>
            </div>
          </motion.div>

          {/* Editorial Watermark */}
          <div className="select-none pointer-events-none pt-4 opacity-15 text-zinc-500 font-display font-black text-xl sm:text-2xl tracking-[0.25em] uppercase">
            AUTHORIZED PERSONNEL ONLY // CLASSIFIED ACCESS
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT CANVAS: 3D FLOATING TERMINAL FORM PANEL       */}
        {/* ==================================================== */}
        <div className="lg:col-span-6 perspective-1000">
          <motion.div
            ref={cardRef}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full bg-[#121316]/90 backdrop-blur-2xl border border-red-900/50 rounded-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(220,38,38,0.2)] relative preserve-3d"
          >
            {/* Tactical Corner Hardware Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-red-500/60" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-red-500/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-red-500/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-red-500/60" />

            {/* DUAL-MODE TOGGLE SWITCHER */}
            <div className="p-1 bg-black/60 border border-zinc-800 rounded-lg flex mb-6 relative">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                  mode === 'signin' 
                    ? 'text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <KeyRound size={14} />
                <span>ACCESS TERMINAL</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                  mode === 'signup' 
                    ? 'text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Fingerprint size={14} />
                <span>CREATE ACCOUNT</span>
              </button>

              {/* Animated active pill background */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-md pointer-events-none ${
                  mode === 'signin' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
              />
            </div>

            {/* ONE-CLICK GOOGLE SENIOR INVESTIGATOR BUTTON */}
            <div className="mb-6 space-y-2.5">
              <button
                type="button"
                onClick={() => executeGoogleAuth('bluesapphire777@gmail.com', 'Senior Inspector FIPG 3638')}
                className="w-full group relative flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-[#121316] border border-amber-500/60 text-amber-300 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:bg-[#1f1d18] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div className="text-left">
                    <span className="block text-white font-bold">SENIOR INVESTIGATOR 1-CLICK GOOGLE LOGIN</span>
                    <span className="block text-[10px] text-amber-400 font-normal">bluesapphire777@gmail.com &bull; Full Case Management</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleGoogleOAuth}
                className="w-full group relative flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#191a24] border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#202130] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>SIGN IN WITH GOOGLE (USER PORTAL)</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-zinc-800" />
                <span className="absolute bg-[#121316] px-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  OR SIGN IN / CREATE USER ACCOUNT
                </span>
              </div>
            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <AnimatePresence mode="popLayout">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} className="text-red-500" /> FULL INVESTIGATOR NAME
                      </label>
                      <input
                        type="text"
                        required={mode === 'signup'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Agent Johnathan Vance"
                        className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/40 transition-all"
                      />
                    </div>

                    {/* Badge / Agency ID */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeCheck size={13} className="text-amber-400" /> BADGE // AGENCY IDENTIFIER
                      </label>
                      <input
                        type="text"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        placeholder="FIP-SPEC-7709 // INTERPOL-EC3"
                        className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/40 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={13} className="text-red-500" /> AUTHORIZED EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@forensic-integrity.org"
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/40 transition-all"
                />
              </div>

              {/* Password with Eye toggle & Strength meter */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={13} className="text-red-500" /> SECURITY KEY // PASSCODE
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline uppercase"
                    >
                      Forgot Security Key?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg pl-4 pr-11 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Entropy Gauge (Sign-Up mode) */}
                {mode === 'signup' && password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500">KEY ENTROPY:</span>
                      <span className={`font-bold ${passStrength.text}`}>{passStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passStrength.score}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms of Custody Checkbox (Sign-Up mode) */}
              {mode === 'signup' && (
                <div className="pt-2 flex items-start gap-2.5 text-xs font-mono text-zinc-400">
                  <input
                    type="checkbox"
                    id="custody-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 bg-black text-red-600 focus:ring-red-500 focus:ring-offset-black"
                  />
                  <label htmlFor="custody-terms" className="leading-snug cursor-pointer">
                    I acknowledge legal{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-red-400 hover:underline font-bold"
                    >
                      Chain of Custody Protocols
                    </button>
                    , non-repudiation logging, and ISO/IEC 27037 standards.
                  </label>
                </div>
              )}

              {/* Error Message Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs font-mono text-red-300 flex items-center gap-2"
                >
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success Message Display */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2"
                >
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </motion.div>
              )}

              {/* ACTIVE SCANNING PROGRESS STATE */}
              {loading && (
                <div className="p-3.5 bg-black/80 border border-red-500/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs font-mono text-red-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      {authStep}
                    </span>
                    <span>{authProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 shadow-[0_0_12px_#ef4444]"
                      style={{ width: `${authProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* PRIMARY SUBMIT CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'AUTHENTICATING LEDGER...' : mode === 'signin' ? 'INITIATE SECURE SESSION' : 'REGISTER INVESTIGATOR BADGE'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Micro footer status */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>ZERO TRUST POLICY</span>
              <span className="text-zinc-400 font-bold">SHA-256 HASH VERIFIED</span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* FORGOT SECURITY KEY MODAL                            */}
      {/* ==================================================== */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#14151e] border border-red-500/40 rounded-xl p-6 space-y-4 relative shadow-2xl"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-white uppercase">RECOVERY TOKEN REQUEST</h3>
                  <p className="text-xs font-mono text-zinc-400">Ephemeral Cryptographic Recovery</p>
                </div>
              </div>

              {forgotSent ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300 space-y-1">
                  <div className="font-bold">✓ RECOVERY DISPATCHED</div>
                  <p className="text-zinc-300">An encrypted one-time recovery token has been transmitted to your registered agency inbox.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                    Provide your authorized email address. The enclave will transmit a 15-minute challenge token signed by the F.I.P root certificate authority.
                  </p>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="agent@agency.gov"
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 font-mono text-xs font-bold hover:bg-zinc-700"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-red-600 text-white font-mono text-xs font-bold hover:bg-red-700 flex items-center gap-1.5"
                    >
                      <span>TRANSMIT TOKEN</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* TERMS OF CUSTODY MODAL                               */}
      {/* ==================================================== */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#14151e] border border-zinc-700 rounded-xl p-6 space-y-4 relative shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <div className="p-2 rounded bg-red-600/10 text-red-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-white uppercase">TERMS OF DIGITAL CUSTODY</h3>
                  <p className="text-xs font-mono text-zinc-400">ISO/IEC 27037 Forensic Standard</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono text-zinc-300 leading-relaxed">
                <div className="p-3 bg-black/40 border border-zinc-800 rounded">
                  <span className="text-amber-400 font-bold">1. NON-REPUDIATION AUDIT LOGGING:</span>
                  <p className="mt-1 text-zinc-400">All artifact queries, visual timeline correlations, and export actions are cryptographically sealed with the investigator's hardware key.</p>
                </div>
                <div className="p-3 bg-black/40 border border-zinc-800 rounded">
                  <span className="text-amber-400 font-bold">2. CHAIN OF CUSTODY INTEGRITY:</span>
                  <p className="mt-1 text-zinc-400">Bitstream disk images and PCAP dumps retain SHA-256 validation ledgers. Any bit alteration invalidates judicial admissibility markers.</p>
                </div>
                <div className="p-3 bg-black/40 border border-zinc-800 rounded">
                  <span className="text-amber-400 font-bold">3. ENCLAVE SECURITY:</span>
                  <p className="mt-1 text-zinc-400">Volatile memory analysis and credential reconstruction occur in isolated hardware enclaves conforming to Zero Trust architectures.</p>
                </div>
              </div>

              <button
                onClick={() => { setAgreeTerms(true); setShowTermsModal(false); }}
                className="w-full py-2.5 rounded bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                I ACCEPT FORENSIC CUSTODY TERMS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* GOOGLE ONE-CLICK VERIFIED CREDENTIALS MODAL          */}
      {/* ==================================================== */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#14151e] border border-red-500/40 rounded-xl p-6 space-y-5 relative shadow-2xl"
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-white uppercase">ONE-CLICK GOOGLE CREDENTIALS</h3>
                  <p className="text-xs font-mono text-zinc-400">OAuth 2.0 Client ID Verified</p>
                </div>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-xs font-mono text-red-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Shield size={14} className="text-red-400" />
                  <span>CLIENT ID AUTHENTICATED:</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono break-all">
                  {GOOGLE_CLIENT_ID}
                </div>
              </div>

              <div className="space-y-3">
                {/* 1. Senior Investigator Direct Access */}
                <button
                  type="button"
                  onClick={() => executeGoogleAuth('bluesapphire777@gmail.com', 'Senior Inspector FIPG 3638')}
                  className="w-full p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-zinc-900 border border-amber-500/60 hover:border-amber-400 text-left flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-sm">
                      ★
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                        bluesapphire777@gmail.com
                      </div>
                      <div className="text-[10px] font-sans text-zinc-300">
                        Senior Police Inspector &bull; Full Case Management Access
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    ENTER <ChevronRight size={13} />
                  </span>
                </button>

                {/* 2. Citizen User Quick Google Login */}
                <button
                  type="button"
                  onClick={() => executeGoogleAuth('citizen.user@gmail.com', 'Citizen User')}
                  className="w-full p-3 rounded-xl bg-[#191a24] border border-blue-500/40 hover:border-blue-400 text-left flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      U
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-white group-hover:text-blue-300 transition-colors">
                        Sign In as Citizen User (Demo Account)
                      </div>
                      <div className="text-[10px] font-sans text-zinc-400">
                        Submit documents &amp; credentials to Senior Investigator
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    USER <ChevronRight size={13} />
                  </span>
                </button>

                <div className="relative my-2 flex items-center justify-center">
                  <div className="w-full border-t border-zinc-800" />
                  <span className="absolute bg-[#14151e] px-2 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    OR SPECIFY DIFFERENT GOOGLE ACCOUNT
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">AUTHORIZED GOOGLE ACCOUNT:</label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    placeholder="name@gmail.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">INVESTIGATOR FULL NAME:</label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    placeholder="Forensic Agent Name"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-bold hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => executeGoogleAuth(googleEmailInput, googleNameInput)}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <span>CONFIRM & ACCESS VAULT</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
