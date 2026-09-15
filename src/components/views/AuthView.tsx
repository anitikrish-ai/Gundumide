import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Code2, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { MOTION_VARIANTS } from '../../theme/motion-tokens';

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(email, password, username);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        variants={MOTION_VARIANTS.fadeUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm mx-auto relative z-10"
      >
        {/* Brand Hero */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-lg shadow-indigo-500/10">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">GundamDev</h1>
          <p className="text-xs text-slate-400">Mobile-First Development Workspace</p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-white/10">
          <div className="flex border-b border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                !isRegister ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
              {!isRegister && <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                isRegister ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
              {isRegister && <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="devcoder"
                    className="w-full bg-[#161a26] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="developer@gundamdev.io"
                  className="w-full bg-[#161a26] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161a26] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] min-h-[44px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted Session & Isolated Workspace Security</span>
        </div>
      </motion.div>
    </div>
  );
};
