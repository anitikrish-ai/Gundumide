import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { MOTION_VARIANTS } from './theme/motion-tokens';

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

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        // Auth Guard
        <motion.div key="auth" {...MOTION_VARIANTS.fadeUp}>
          <AuthView />
        </motion.div>
      ) : showWelcome ? (
        // Welcome Animation View
        <motion.div key="welcome" {...MOTION_VARIANTS.fadeUp}>
          <WelcomeView />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          {...MOTION_VARIANTS.fadeUp}
          className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans"
        >
          <Header onOpenPublish={() => setIsPublishOpen(true)} />

          <main className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {activeProject ? (
                <motion.div key="workspace" {...MOTION_VARIANTS.fadeUp} className="flex-1 flex flex-col overflow-hidden">
                  <WorkspaceView />
                </motion.div>
              ) : (
                <motion.div key="home" {...MOTION_VARIANTS.fadeUp} className="flex-1 flex flex-col overflow-hidden">
                  <HomeView
                    onOpenNewProject={() => setIsNewOpen(true)}
                    onOpenImport={() => setIsImportOpen(true)}
                    onOpenGitHubImport={() => setIsGitHubImportOpen(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <BottomNav />

          {/* Sheet & Modal Containers */}
          <NewProjectSheet isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} />
          <ImportProjectSheet isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
          <GitHubImportModal isOpen={isGitHubImportOpen} onClose={() => setIsGitHubImportOpen(false)} />
          <PublishModal isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} />
        </motion.div>
      )}
    </AnimatePresence>
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
