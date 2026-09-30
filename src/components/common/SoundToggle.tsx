import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export const SoundToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const handleToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playClick(1400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-2 rounded-xl bg-[#0E121B] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs ${className}`}
      title={isMuted ? 'Unmute Tactical Audio Feedback' : 'Mute Tactical Audio Feedback'}
    >
      {isMuted ? (
        <>
          <VolumeX size={15} className="text-zinc-500" />
          <span className="text-[10px] font-mono uppercase hidden sm:inline text-zinc-500">Muted</span>
        </>
      ) : (
        <>
          <Volume2 size={15} className="text-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase hidden sm:inline text-amber-400">Audio FX</span>
        </>
      )}
    </button>
  );
};
