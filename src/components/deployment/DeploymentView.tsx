import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { DeploymentService } from '../../services/deployment/deploymentService';
import { DeploymentResult, DeploymentProviderType } from '../../types/deployment';
import { UploadCloud, ExternalLink, CheckCircle2 } from 'lucide-react';

export const DeploymentView: React.FC = () => {
  const { activeProject } = useProjects();
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProviderType>('netlify');
  const [history, setHistory] = useState<DeploymentResult[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [latestDeployment, setLatestDeployment] = useState<DeploymentResult | null>(null);

  const fetchHistory = async (projId: string) => {
    const records = await DeploymentService.getDeploymentHistory(projId);
    setHistory(records);
    if (records.length > 0) setLatestDeployment(records[0]);
  };

  useEffect(() => {
    if (activeProject) {
      fetchHistory(activeProject.id);
    }
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const res = await DeploymentService.triggerDeploy(activeProject.id, {
        provider: selectedProvider,
        environment: 'PROD'
      });
      setLatestDeployment(res);
      await fetchHistory(activeProject.id);
    } catch (err: any) {
      console.error('Deployment error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const providers = DeploymentService.getAvailableProviders();

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Multi-Provider Deployment</span>
          </h3>
          <p className="text-[10px] text-slate-400">Deploy live to Netlify or Cloudflare Pages</p>
        </div>
      </div>

      {/* Provider Selector Card */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">Choose Host Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {providers.map(p => {
            const isSelected = selectedProvider === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => setSelectedProvider(p.type)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                    : 'bg-[#161a26] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold capitalize mb-0.5">{p.name}</div>
                <div className="text-[9px] font-mono text-slate-400">Global Edge Network</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 min-h-[44px] active:scale-95"
        >
          {isDeploying ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Trigger Production Deploy ({selectedProvider})</span>
            </>
          )}
        </button>
      </div>

      {/* Latest Live Status */}
      {latestDeployment && (
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/40 mb-6 bg-emerald-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Deployment Live ({latestDeployment.provider})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(latestDeployment.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-300 truncate max-w-[220px]">
              {latestDeployment.url}
            </span>
            <a
              href={latestDeployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium flex items-center gap-1 shrink-0"
            >
              <span>Visit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Deployment History */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono">Deployment Log History</h4>
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-xs">No deployments logged yet.</div>
          ) : (
            history.map(dep => (
              <div key={dep.id} className="p-3 rounded-xl bg-[#12151e] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 capitalize">{dep.provider}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(dep.createdAt).toLocaleString()}
                  </span>
                </div>
                <a
                  href={dep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 font-mono underline hover:text-indigo-300"
                >
                  {dep.url?.replace('https://', '')}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
