/**
 * Core Domain Models for GundamDev Workspace Platform
 */

export type ProjectTemplateType = 'HTML_CSS_JS' | 'React' | 'Vite';

export type ProjectStatus = 'Saved' | 'Running' | 'GitHub Synced' | 'Deployment Live' | 'Build Failed';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  gitHubConnected: boolean;
  gitHubUsername?: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  children?: ProjectFile[];
  updatedAt: string;
  language?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: ProjectTemplateType;
  status: ProjectStatus;
  updatedAt: string;
  createdAt: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  isGitHubConnected: boolean;
  lastDeployedAt?: string;
  deploymentUrl?: string;
  files: ProjectFile[];
}

export interface SecretVariable {
  id: string;
  key: string;
  value: string; // Masked on client side unless editing
  environment: 'DEV' | 'PROD';
  updatedAt: string;
}

export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface FormattedError {
  id: string;
  file: string;
  line: number;
  column?: number;
  message: string;
  rawStack?: string;
}
