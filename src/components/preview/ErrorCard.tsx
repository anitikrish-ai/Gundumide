import React from 'react';
import { FormattedError } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AlertTriangle, FileCode, Terminal } from 'lucide-react';

interface ErrorCardProps {
  error: FormattedError;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => {
  const { setActiveSection } = useWorkspace();

  return (
    <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 shadow-lg">
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-rose-200">Build Execution Error</h4>
          <p className="text-[11px] font-mono text-rose-300 mt-0.5">{error.message}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-rose-500/20 text-[11px] font-mono">
        <span className="text-slate-400">
          Location: <span className="text-rose-300 font-bold">{error.file}:{error.line}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('Editor')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Open File</span>
          </button>
          <button
            onClick={() => setActiveSection('Logs')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>View Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
