import React from 'react';

interface EditorToolbarProps {
  onInsertSymbol: (symbol: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onInsertSymbol }) => {
  const symbols = ['{', '}', '(', ')', '<', '>', ';', '=', '=>', '"', "'", '[', ']', ':', ',', '.'];

  return (
    <div className="bg-[#12151e] border-t border-white/10 px-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {symbols.map(sym => (
        <button
          key={sym}
          onClick={() => onInsertSymbol(sym)}
          className="px-2.5 py-1.5 rounded bg-[#1c2130] hover:bg-indigo-600 text-slate-200 hover:text-white font-mono text-xs font-semibold active:scale-95 transition-all min-w-[32px] min-h-[36px] flex items-center justify-center shrink-0 border border-white/5"
        >
          {sym}
        </button>
      ))}
    </div>
  );
};
