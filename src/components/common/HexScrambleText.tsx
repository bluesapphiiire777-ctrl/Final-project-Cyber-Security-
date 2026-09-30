import React, { useState, useEffect } from 'react';

interface HexScrambleTextProps {
  text: string;
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

const HEX_CHARS = '0123456789abcdef';

export const HexScrambleText: React.FC<HexScrambleTextProps> = ({
  text,
  duration = 800,
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);

  useEffect(() => {
    if (!text) return;
    setIsScrambling(true);

    const length = text.length;
    const intervalTime = 25;
    const totalSteps = Math.floor(duration / intervalTime);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const revealedCount = Math.floor(progress * length);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        if (i < revealedCount) {
          scrambled += text[i];
        } else {
          scrambled += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        }
      }

      setDisplayText(scrambled);

      if (step >= totalSteps) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
        if (onComplete) onComplete();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, duration]);

  return (
    <span className={`font-mono tabular-nums transition-colors ${isScrambling ? 'text-amber-400' : className}`}>
      {displayText}
    </span>
  );
};
