import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { AuthView } from './components/views/AuthView';
import { WelcomeView } from './components/views/WelcomeView';
import { HomeView } from './components/views/HomeView';
import { WorkspaceView } from './components/views/WorkspaceView';

import { NewProjectSheet } from './components/views/NewProjectSheet';
import { ImportProjectSheet } from './components/views/ImportProjectSheet';
import { GitHubImportModal } from './components/views/GitHubImportModal';
import { PublishModal } from './components/publish/PublishModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, showWelcome, isLoading } = useAuth();
  const { activeProject } = useProjects();

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isGitHubImportOpen, setIsGitHubImportOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth Guard
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // Welcome Animation View
  if (showWelcome) {
    return <WelcomeView />;
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      <Header onOpenPublish={() => setIsPublishOpen(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeProject ? (
          <WorkspaceView />
        ) : (
          <HomeView
            onOpenNewProject={() => setIsNewOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenGitHubImport={() => setIsGitHubImportOpen(true)}
          />
        )}
      </main>

      <BottomNav />

      {/* Sheet & Modal Containers */}
      <NewProjectSheet isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} />
      <ImportProjectSheet isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <GitHubImportModal isOpen={isGitHubImportOpen} onClose={() => setIsGitHubImportOpen(false)} />
      <PublishModal isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <WorkspaceProvider>
          <AppContent />
        </WorkspaceProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
