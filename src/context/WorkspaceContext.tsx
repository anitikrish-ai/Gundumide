/**
 * Active Project Workspace Context Provider
 * Manages VFS files, editor tabs, unsaved states, preview triggers, logs stream, and active section.
 * File persistence goes through the backend API (not localStorage).
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectFile, LogEntry, FormattedError } from '../types';
import { useProjects } from './ProjectContext';
import { ProjectService } from '../services/projectService';
import { BuildRuntimeService } from '../services/buildRuntimeService';

export type WorkspaceSection =
  | 'Overview'
  | 'Files'
  | 'Editor'
  | 'Preview'
  | 'Logs'
  | 'GitHub'
  | 'Deployments'
  | 'Secrets'
  | 'Settings';

interface WorkspaceContextType {
  activeSection: WorkspaceSection;
  setActiveSection: (sec: WorkspaceSection) => void;
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  openFiles: ProjectFile[];
  unsavedFiles: Set<string>;
  isSaving: boolean;
  openFile: (file: ProjectFile) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveActiveFile: () => Promise<void>;
  saveAllFiles: () => Promise<void>;
  addFile: (path: string, content?: string) => void;
  deleteFile: (fileId: string) => void;
  logs: LogEntry[];
  clearLogs: () => void;
  runtimeError: FormattedError | null;
  isRunning: boolean;
  runPreview: () => void;
  previewHtml: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeProject, updateActiveProjectFiles } = useProjects();
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('Editor');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runtimeError, setRuntimeError] = useState<FormattedError | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // ── Reset workspace when active project changes ──────────────────────────

  useEffect(() => {
    if (activeProject) {
      const projectFiles = activeProject.files || [];
      setFiles(projectFiles);
      setLogs(BuildRuntimeService.generateInitialLogs());
      setPreviewHtml(BuildRuntimeService.generateLivePreviewHtml(projectFiles));
      setUnsavedFiles(new Set());

      const firstFile = projectFiles.find(f => !f.isFolder) || null;
      if (firstFile) {
        setOpenFiles([firstFile]);
        setActiveFileId(firstFile.id);
      } else {
        setOpenFiles([]);
        setActiveFileId(null);
      }
    } else {
      setFiles([]);
      setOpenFiles([]);
      setActiveFileId(null);
      setPreviewHtml('');
      setLogs([]);
      setUnsavedFiles(new Set());
    }
  }, [activeProject?.id]);

  const activeFile = files.find(f => f.id === activeFileId) || null;

  // ── Editor operations ─────────────────────────────────────────────────────

  const openFile = (file: ProjectFile) => {
    if (file.isFolder) return;
    if (!openFiles.some(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
    setActiveSection('Editor');
  };

  const closeFile = (fileId: string) => {
    const nextOpen = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(nextOpen);
    if (activeFileId === fileId) {
      setActiveFileId(nextOpen.length > 0 ? nextOpen[nextOpen.length - 1].id : null);
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content, updatedAt: new Date().toISOString() } : f));
    setOpenFiles(prev => prev.map(f => f.id === fileId ? { ...f, content, updatedAt: new Date().toISOString() } : f));
    setUnsavedFiles(prev => new Set(prev).add(fileId));
  };

  // ── Save to backend ───────────────────────────────────────────────────────

  const saveAllFiles = async () => {
    if (!activeProject || unsavedFiles.size === 0) return;
    setIsSaving(true);
    try {
      await ProjectService.saveFiles(activeProject.id, files);
      setUnsavedFiles(new Set());
      updateActiveProjectFiles(files);
    } catch (err: any) {
      console.error('Save failed:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveActiveFile = async () => {
    if (!activeProject || !activeFileId) return;
    setIsSaving(true);
    try {
      await ProjectService.saveFiles(activeProject.id, files);
      setUnsavedFiles(prev => {
        const next = new Set(prev);
        next.delete(activeFileId);
        return next;
      });
      updateActiveProjectFiles(files);
    } catch (err: any) {
      console.error('Save failed:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── File tree operations ──────────────────────────────────────────────────

  const addFile = (filePath: string, content: string = '') => {
    if (!activeProject) return;
    const name = filePath.split('/').pop() || 'new-file.js';
    const ext = name.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      css: 'css', html: 'html', json: 'json', md: 'markdown'
    };
    const newFile: ProjectFile = {
      id: `file_${Date.now()}`,
      name,
      path: filePath.startsWith('/') ? filePath : `/${filePath}`,
      content,
      isFolder: false,
      updatedAt: new Date().toISOString(),
      language: langMap[ext] || 'plaintext'
    };

    const nextFiles = [...files, newFile];
    setFiles(nextFiles);
    setUnsavedFiles(prev => new Set(prev).add(newFile.id));
    openFile(newFile);
  };

  const deleteFile = (fileId: string) => {
    if (!activeProject) return;
    const nextFiles = files.filter(f => f.id !== fileId);
    setFiles(nextFiles);
    closeFile(fileId);
    // Persist deletion
    ProjectService.saveFiles(activeProject.id, nextFiles).catch(console.error);
    updateActiveProjectFiles(nextFiles);
  };

  // ── Preview / Run ─────────────────────────────────────────────────────────

  const runPreview = () => {
    if (!activeProject) return;
    setIsRunning(true);

    // Auto-save before preview
    if (unsavedFiles.size > 0) {
      ProjectService.saveFiles(activeProject.id, files)
        .then(() => {
          setUnsavedFiles(new Set());
          updateActiveProjectFiles(files);
        })
        .catch(console.error);
    }

    setLogs(prev => [
      ...prev,
      {
        id: `l_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '[Build Exec] Triggered incremental remote rebuild...'
      }
    ]);

    setTimeout(() => {
      const html = BuildRuntimeService.generateLivePreviewHtml(files);
      setPreviewHtml(html);
      setIsRunning(false);
      setRuntimeError(null);
      setLogs(prev => [
        ...prev,
        {
          id: `l_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'success',
          message: '[Preview Runtime] Rebuild complete. Instant preview updated.'
        }
      ]);
    }, 400);
  };

  const clearLogs = () => setLogs([]);

  return (
    <WorkspaceContext.Provider value={{
      activeSection,
      setActiveSection,
      files,
      activeFile,
      openFiles,
      unsavedFiles,
      isSaving,
      openFile,
      closeFile,
      updateFileContent,
      saveActiveFile,
      saveAllFiles,
      addFile,
      deleteFile,
      logs,
      clearLogs,
      runtimeError,
      isRunning,
      runPreview,
      previewHtml
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};
