import React from 'react';
import { ProjectStatus } from '../../types';

interface BadgeProps {
  status: ProjectStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Saved':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      case 'Running':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30 animate-pulse';
      case 'GitHub Synced':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Deployment Live':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Build Failed':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium font-mono border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};
