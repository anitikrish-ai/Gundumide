import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjects } from '../../context/ProjectContext';
import { MobileCodeEditor } from '../editor/MobileCodeEditor';
import { FileExplorer } from '../editor/FileExplorer';
import { PreviewPane } from '../preview/PreviewPane';
import { LogViewer } from '../preview/LogViewer';
import { SecretManagerView } from '../secrets/SecretManagerView';
import { GitHubView } from '../github/GitHubView';
import { DeploymentView } from '../deployment/DeploymentView';
import { SettingsView } from '../settings/SettingsView';
import { Badge } from '../common/Badge';
import { Layers, FileCode, Play, GitBranch, UploadCloud, ArrowLeft } from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const { activeProject, selectProject } = useProjects();
  const { activeSection, setActiveSection, files } = useWorkspace();

  if (!activeProject) return null;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'Files':
        return <FileExplorer />;
      case 'Editor':
        return <MobileCodeEditor />;
      case 'Preview':
        return <PreviewPane />;
      case 'Logs':
        return <LogViewer />;
      case 'GitHub':
        return <GitHubView />;
      case 'Deployments':
        return <DeploymentView />;
      case 'Secrets':
        return <SecretManagerView />;
      case 'Settings':
        return <SettingsView />;
      case 'Overview':
      default:
        return (
          <div className="flex-1 p-4 pb-24 space-y-4 overflow-y-auto no-scrollbar">
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{activeProject.name}</h2>
                    <span className="text-[10px] font-mono text-slate-400">{activeProject.template}</span>
                  </div>
                </div>
                <Badge status={activeProject.status} />
              </div>

              <p className="text-xs text-slate-300 mb-4">{activeProject.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-white/10">
                <div className="p-2.5 rounded-xl bg-black/20">
                  <span className="text-[10px] text-slate-500 block">Workspace Files</span>
                  <span className="font-bold text-indigo-300">{files.length} items</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20">
                  <span className="text-[10px] text-slate-500 block">Git Branch</span>
                  <span className="font-bold text-emerald-400">{activeProject.gitBranch || 'main'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveSection('Editor')}
                className="p-4 rounded-2xl bg-[#12151e] border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
              >
                <FileCode className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white mb-0.5">Mobile Editor</h4>
                <p className="text-[10px] text-slate-400">Code with auto-indent & touch toolbar</p>
              </button>

              <button
                onClick={() => setActiveSection('Preview')}
                className="p-4 rounded-2xl bg-[#12151e] border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
              >
                <Play className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white mb-0.5">Instant Preview</h4>
                <p className="text-[10px] text-slate-400">Hot reload remote preview iframe</p>
              </button>

              <button
                onClick={() => setActiveSection('GitHub')}
                className="p-4 rounded-2xl bg-[#12151e] border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
              >
                <GitBranch className="w-6 h-6 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white mb-0.5">GitHub Sync</h4>
                <p className="text-[10px] text-slate-400">Push, pull, commit & branch switch</p>
              </button>

              <button
                onClick={() => setActiveSection('Deployments')}
                className="p-4 rounded-2xl bg-[#12151e] border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
              >
                <UploadCloud className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white mb-0.5">Deploy Live</h4>
                <p className="text-[10px] text-slate-400">Deploy to Netlify or Cloudflare Pages</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] overflow-hidden">
      {/* Top Workspace Section Selector Sub-Header */}
      <div className="px-3 py-2 bg-[#0c0e17] border-b border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => selectProject(null)}
            className="p-1 rounded text-slate-400 hover:text-white mr-1"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {(['Overview', 'Files', 'Editor', 'Preview', 'Logs', 'GitHub', 'Deployments', 'Secrets'] as const).map(sec => {
            const isActive = activeSection === sec;
            return (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderSectionContent()}
      </div>
    </div>
  );
};
