import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useWorkspace, WorkspaceSection } from '../../context/WorkspaceContext';
import { 
  Home, 
  FolderGit2, 
  Settings, 
  Code2, 
  Play, 
  Terminal, 
  GitBranch, 
  UploadCloud, 
  KeyRound,
  FileCode
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeProject, selectProject } = useProjects();
  const { activeSection, setActiveSection, runPreview, isRunning } = useWorkspace();

  if (!activeProject) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => selectProject(null)}
            className="flex flex-col items-center gap-1 p-2 text-indigo-400 min-w-[56px] min-h-[48px] justify-center"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => selectProject(null)}
            className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-200 min-w-[56px] min-h-[48px] justify-center"
          >
            <FolderGit2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Projects</span>
          </button>

          <button 
            onClick={() => selectProject(null)}
            className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-200 min-w-[56px] min-h-[48px] justify-center"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    );
  }

  const workspaceTabs: { id: WorkspaceSection; label: string; icon: React.ReactNode }[] = [
    { id: 'Files', label: 'Files', icon: <FileCode className="w-5 h-5" /> },
    { id: 'Editor', label: 'Editor', icon: <Code2 className="w-5 h-5" /> },
    { id: 'Preview', label: 'Preview', icon: <Play className="w-5 h-5" /> },
    { id: 'Logs', label: 'Logs', icon: <Terminal className="w-5 h-5" /> },
    { id: 'GitHub', label: 'GitHub', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'Deployments', label: 'Deploy', icon: <UploadCloud className="w-5 h-5" /> },
    { id: 'Secrets', label: 'Secrets', icon: <KeyRound className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
        {workspaceTabs.map(tab => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'Preview') {
                  runPreview();
                }
                setActiveSection(tab.id);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[54px] min-h-[48px] justify-center ${
                isActive 
                  ? 'text-indigo-400 bg-indigo-500/15 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.id === 'Preview' && isRunning ? (
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                tab.icon
              )}
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
