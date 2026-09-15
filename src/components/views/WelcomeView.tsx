import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Code2, ArrowRight } from 'lucide-react';
import { MOTION_VARIANTS } from '../../theme/motion-tokens';

export const WelcomeView: React.FC = () => {
  const { user, dismissWelcome } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissWelcome();
    }, 2200);
    return () => clearTimeout(timer);
  }, [dismissWelcome]);

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto text-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-xl shadow-indigo-500/10"
        >
          <Code2 className="w-9 h-9" />
        </motion.div>

        <motion.h1
          variants={MOTION_VARIANTS.welcomeUsername}
          initial="initial"
          animate="animate"
          className="text-3xl font-bold tracking-tight text-white mb-2"
        >
          Welcome, <span className="text-indigo-400">{user?.username || 'Developer'}</span>
        </motion.h1>

        <motion.p
          variants={MOTION_VARIANTS.welcomeSubtext}
          initial="initial"
          animate="animate"
          className="text-sm text-slate-400 mb-8"
        >
          Your workspace is ready.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={dismissWelcome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-95 min-h-[44px]"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};
