
import React from 'react';

export const RadarAnimation: React.FC = () => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer circles */}
      <div className="absolute inset-0 border border-emerald-900/30 rounded-full"></div>
      <div className="absolute inset-4 border border-emerald-900/50 rounded-full"></div>
      <div className="absolute inset-8 border border-emerald-900/70 rounded-full"></div>
      
      {/* Sweeper */}
      <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
        <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/0 to-emerald-500/20 origin-bottom-left transform -rotate-45"></div>
      </div>
      
      {/* Scanning dot */}
      <div className="relative z-10 w-2 h-2 bg-emerald-400 rounded-full glow-cyan animate-pulse"></div>
    </div>
  );
};

export const CircuitBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-10">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <pattern id="circuit" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M0 100h40m120 0h40M100 0v40m0 120v40" stroke="#00f2ff" strokeWidth="1" fill="none" />
          <rect x="80" y="80" width="40" height="40" stroke="#00f2ff" fill="none" />
          <circle cx="40" cy="100" r="3" fill="#00f2ff" />
          <circle cx="160" cy="100" r="3" fill="#00f2ff" />
          <circle cx="100" cy="40" r="3" fill="#00f2ff" />
          <circle cx="100" cy="160" r="3" fill="#00f2ff" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
};
