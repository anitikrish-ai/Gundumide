import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GitHubService } from '../../services/githubService';
import { DeploymentService } from '../../services/deployment/deploymentService';
import { ProjectService } from '../../services/projectService';
import { Sparkles, Github, UploadCloud, CheckCircle2 } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, refreshProjects } = useProjects();
  const { files } = useWorkspace();
  const [option, setOption] = useState<'github' | 'deploy' | 'both'>('both');
  const [commitMsg, setCommitMsg] = useState('Publish project updates from GundamDev');
  const [isPublishing, setIsPublishing] = useState(false);
  const [successResult, setSuccessResult] = useState<{ github: boolean; deployUrl?: string } | null>(null);

  if (!activeProject) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setSuccessResult(null);

    try {
      let githubSuccess = false;
      let deployUrl: string | undefined;

      if (option === 'github' || option === 'both') {
        const ghRes = await GitHubService.pushChanges(activeProject.id, commitMsg, files);
        githubSuccess = ghRes.success;
      }

      if (option === 'deploy' || option === 'both') {
        const depRes = await DeploymentService.triggerDeploy(activeProject.id, {
          provider: 'netlify',
          environment: 'PROD'
        });
        deployUrl = depRes.url;
      }

      await ProjectService.updateProjectStatus(activeProject.id, deployUrl ? 'Deployment Live' : 'GitHub Synced', deployUrl);
      refreshProjects();

      setSuccessResult({ github: githubSuccess, deployUrl });
    } catch (err: any) {
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Project Workspace">
      {successResult ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1">Publish Completed Successfully</h4>
            <p className="text-xs text-slate-400">All code changes are pushed and ready.</p>
          </div>

          {successResult.deployUrl && (
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-left">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Live Site URL:</span>
              <a
                href={successResult.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-indigo-400 underline font-semibold break-all"
              >
                {successResult.deployUrl}
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Publish Pipeline</label>
            <div className="space-y-2">
              <div
                onClick={() => setOption('both')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  option === 'both' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#161a26] border-white/5 text-slate-400'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold">GitHub Sync + Production Deploy</h5>
                  <p className="text-[10px] text-slate-400">Pushes code to GitHub & triggers live edge deployment</p>
                </div>
              </div>

              <div
                onClick={() => setOption('github')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  option === 'github' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#161a26] border-white/5 text-slate-400'
                }`}
              >
                <Github className="w-5 h-5 text-slate-200 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold">GitHub Sync Only</h5>
                  <p className="text-[10px] text-slate-400">Commit and push changes to remote repository</p>
                </div>
              </div>

              <div
                onClick={() => setOption('deploy')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  option === 'deploy' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#161a26] border-white/5 text-slate-400'
                }`}
              >
                <UploadCloud className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold">Deploy Only</h5>
                  <p className="text-[10px] text-slate-400">Deploy current workspace directly to Netlify/Cloudflare</p>
                </div>
              </div>
            </div>
          </div>

          {(option === 'github' || option === 'both') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Commit Message</label>
              <input
                type="text"
                required
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPublishing}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 min-h-[44px]"
          >
            {isPublishing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Publish Action</span>
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
