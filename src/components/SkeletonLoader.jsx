import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-800/80 rounded-md" />
          <div className="h-4 w-72 bg-zinc-800/40 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-zinc-800/60 rounded-md" />
      </div>
      
      {/* Workbench Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-96 rounded-xl bg-panel hairline p-4 space-y-3">
          <div className="h-8 bg-zinc-800/50 rounded-md w-1/3" />
          <div className="h-64 bg-zinc-900/50 rounded-lg" />
          <div className="h-6 bg-zinc-800/30 rounded-md w-1/4" />
        </div>
        <div className="h-96 rounded-xl bg-panel hairline p-4 space-y-3">
          <div className="h-8 bg-zinc-800/50 rounded-md w-1/3" />
          <div className="h-64 bg-zinc-900/50 rounded-lg" />
          <div className="h-6 bg-zinc-800/30 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
}
