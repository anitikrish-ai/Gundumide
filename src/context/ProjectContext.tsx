/**
 * Global Projects Context Provider
 * All project data is fetched from and persisted to the real backend API.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Project, ProjectTemplateType } from '../types';
import { ProjectService } from '../services/projectService';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProjects: Project[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  selectProject: (id: string | null) => Promise<void>;
  createProject: (name: string, desc: string, template: ProjectTemplateType) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  updateActiveProjectFiles: (files: import('../types').ProjectFile[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // ── Fetch all projects ──────────────────────────────────────────────────

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const list = await ProjectService.getAllProjects();
      setProjects(list);
    } catch (err: any) {
      setProjectsError(err.message || 'Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshProjects();
    }
    if (!isAuthenticated) {
      setProjects([]);
      setActiveProject(null);
    }
  }, [isAuthenticated, authLoading, refreshProjects]);

  // ── Filtered view ────────────────────────────────────────────────────────

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Select & load project with files ────────────────────────────────────

  const selectProject = async (id: string | null) => {
    if (!id) {
      setActiveProject(null);
      return;
    }
    try {
      const proj = await ProjectService.getProjectById(id);
      setActiveProject(proj);
    } catch (err: any) {
      console.error('Failed to load project:', err.message);
      setActiveProject(null);
    }
  };

  // ── Create project ───────────────────────────────────────────────────────

  const createProject = async (name: string, desc: string, template: ProjectTemplateType): Promise<Project> => {
    const newProj = await ProjectService.createProject(name, desc, template);
    await refreshProjects();
    setActiveProject(newProj);
    return newProj;
  };

  // ── Delete project ───────────────────────────────────────────────────────

  const deleteProject = async (id: string) => {
    await ProjectService.deleteProject(id);
    if (activeProject?.id === id) setActiveProject(null);
    await refreshProjects();
  };

  // ── Update active project files in local state (after editor save) ───────

  const updateActiveProjectFiles = (files: import('../types').ProjectFile[]) => {
    if (!activeProject) return;
    setActiveProject(prev => prev ? { ...prev, files } : null);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, files } : p));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      searchQuery,
      setSearchQuery,
      filteredProjects,
      isLoadingProjects,
      projectsError,
      selectProject,
      createProject,
      deleteProject,
      refreshProjects,
      updateActiveProjectFiles
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};
