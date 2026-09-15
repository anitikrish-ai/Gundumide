import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EditorToolbar } from './EditorToolbar';
import { Undo, Redo, Play, Save, Code } from 'lucide-react';

export const MobileCodeEditor: React.FC = () => {
  const { activeFile, updateFileContent, saveActiveFile, unsavedFiles, runPreview, isRunning } = useWorkspace();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    if (activeFile) {
      const lines = activeFile.content.split('\n').length;
      setLineCount(Math.max(1, lines));
      setHistory([activeFile.content]);
      setHistoryIndex(0);
    }
  }, [activeFile?.id]);

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#090a0f] text-slate-500 min-h-[400px]">
        <Code className="w-12 h-12 stroke-1 mb-3 text-slate-600" />
        <p className="text-xs font-semibold text-slate-300 mb-1">No File Selected</p>
        <p className="text-[10px] text-slate-500 max-w-xs">Select or create a file from the Files tab to start coding.</p>
      </div>
    );
  }

  const isUnsaved = unsavedFiles.has(activeFile.id);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateFileContent(activeFile.id, newContent);

    const lines = newContent.split('\n').length;
    setLineCount(Math.max(1, lines));

    if (history[historyIndex] !== newContent) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newContent);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const updated = target.value.substring(0, start) + '  ' + target.value.substring(end);
      updateFileContent(activeFile.id, updated);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    if (['{', '(', '[', '"', "'"].includes(e.key)) {
      const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
      const closePair = pairs[e.key];
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (start === end) {
        e.preventDefault();
        const updated = target.value.substring(0, start) + e.key + closePair + target.value.substring(end);
        updateFileContent(activeFile.id, updated);

        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateFileContent(activeFile.id, prevContent);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateFileContent(activeFile.id, nextContent);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] h-full overflow-hidden">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12151e] border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-mono font-semibold text-slate-200">{activeFile.name}</span>
          {isUnsaved && (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={saveActiveFile}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1 transition-all ${
              isUnsaved 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-white/5 text-slate-400'
            }`}
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>

          <button
            onClick={runPreview}
            className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all active:scale-95"
          >
            {isRunning ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Gutter Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-10 bg-[#0c0e17] border-r border-white/5 py-3 pr-2 select-none text-right font-mono text-[11px] text-slate-600 leading-6 overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={activeFile.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 bg-[#090a0f] text-slate-100 p-3 font-mono text-xs leading-6 resize-none focus:outline-none overflow-y-auto no-scrollbar selection:bg-indigo-600/40"
        />
      </div>

      <EditorToolbar 
        onInsertSymbol={(sym) => {
          if (!textareaRef.current || !activeFile) return;
          const target = textareaRef.current;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const updated = target.value.substring(0, start) + sym + target.value.substring(end);
          updateFileContent(activeFile.id, updated);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + sym.length;
          }, 0);
        }}
      />
    </div>
  );
};
