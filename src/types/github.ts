/**
 * GitHub API & Synchronization Data Contracts
 */

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  description: string | null;
  defaultBranch: string;
  cloneUrl: string;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  isDefault: boolean;
  sha: string;
}

export interface GitCommit {
  sha: string;
  message: string;
  authorName: string;
  date: string;
}

export interface GitSyncStatus {
  hasUncommittedChanges: boolean;
  aheadCount: number;
  behindCount: number;
  currentBranch: string;
  lastSyncedAt?: string;
}
