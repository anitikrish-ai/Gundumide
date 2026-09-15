import React from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { 
  Plus, 
  Upload, 
  Search, 
  FolderGit2, 
  Layers,
  ArrowUpRight,
  Github
} from 'lucide-react';
import { MOTION_VARIANTS } from '../../theme/motion-tokens';

interface HomeViewProps {
  onOpenNewProject: () => void;
  onOpenImport: () => void;
  onOpenGitHubImport: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenNewProject,
  onOpenImport,
  onOpenGitHubImport
}) => {
  const { user } = useAuth();
  const { filteredProjects, searchQuery, setSearchQuery, selectProject } = useProjects();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Project Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloud development control center for {user?.username || 'Developer'}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={onOpenNewProject}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button
            onClick={onOpenImport}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1a1e2b] hover:bg-[#23283a] text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px] whitespace-nowrap"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import ZIP</span>
          </button>

          <button
            onClick={onOpenGitHubImport}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1a1e2b] hover:bg-[#23283a] text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px] whitespace-nowrap"
          >
            <Github className="w-4 h-4 text-slate-300" />
            <span>Import Repo</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search projects by name, description, or template..."
          className="w-full bg-[#12151e] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/10 my-8">
          <FolderGit2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200 mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 mb-4">Create a new project or import an existing workspace.</p>
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <motion.div
          variants={MOTION_VARIANTS.staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredProjects.map(project => (
            <motion.div
              key={project.id}
              variants={MOTION_VARIANTS.staggerItem}
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400">{project.template}</p>
                    </div>
                  </div>
                  <Badge status={project.status} />
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {project.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectProject(project.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-xs flex items-center gap-1 transition-all active:scale-95"
                  >
                    <span>Open Editor</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
