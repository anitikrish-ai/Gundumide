import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { GitHubService } from '../../services/githubService';
import { GitHubRepository } from '../../types/github';
import { Github, Lock, ArrowRight, ShieldCheck, Check, AlertCircle, Loader2 } from 'lucide-react';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { refreshProjects, selectProject } = useProjects();

  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!user?.gitHubConnected;

  // Load repos when modal opens and user is already connected
  useEffect(() => {
    if (isOpen && isConnected) {
      loadRepos();
    }
    if (!isOpen) {
      setSelectedRepo(null);
      setError(null);
    }
  }, [isOpen, isConnected]);

  const loadRepos = async () => {
    setIsLoadingRepos(true);
    setError(null);
    try {
      const list = await GitHubService.getUserRepositories();
      setRepos(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Opens GitHub OAuth popup; resolves when user completes auth
      await GitHubService.connectOAuth();
      // Refresh user profile to pick up gitHubConnected: true
      await refreshUser();
      // Load repos now
      await loadRepos();
    } catch (err: any) {
      setError(err.message || 'GitHub connection failed or was cancelled');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedRepo) return;
    setIsImporting(true);
    setError(null);

    try {
      const result = await GitHubService.importRepository(selectedRepo.fullName, selectedRepo.defaultBranch);
      await refreshProjects();
      if (result?.id) await selectProject(result.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Repository import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GitHub Repository Import">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <Github className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Connect GitHub Account</h4>
          <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
            Authorize GundamDev once to browse repositories, clone projects, commit, push, and sync changes.
            Your token is stored encrypted server-side only.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            <span>{isConnecting ? 'Waiting for authorization...' : 'Connect GitHub via OAuth'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Connected as @{user?.gitHubUsername || 'github-user'}</span>
            </span>
            <span>{isLoadingRepos ? 'Loading...' : `${repos.length} Repositories`}</span>
          </div>

          {isLoadingRepos ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {repos.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No repositories found.</p>
              ) : repos.map(repo => {
                const isSelected = selectedRepo?.id === repo.id;
                return (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50'
                        : 'bg-[#161a26] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-slate-300" />
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{repo.name}</span>
                          {repo.isPrivate && <Lock className="w-3 h-3 text-amber-400" />}
                        </h5>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{repo.fullName}</p>
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
          )}

          <button
            onClick={handleImport}
            disabled={!selectedRepo || isImporting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            {isImporting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Import Selected Repository</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
};
