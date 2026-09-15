import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Badge } from './Badge';
import { LogOut, Code2, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenPublish?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPublish }) => {
  const { user, logout } = useAuth();
  const { activeProject, selectProject } = useProjects();

  return (
    <header className="sticky top-0 z-30 w-full glass-header px-4 py-3 flex items-center justify-between border-b border-white/10 pt-safe">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => selectProject(null)} 
          className="flex items-center gap-2 group transition-opacity hover:opacity-80 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-sm">GundamDev</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">MOBILE</span>
            </div>
            {activeProject && (
              <p className="text-xs text-slate-400 font-mono truncate max-w-[120px] sm:max-w-[200px]">
                {activeProject.name}
              </p>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {activeProject ? (
          <>
            <Badge status={activeProject.status} />
            <button
              onClick={onOpenPublish}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 min-h-[36px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </>
        ) : (
          user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {user.username}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )
        )}
      </div>
    </header>
  );
};
