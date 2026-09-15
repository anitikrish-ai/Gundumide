import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useProjects } from '../../context/ProjectContext';
import { AuthService } from '../../services/authService';
import { Upload, FileArchive, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ImportProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportProjectSheet: React.FC<ImportProjectSheetProps> = ({ isOpen, onClose }) => {
  const { refreshProjects, selectProject } = useProjects();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setProjectName(selected.name.replace(/\.[^/.]+$/, ''));
      setError(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('archive', file);
      formData.append('name', projectName || file.name.replace(/\.zip$/i, ''));

      const token = AuthService.getToken();
      const res = await fetch('/api/projects/import/zip', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'ZIP import failed');
      }

      // Refresh project list and open the newly imported project
      await refreshProjects();
      await selectProject(json.data.id);

      setFile(null);
      setProjectName('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ZIP extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Import Project Archive">
      <form onSubmit={handleImport} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select ZIP Archive or Files</label>
          <div className="relative border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-[#161a26] transition-colors cursor-pointer group">
            <input
              type="file"
              accept=".zip,.html,.js,.jsx,.ts,.tsx,.json,.css"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-white mb-0.5">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileArchive className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold text-slate-200">Tap to browse files or drop ZIP here</span>
                <span className="text-[10px] text-slate-400 mt-1">Extracts securely on backend sandbox</span>
              </div>
            )}
          </div>
        </div>

        {file && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automatic path traversal protection &amp; template detection applied server-side.</span>
        </div>

        <button
          type="submit"
          disabled={!file || isProcessing}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 min-h-[44px]"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Import &amp; Prepare Workspace</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
};
