import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LogLevel } from '../../types';
import { Terminal, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const LogViewer: React.FC = () => {
  const { logs, clearLogs } = useWorkspace();
  const [filter, setFilter] = useState<'all' | LogLevel>('all');

  const filteredLogs = logs.filter(l => filter === 'all' || l.level === filter);

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'warning': return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Build & Runtime Logs</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#12151e] p-0.5 rounded-lg border border-white/10 text-[10px] font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-0.5 rounded ${filter === 'error' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
            >
              Errors
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-2 py-0.5 rounded ${filter === 'info' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
            >
              Info
            </button>
          </div>

          <button
            onClick={clearLogs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#050609] border border-white/10 rounded-2xl p-3 font-mono text-[11px] leading-6 overflow-y-auto no-scrollbar space-y-1.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No logs generated yet.</div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="flex items-start gap-2 text-slate-300">
              <span className="text-slate-600 text-[9px] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              {getLogIcon(log.level)}
              <span className="break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
