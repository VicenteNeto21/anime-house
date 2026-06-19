"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "rectangle" | "circle" | "text";
}

export default function SkeletonLoader({ className = "", variant = "rectangle" }: SkeletonProps) {
  const baseStyles = "relative overflow-hidden bg-slate-800/40 border border-white/5";
  const variantStyles = {
    rectangle: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <motion.div
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonLoader className="aspect-[2/3] w-full" />
      <SkeletonLoader variant="text" className="w-3/4" />
      <SkeletonLoader variant="text" className="w-1/2 opacity-50" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] bg-slate-900 overflow-hidden">
      <SkeletonLoader className="absolute inset-0 rounded-none opacity-20" />
      <div className="absolute bottom-16 left-8 space-y-4 max-w-2xl">
        <SkeletonLoader variant="text" className="h-12 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
        <div className="flex gap-4">
          <SkeletonLoader className="h-14 w-40" />
          <SkeletonLoader className="h-14 w-40 opacity-50" />
        </div>
      </div>
    </div>
  );
}
