import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  fontScale,
  onFontScaleChange,
  highContrast,
  onHighContrastToggle,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`w-full max-w-md bg-slate-900 border-t-2 border-blue-500 rounded-t-3xl p-5 space-y-4 shadow-2xl ${highContrast ? 'high-contrast-mode' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-blue-500 font-mono flex items-center gap-1.5 hc-accent">
                <Settings className="w-4 h-4 animate-spin-slow" />
                UNIVERSAL DESIGN CONTROL CENTER
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-slate-800" />

            {/* 1. Text Scale adjustment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-205 hc-text">
                <span>🔍 글자 및 구성 요소 확대 비율</span>
                <span className="text-blue-400 font-mono font-bold hc-accent">
                  {fontScale.toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-bold hc-text-mute">크기 작게</span>
                <input
                  type="range"
                  min="1.0"
                  max="1.8"
                  step="0.2"
                  value={fontScale}
                  onChange={(e) => onFontScaleChange(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500 rounded-lg cursor-pointer bg-slate-950 h-1.5"
                />
                <span className="text-[10px] text-slate-500 font-bold hc-text-mute">최대 확대</span>
              </div>
            </div>

            {/* 2. High Contrast switch */}
            <div className="flex items-center justify-between py-1 border-t border-slate-800/50 pt-3">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-xs font-extrabold text-slate-200 hc-text">🖤 완벽 고대비 흑백 모드</h4>
                <p className="text-[9px] text-slate-400 leading-normal hc-text-mute">
                  배경을 완전한 검은색(#000000)으로 전환해 저시력 시각 가시도 보호
                </p>
              </div>
              <button
                onClick={onHighContrastToggle}
                className={`w-11 h-6 rounded-full p-0.5 transition-all flex items-center relative ${
                  highContrast ? 'bg-blue-600 border-blue-505' : 'bg-slate-800 border-slate-700/50'
                }`}
                aria-label="고대비 모드 토글"
              >
                <div
                  className={`w-5 h-5 rounded-full shadow-md bg-white transition-all transform ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
