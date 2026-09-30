import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Menu, X, ChevronRight, Activity, LogOut, User, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSenior = 
    currentUser?.role === 'CHIEF_INVESTIGATOR' || 
    currentUser?.role === 'SENIOR_INVESTIGATOR' || 
    currentUser?.email?.toLowerCase() === 'bluesapphire777@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'bluesapphiiire777@gmail.com' ||
    currentUser?.email?.toLowerCase().startsWith('bluesapph');

  const navLinks = isSenior
    ? [
        { name: 'OVERVIEW', href: '/#hero' },
        { name: '★ SENIOR WORKSTATION', href: '/vault' },
        { name: 'ALL CASES', href: '/complaints' },
        { name: 'WORM VAULT', href: '/vault' },
        { name: 'AUDIT LOG', href: '/audit' },
        { name: 'CHIEF CONSOLE', href: '/admin' },
      ]
    : [
        { name: 'OVERVIEW', href: '/#hero' },
        { name: 'MY CASE PORTAL', href: '/vault' },
        { name: 'TRANSMIT DOCUMENTS', href: '/vault' },
        { name: 'AUDIT LOG', href: '/audit' },
        { name: 'CONTACT LEAD', href: '/contact' },
      ];

  const handleSignOut = () => {
    setCurrentUser(null);
    navigate('/signin');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[500] transition-all duration-300 ${
      scrolled ? 'py-3 bg-[#0B0C10]/95 border-b border-zinc-800 backdrop-blur-md shadow-lg' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-12 flex items-center justify-between relative z-50">
        
        {/* Logo & Node Status */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] group-hover:scale-105 transition-transform">
               <Shield size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-tight text-white leading-none">F.I.P</span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">forensic investigation platform</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-zinc-800">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-mono text-zinc-200 tracking-wider uppercase font-bold">LEDGER ACTIVE</span>
             </div>
             <div className="flex items-center gap-1.5 text-zinc-400">
                <Activity size={12} className="text-amber-400" />
                <span className="text-[11px] font-mono tracking-wider uppercase">NODE: MONGODB ATLAS</span>
             </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
           <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                link.href.startsWith('/#') ? (
                  <a 
                    key={link.name}
                    href={link.href}
                    className="text-xs font-mono text-zinc-300 hover:text-white uppercase tracking-wider transition-colors font-medium relative group py-1"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all group-hover:w-full" />
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-xs font-mono text-zinc-300 hover:text-white uppercase tracking-wider transition-colors font-medium relative group py-1"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all group-hover:w-full" />
                  </Link>
                )
              ))}
           </div>

           <div className="flex items-center gap-3">
             {currentUser ? (
               <div className="flex items-center gap-3">
                 <Link
                   to="/vault"
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-red-500/40 text-xs font-mono text-zinc-100 hover:border-red-500 transition-all shadow-[0_0_12px_rgba(220,38,38,0.2)]"
                 >
                   {currentUser.picture ? (
                     <img src={currentUser.picture} alt="" className="w-5 h-5 rounded-full object-cover" />
                   ) : (
                     <div className="w-4 h-4 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-[10px] font-bold">
                       {currentUser.name?.charAt(0) || 'A'}
                     </div>
                   )}
                   <span className="font-bold text-red-400">{currentUser.badgeId || 'FIP-AGENT'}</span>
                 </Link>
                 <button
                   onClick={handleSignOut}
                   title="Sign Out"
                   className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                 >
                   <LogOut size={15} />
                 </button>
               </div>
             ) : (
               <>
                 <Link
                   to="/signin"
                   className="px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all border border-zinc-800"
                 >
                   SIGN IN
                 </Link>

                 <Link
                   to="/signup"
                   className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-1.5"
                 >
                   <span>REGISTER BADGE</span>
                   <ChevronRight size={13} />
                 </Link>
               </>
             )}
           </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white p-2 bg-[#14151e] border border-zinc-800 rounded"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0B0C10] border-b border-zinc-800 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.href.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-mono text-zinc-200 hover:text-red-500 py-1"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-mono text-zinc-200 hover:text-red-500 py-1"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
                {currentUser ? (
                  <>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-200 flex items-center justify-between">
                      <span>{currentUser.name}</span>
                      <span className="text-red-400 font-bold">{currentUser.badgeId}</span>
                    </div>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 text-center bg-zinc-800 hover:bg-zinc-700 text-red-400 font-mono text-xs font-bold rounded"
                    >
                      TERMINATE SESSION
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center bg-zinc-800 text-white font-mono text-xs font-bold rounded"
                    >
                      SIGN IN
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center bg-red-600 text-white font-mono text-xs font-bold rounded"
                    >
                      REGISTER INVESTIGATOR BADGE
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

