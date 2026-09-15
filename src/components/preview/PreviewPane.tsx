import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { ErrorCard } from './ErrorCard';

export const PreviewPane: React.FC = () => {
  const { previewHtml, runPreview, isRunning, runtimeError } = useWorkspace();
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'full'>('mobile');

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] h-full overflow-hidden pb-24">
      {/* Preview Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12151e] border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Instant Preview</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceFrame('mobile')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              deviceFrame === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
          <button
            onClick={() => setDeviceFrame('full')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              deviceFrame === 'full' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline">Full</span>
          </button>

          <button
            onClick={runPreview}
            disabled={isRunning}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Card view if runtime/build error occurs */}
      {runtimeError && (
        <div className="p-3">
          <ErrorCard error={runtimeError} />
        </div>
      )}

      {/* Live Preview Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-[#050609]">
        <div className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-white/10 transition-all ${
          deviceFrame === 'mobile' ? 'w-full max-w-[375px]' : 'w-full'
        }`}>
          <iframe
            title="GundamDev Live Preview"
            srcDoc={previewHtml}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
