import React from 'react';

export default function FloatingAurora() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Orb 1: Indigo / Violet top-left */}
      <div 
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent blur-3xl animate-aurora-slow opacity-80" 
      />
      {/* Orb 2: Emerald / Cyan top-right */}
      <div 
        className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl animate-aurora-reverse opacity-70" 
      />
      {/* Orb 3: Blue / Azure bottom-center */}
      <div 
        className="absolute -bottom-40 left-1/3 w-[700px] h-[600px] rounded-full bg-gradient-to-t from-blue-600/15 via-cyan-600/10 to-transparent blur-3xl animate-aurora-mid opacity-75" 
      />
      {/* Orb 4: Subtle Fuchsia accent right-middle */}
      <div 
        className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-l from-fuchsia-600/10 to-transparent blur-3xl animate-pulse-subtle opacity-60" 
      />
    </div>
  );
}
