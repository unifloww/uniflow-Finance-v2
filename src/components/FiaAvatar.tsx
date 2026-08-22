import React from 'react';
import { motion } from 'motion/react';

export function FiaAvatar({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      animate={{ y: [0, -4, 0] }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <defs>
        <linearGradient id="headGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff"/>
          <stop offset="0.6" stopColor="#e2e8f0"/>
          <stop offset="1" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="screenGrad" x1="20" y1="30" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a"/>
          <stop offset="1" stopColor="#020617"/>
        </linearGradient>
        <radialGradient id="screenGlow" cx="50" cy="50" r="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.15"/>
          <stop offset="1" stopColor="#0f172a" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="100" y2="100">
          <stop stopColor="#38bdf8"/>
          <stop offset="1" stopColor="#0284c7"/>
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
        </filter>
      </defs>

      {/* Backdrop Glow */}
      <motion.circle 
        cx="50" cy="50" r="48" fill="#38bdf8" 
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Head Base */}
      <rect x="12" y="25" width="76" height="60" rx="30" fill="url(#headGrad)" filter="url(#softShadow)"/>
      
      {/* Ears */}
      <rect x="5" y="45" width="12" height="20" rx="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5"/>
      <rect x="83" y="45" width="12" height="20" rx="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5"/>

      {/* Screen Face */}
      <rect x="22" y="32" width="56" height="40" rx="18" fill="url(#screenGrad)"/>
      <rect x="22" y="32" width="56" height="40" rx="18" fill="url(#screenGlow)"/>
      <rect x="22" y="32" width="56" height="40" rx="18" fill="none" stroke="#334155" strokeWidth="2"/>

      {/* Eyes (Happy Curves) */}
      <motion.g 
        filter="url(#neonGlow)"
        style={{ transformOrigin: '50px 45px' }}
        animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 0.1, 1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1] }}
      >
        <path d="M 33 48 Q 39 42 45 48" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M 55 48 Q 61 42 67 48" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none"/>
      </motion.g>
      
      <g filter="url(#neonGlow)">
        {/* Smile */}
        <path d="M 43 56 Q 50 62 57 56" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </g>

      {/* Antenna */}
      <rect x="48" y="12" width="4" height="15" fill="#94a3b8"/>
      
      <motion.g
        animate={{ opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: '50px 10px' }}
      >
        <circle cx="50" cy="10" r="6" fill="url(#glowGrad)" filter="url(#neonGlow)"/>
        <circle cx="50" cy="10" r="2" fill="#ffffff" opacity="0.8"/>
      </motion.g>
    </motion.svg>
  );
}
