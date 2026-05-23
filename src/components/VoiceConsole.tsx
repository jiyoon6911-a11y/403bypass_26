import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface VoiceConsoleProps {
  text: string;
  isVisible: boolean;
}

export default function VoiceConsole({ text, isVisible }: VoiceConsoleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 30, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="fixed bottom-22 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm bg-blue-950/95 border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl z-40 flex items-start gap-3"
        >
          <div className="p-1 px-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4 animate-bounce" />
          </div>
          <div className="space-y-0.5 flex-1 select-none text-left">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black tracking-widest text-cyan-400 uppercase font-mono">
                가상 인-앱 스크린 리더 안내 자막
              </span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <p className="text-[11px] font-bold text-white leading-relaxed">
              {text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
