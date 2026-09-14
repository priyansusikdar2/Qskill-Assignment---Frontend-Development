import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-6 w-48 bg-slate-800 rounded-full mx-auto mb-4" />
      <div className="h-10 w-96 bg-slate-800 rounded-xl mx-auto mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-3xl p-6" />
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-3xl p-6" />
      </div>
    </div>
  );
}
