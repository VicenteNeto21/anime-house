'use client';

import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';

interface NextEpisodeCountdownProps {
  nextEp: number;
  totalEps?: number;
  onProceed: () => void;
  onCancel: () => void;
  seconds?: number;
}

export default function NextEpisodeCountdown({
  nextEp,
  totalEps,
  onProceed,
  onCancel,
  seconds = 5,
}: NextEpisodeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onProceed();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onProceed]);

  const progressPercent = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-slate-900/90 border border-white/10 rounded-2xl p-6 text-center shadow-2xl shadow-black/80">
        {/* Cancel Button in top right */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Cancelar reprodução automática"
          aria-label="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Circular Countdown Animation */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-500 transition-all duration-1000 ease-linear"
              strokeDasharray={`${progressPercent}, 100`}
              strokeLinecap="round"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-2xl font-black text-white">{timeLeft}</span>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
          Próximo Episódio
        </p>
        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-4">
          Episódio {nextEp.toString().padStart(2, '0')}{totalEps ? ` / ${totalEps}` : ''}
        </h4>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onProceed}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Assistir Já
          </button>
        </div>
      </div>
    </div>
  );
}
