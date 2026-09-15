import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Settings, User, Smartphone, LogOut, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { projects } = useProjects();

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-y-auto no-scrollbar max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10">
        <Settings className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Workspace Settings</h3>
          <p className="text-[10px] text-slate-400">Account session, device preferences, and cloud storage</p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-4 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Authenticated Account</span>
        </h4>

        <div className="bg-[#161a26] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Username:</span>
            <span className="font-semibold text-white font-mono">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-semibold text-white font-mono">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GitHub OAuth:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected</span>
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors min-h-[40px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Mobile Workspace</span>
        </button>
      </div>

      {/* Device & Workspace Metrics */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>Mobile Device Optimization</span>
        </h4>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between p-2 rounded-xl bg-black/20">
            <span>Target Usage:</span>
            <span className="font-mono font-semibold text-indigo-300">99% Mobile-First Usability</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-black/20">
            <span>Active Projects:</span>
            <span className="font-mono font-semibold text-slate-200">{projects.length} Workspaces</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-black/20">
            <span>Isolation Sandbox:</span>
            <span className="font-mono font-semibold text-emerald-400">Containerized Remote Exec</span>
          </div>
        </div>
      </div>
    </div>
  );
};
