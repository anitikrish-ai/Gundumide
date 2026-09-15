import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useProjects } from '../../context/ProjectContext';
import { ProjectTemplateType } from '../../types';
import { Code2, Zap, Layout, Sparkles, Check } from 'lucide-react';

interface NewProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectSheet: React.FC<NewProjectSheetProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateType>('HTML_CSS_JS');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates: { id: ProjectTemplateType; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'HTML_CSS_JS',
      title: 'HTML5 / CSS / JS',
      desc: 'Lightweight static & interactive web project.',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'React',
      title: 'React 18 Workspace',
      desc: 'Modern component-driven web application with JSX.',
      icon: <Layout className="w-5 h-5 text-sky-400" />
    },
    {
      id: 'Vite',
      title: 'Vite + TypeScript',
      desc: 'Blazing fast bundle & hot module preview environment.',
      icon: <Zap className="w-5 h-5 text-amber-400" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await createProject(name.trim(), description.trim(), selectedTemplate);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="my-awesome-mobile-app"
            className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief overview of project goals..."
            className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Select Ready-to-Run Template</label>
          <div className="space-y-2">
            {templates.map(tmpl => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-indigo-600/15 border-indigo-500/50' 
                      : 'bg-[#161a26] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                      {tmpl.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{tmpl.title}</h4>
                      <p className="text-[10px] text-slate-400">{tmpl.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 min-h-[44px]"
        >
          {isCreating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Initialize Project Environment</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
};
