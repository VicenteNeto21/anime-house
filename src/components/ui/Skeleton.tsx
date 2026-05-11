import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClass = "animate-pulse bg-slate-800/50";
  const variantClasses = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full"
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="h-4 w-3/4" variant="text" />
      <Skeleton className="h-3 w-1/2" variant="text" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden p-0 h-full">
      <Skeleton className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-1/4" variant="text" />
        <Skeleton className="h-5 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
        <div className="pt-4 mt-auto">
          <Skeleton className="h-3 w-1/3" variant="text" />
        </div>
      </div>
    </div>
  );
}
