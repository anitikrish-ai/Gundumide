/**
 * GitHub OAuth & Repository Service
 * All GitHub operations go through the backend API.
 * The frontend never touches GitHub tokens directly — they are server-side only.
 */

import { GitHubRepository, GitHubBranch, GitCommit, GitSyncStatus } from '../types/github';
import { AuthService } from './authService';

function apiHeaders(): HeadersInit {
  return AuthService.authHeaders();
}

export class GitHubService {
  // ── Initiate OAuth flow ────────────────────────────────────────────────

  /**
   * Gets the GitHub OAuth authorization URL from the backend,
   * then opens a popup for the user to authorize.
   * The server handles token exchange and stores the encrypted token.
   */
  public static async connectOAuth(): Promise<void> {
    const res = await fetch('/api/github/auth', { headers: apiHeaders() });
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error?.message || 'Failed to initiate GitHub OAuth');
    }

    const authUrl: string = json.data.authUrl;

    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'github_oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Listen for success message posted from the callback page
    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (event.data === 'GITHUB_OAUTH_SUCCESS') {
          window.removeEventListener('message', handler);
          popup?.close();
          resolve();
        }
      };

      window.addEventListener('message', handler);

      // Timeout after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('GitHub OAuth timed out'));
      }, 5 * 60 * 1000);
    });
  }

  // ── Check connection status (derived from user profile) ───────────────

  public static isConnected(user: { gitHubConnected?: boolean } | null): boolean {
    return !!user?.gitHubConnected;
  }

  // ── List user's repos ─────────────────────────────────────────────────

  public static async getUserRepositories(): Promise<GitHubRepository[]> {
    const res = await fetch('/api/github/repos', { headers: apiHeaders() });
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error?.message || 'Failed to fetch repositories');
    }

    return json.data as GitHubRepository[];
  }

  // ── Import a repository as a project ─────────────────────────────────

  public static async importRepository(repoFullName: string, branch: string = 'main'): Promise<any> {
    const res = await fetch('/api/github/import', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ repoFullName, branch })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Failed to import repository');
    }
    return json.data;
  }

  // ── Get branches for a repo ───────────────────────────────────────────

  public static async getBranches(repoFullName: string): Promise<GitHubBranch[]> {
    const encoded = encodeURIComponent(repoFullName);
    const res = await fetch(`/api/github/repos/${encoded}/branches`, { headers: apiHeaders() });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Failed to fetch branches');
    }
    return json.data as GitHubBranch[];
  }

  // ── Commit & push ─────────────────────────────────────────────────────

  public static async pushChanges(
    projectId: string,
    commitMessage: string,
    _files: import('../types').ProjectFile[]
  ): Promise<{ success: boolean; commitSha: string }> {
    const res = await fetch(`/api/github/projects/${projectId}/push`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ commitMessage })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Push failed');
    }
    return json.data;
  }

  // ── Pull ──────────────────────────────────────────────────────────────

  public static async pullChanges(
    projectId: string
  ): Promise<{ success: boolean; filesUpdated: number }> {
    const res = await fetch(`/api/github/projects/${projectId}/pull`, {
      method: 'POST',
      headers: apiHeaders()
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Pull failed');
    }
    return json.data;
  }

  // ── Sync status ───────────────────────────────────────────────────────

  public static async getSyncStatus(projectId: string, currentBranch: string): Promise<GitSyncStatus> {
    const res = await fetch(
      `/api/github/projects/${projectId}/status?branch=${encodeURIComponent(currentBranch)}`,
      { headers: apiHeaders() }
    );
    const json = await res.json();
    if (!json.success) {
      // Return a safe default instead of throwing
      return {
        hasUncommittedChanges: false,
        aheadCount: 0,
        behindCount: 0,
        currentBranch: currentBranch || 'main',
        lastSyncedAt: new Date().toISOString()
      };
    }
    return json.data as GitSyncStatus;
  }

  // ── Commit history ────────────────────────────────────────────────────

  public static async getCommitHistory(projectId: string): Promise<GitCommit[]> {
    const res = await fetch(`/api/github/projects/${projectId}/commits`, { headers: apiHeaders() });
    const json = await res.json();
    if (!json.success) return [];
    return json.data as GitCommit[];
  }
}
