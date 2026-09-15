import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MOTION_VARIANTS } from '../../theme/motion-tokens';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            variants={MOTION_VARIANTS.bottomSheet}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-lg bg-[#12151e] border-t border-white/15 rounded-t-2xl p-4 shadow-2xl max-h-[85vh] flex flex-col z-10 pb-safe"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-600/50 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
