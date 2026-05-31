import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, message, onClose }: AlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="hc-card bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl shadow-blue-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  403 BYPASS 안내
                </h4>
                <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded font-bold uppercase">
                  시스템 알림
                </span>
              </div>
            </div>
            
            <p className="text-[12px] text-slate-200 leading-relaxed font-bold pr-1">
              {message}
            </p>

            <button
              onClick={onClose}
              className="hc-button-primary w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[11px] font-black rounded-xl transition-all shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              알림 확인 및 닫기
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
