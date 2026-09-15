import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { SecretService } from '../../services/secretService';
import { SecretVariable } from '../../types';
import { KeyRound, Plus, Eye, EyeOff, Trash2, ShieldCheck } from 'lucide-react';

export const SecretManagerView: React.FC = () => {
  const { activeProject } = useProjects();
  const [secrets, setSecrets] = useState<SecretVariable[]>([]);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [keyInput, setKeyInput] = useState('');
  const [valInput, setValInput] = useState('');
  const [envInput, setEnvInput] = useState<'DEV' | 'PROD'>('DEV');
  const [isAdding, setIsAdding] = useState(false);

  const fetchSecrets = async (projId: string) => {
    const data = await SecretService.getSecrets(projId);
    setSecrets(data);
  };

  useEffect(() => {
    if (activeProject) {
      fetchSecrets(activeProject.id);
    }
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim() || !valInput.trim()) return;

    try {
      await SecretService.addOrUpdateSecret(activeProject.id, keyInput, valInput, envInput);
      await fetchSecrets(activeProject.id);
      setKeyInput('');
      setValInput('');
      setIsAdding(false);
    } catch (err: any) {
      console.error('Failed to add secret:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await SecretService.deleteSecret(activeProject.id, id);
      await fetchSecrets(activeProject.id);
    } catch (err: any) {
      console.error('Failed to delete secret:', err);
    }
  };

  const toggleShow = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Encrypted Secret Vault</span>
          </h3>
          <p className="text-[10px] text-slate-400">Environment variables & API key management</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Secret</span>
        </button>
      </div>

      {/* Add Secret Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card rounded-2xl p-4 border border-indigo-500/40 mb-4 space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1">Key Name</label>
            <input
              type="text"
              required
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="STRIPE_SECRET_KEY"
              className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1">Secret Value</label>
            <input
              type="password"
              required
              value={valInput}
              onChange={e => setValInput(e.target.value)}
              placeholder="sk_live_..."
              className="w-full bg-[#161a26] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1">Target Environment</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEnvInput('DEV')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  envInput === 'DEV' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                Development (DEV)
              </button>
              <button
                type="button"
                onClick={() => setEnvInput('PROD')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  envInput === 'PROD' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                Production (PROD)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
          >
            Save Encrypted Secret
          </button>
        </form>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-white/5 mb-4">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>AES-256-GCM encrypted at rest. Never committed to Git or exposed in client bundles.</span>
      </div>

      {/* Secret Variables List */}
      <div className="space-y-2">
        {secrets.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">No secrets configured for this project.</div>
        ) : (
          secrets.map(sec => {
            const isRevealed = showValues[sec.id];
            return (
              <div key={sec.id} className="glass-card rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <div className="overflow-hidden mr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-white truncate">{sec.key}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                      sec.environment === 'PROD' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {sec.environment}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block truncate">
                    {isRevealed ? sec.value : '••••••••••••••••••••'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleShow(sec.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(sec.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
