import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FileCode, Plus, Trash2, Search } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const { files, activeFile, openFile, addFile, deleteFile } = useWorkspace();
  const [newFilePath, setNewFilePath] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    addFile(newFilePath.trim());
    setNewFilePath('');
    setIsAdding(false);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.path.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Project Files</h3>
          <p className="text-[10px] text-slate-400 font-mono">{files.length} items in workspace</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New File</span>
        </button>
      </div>

      {/* New File Inline Input */}
      {isAdding && (
        <form onSubmit={handleCreate} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            required
            value={newFilePath}
            onChange={e => setNewFilePath(e.target.value)}
            placeholder="src/components/Button.jsx"
            className="flex-1 bg-[#161a26] border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Add
          </button>
        </form>
      )}

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter workspace files..."
          className="w-full bg-[#12151e] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>

      {/* File Tree List */}
      <div className="space-y-1.5">
        {filteredFiles.map(file => {
          const isActive = activeFile?.id === file.id;
          return (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isActive 
                  ? 'bg-indigo-600/15 border-indigo-500/40 text-white font-semibold' 
                  : 'bg-[#12151e] border-white/5 hover:border-white/15 text-slate-300'
              }`}
            >
              <div 
                onClick={() => openFile(file)}
                className="flex items-center gap-2.5 flex-1 overflow-hidden"
              >
                <FileCode className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div className="truncate">
                  <span className="text-xs block truncate">{file.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono block truncate">{file.path}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${file.name}?`)) {
                    deleteFile(file.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
