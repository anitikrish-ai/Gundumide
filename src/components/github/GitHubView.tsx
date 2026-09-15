import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GitHubService } from '../../services/githubService';
import { GitHubBranch, GitCommit } from '../../types/github';
import { GitBranch, GitCommit as CommitIcon, UploadCloud, DownloadCloud, Github, CheckCircle2 } from 'lucide-react';

export const GitHubView: React.FC = () => {
  const { activeProject } = useProjects();
  const { files } = useWorkspace();
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMsg, setCommitMsg] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeProject?.isGitHubConnected) {
      GitHubService.getBranches(activeProject.gitRepoUrl || 'gundamdev-app').then(setBranches);
      GitHubService.getCommitHistory(activeProject.gitRepoUrl || 'gundamdev-app').then(setCommits);
    }
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMsg.trim()) return;

    setIsPushing(true);
    setStatusMsg(null);

    try {
      const res = await GitHubService.pushChanges(activeProject.id, commitMsg, files);
      if (res.success) {
        setStatusMsg(`Committed & pushed (${res.commitSha}) to ${currentBranch}`);
        setCommitMsg('');
        const updated = await GitHubService.getCommitHistory(activeProject.gitRepoUrl || 'gundamdev-app');
        setCommits(updated);
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    setStatusMsg(null);
    try {
      const res = await GitHubService.pullChanges(activeProject.id);
      setStatusMsg(`Pulled latest changes (${res.filesUpdated} files updated).`);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">GitHub Integration</h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {activeProject.gitRepoUrl || 'Not connected to remote repository'}
            </p>
          </div>
        </div>

        <button
          onClick={handlePull}
          disabled={isPulling}
          className="px-2.5 py-1.5 rounded-lg bg-[#161a26] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <DownloadCloud className={`w-3.5 h-3.5 text-indigo-400 ${isPulling ? 'animate-bounce' : ''}`} />
          <span>Pull</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Branch Selector */}
      <div className="glass-card rounded-xl p-3 border border-white/10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Active Branch:</span>
        </div>
        <select
          value={currentBranch}
          onChange={e => setCurrentBranch(e.target.value)}
          className="bg-[#161a26] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
        >
          {branches.map(b => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Commit & Push Form */}
      <form onSubmit={handlePush} className="glass-card rounded-2xl p-4 border border-white/10 mb-6 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <CommitIcon className="w-4 h-4 text-indigo-400" />
          <span>Stage & Commit Workspace Changes</span>
        </h4>

        <input
          type="text"
          required
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          placeholder="feat: update mobile editor layout & preview engine"
          className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={isPushing || !commitMsg.trim()}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          {isPushing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Commit & Push to GitHub</span>
            </>
          )}
        </button>
      </form>

      {/* Commit History */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono">Recent Commit History</h4>
        <div className="space-y-2">
          {commits.map(c => (
            <div key={c.sha} className="p-3 rounded-xl bg-[#12151e] border border-white/5 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-200">{c.message}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  by {c.authorName} • {new Date(c.date).toLocaleDateString()}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                {c.sha}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
