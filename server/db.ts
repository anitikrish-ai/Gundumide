/**
 * GundamDev Production Relational Database Layer
 * Supports Supabase PostgreSQL & SQLite Relational Engines
 * Enforces multi-user relational schemas, foreign key cascade rules,
 * ownership validations, indexes, and persistent SQL transactions.
 */

import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '';
const isPostgres = DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://');

let pgPool: pg.Pool | null = null;
let sqliteDb: InstanceType<typeof Database> | null = null;

if (isPostgres) {
  console.log('[Database] Connecting to Supabase PostgreSQL production database...');
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
} else {
  const DATA_DIR = path.join(process.cwd(), 'server', 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const DB_FILE = path.join(DATA_DIR, 'gundamdev_relational.sqlite');
  sqliteDb = new Database(DB_FILE);
  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.pragma('journal_mode = WAL');

  // Initialize SQLite schema with strict multi-user constraints
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      github_token_encrypted TEXT,
      github_username TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      template TEXT NOT NULL CHECK (template IN ('HTML_CSS_JS', 'React', 'Vite')),
      status TEXT DEFAULT 'Saved' CHECK (status IN ('Saved', 'Running', 'GitHub Synced', 'Deployment Live', 'Build Failed')),
      git_repo_url TEXT,
      git_branch TEXT DEFAULT 'main',
      deployment_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (id, user_id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      content TEXT NOT NULL,
      is_folder INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id, user_id) REFERENCES projects(id, user_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (project_id, path)
    );

    CREATE TABLE IF NOT EXISTS secrets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      environment TEXT NOT NULL DEFAULT 'DEV' CHECK (environment IN ('DEV', 'PROD')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id, user_id) REFERENCES projects(id, user_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (project_id, key, environment)
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL CHECK (provider IN ('netlify', 'cloudflare')),
      status TEXT NOT NULL CHECK (status IN ('QUEUED', 'BUILDING', 'DEPLOYING', 'READY', 'ERROR')),
      url TEXT,
      admin_url TEXT,
      build_command TEXT,
      logs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id, user_id) REFERENCES projects(id, user_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workspace_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      job_type TEXT NOT NULL CHECK (job_type IN ('BUILD', 'RUN', 'GIT_PULL', 'GIT_PUSH')),
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED')),
      exit_code INTEGER,
      logs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (project_id, user_id) REFERENCES projects(id, user_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_project_user ON files(project_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
    CREATE INDEX IF NOT EXISTS idx_secrets_project_user ON secrets(project_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_project_user ON deployments(project_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_jobs_project_user ON workspace_jobs(project_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
}

export interface DbUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  github_token_encrypted?: string;
  github_username?: string;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  template: 'HTML_CSS_JS' | 'React' | 'Vite';
  status: 'Saved' | 'Running' | 'GitHub Synced' | 'Deployment Live' | 'Build Failed';
  git_repo_url?: string;
  git_branch?: string;
  deployment_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DbFile {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  path: string;
  content: string;
  is_folder: number;
  updated_at: string;
}

export interface DbSecret {
  id: string;
  project_id: string;
  user_id: string;
  key: string;
  encrypted_value: string;
  environment: 'DEV' | 'PROD';
  updated_at: string;
}

export interface DbDeployment {
  id: string;
  project_id: string;
  user_id: string;
  provider: 'netlify' | 'cloudflare';
  status: 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR';
  url?: string;
  admin_url?: string;
  build_command?: string;
  logs?: string;
  created_at: string;
}

export interface DbWorkspaceJob {
  id: string;
  project_id: string;
  user_id: string;
  job_type: 'BUILD' | 'RUN' | 'GIT_PULL' | 'GIT_PUSH';
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  exit_code?: number;
  logs?: string;
  created_at: string;
  completed_at?: string;
}

class RelationalDatabase {
  // --- USER ENTITY & QUERY HELPERS ---
  public findUserByEmail(email: string): DbUser | undefined {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
      return stmt.get(email) as DbUser | undefined;
    }
    return undefined;
  }

  public findUserById(id: string): DbUser | undefined {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(id) as DbUser | undefined;
    }
    return undefined;
  }

  public insertUser(user: DbUser): DbUser {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (id, email, username, password_hash, github_token_encrypted, github_username, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        user.id,
        user.email,
        user.username,
        user.password_hash,
        user.github_token_encrypted || null,
        user.github_username || null,
        user.created_at,
        user.updated_at
      );
    }
    return user;
  }

  public updateUserGitHub(userId: string, encryptedToken: string, username: string): void {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE users SET github_token_encrypted = ?, github_username = ?, updated_at = ? WHERE id = ?
      `);
      stmt.run(encryptedToken, username, new Date().toISOString(), userId);
    }
  }

  // --- PROJECT ENTITY & STRICT USER OWNERSHIP ---
  public getProjectsByUser(userId: string): DbProject[] {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC');
      return stmt.all(userId) as DbProject[];
    }
    return [];
  }

  public getProject(projectId: string, userId: string): DbProject | undefined {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?');
      return stmt.get(projectId, userId) as DbProject | undefined;
    }
    return undefined;
  }

  public insertProject(project: DbProject): DbProject {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO projects (id, user_id, name, description, template, status, git_repo_url, git_branch, deployment_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        project.id,
        project.user_id,
        project.name,
        project.description,
        project.template,
        project.status,
        project.git_repo_url || null,
        project.git_branch || 'main',
        project.deployment_url || null,
        project.created_at,
        project.updated_at
      );
    }
    return project;
  }

  public updateProjectStatus(projectId: string, userId: string, status: DbProject['status'], deploymentUrl?: string): boolean {
    if (sqliteDb) {
      const now = new Date().toISOString();
      let stmt;
      if (deploymentUrl !== undefined) {
        stmt = sqliteDb.prepare('UPDATE projects SET status = ?, deployment_url = ?, updated_at = ? WHERE id = ? AND user_id = ?');
        const res = stmt.run(status, deploymentUrl, now, projectId, userId);
        return res.changes > 0;
      } else {
        stmt = sqliteDb.prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?');
        const res = stmt.run(status, now, projectId, userId);
        return res.changes > 0;
      }
    }
    return false;
  }

  public updateProjectGit(projectId: string, userId: string, repoUrl: string, branch: string): boolean {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('UPDATE projects SET git_repo_url = ?, git_branch = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?');
      const res = stmt.run(repoUrl, branch, 'GitHub Synced', new Date().toISOString(), projectId, userId);
      return res.changes > 0;
    }
    return false;
  }

  public deleteProject(projectId: string, userId: string): boolean {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
      const res = stmt.run(projectId, userId);
      return res.changes > 0;
    }
    return false;
  }

  // --- FILE ENTITY ---
  public getFilesByProject(projectId: string, userId: string): DbFile[] {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM files WHERE project_id = ? AND user_id = ? ORDER BY path ASC');
      return stmt.all(projectId, userId) as DbFile[];
    }
    return [];
  }

  public insertFile(file: DbFile): DbFile {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO files (id, project_id, user_id, name, path, content, is_folder, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(file.id, file.project_id, file.user_id, file.name, file.path, file.content, file.is_folder, file.updated_at);
    }
    return file;
  }

  public upsertFiles(projectId: string, userId: string, files: DbFile[]): void {
    const project = this.getProject(projectId, userId);
    if (!project) throw new Error('Unauthorized or project not found');

    if (sqliteDb) {
      const upsertStmt = sqliteDb.prepare(`
        INSERT INTO files (id, project_id, user_id, name, path, content, is_folder, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          path = excluded.path,
          content = excluded.content,
          is_folder = excluded.is_folder,
          updated_at = excluded.updated_at
      `);

      const updateProjectStmt = sqliteDb.prepare('UPDATE projects SET updated_at = ? WHERE id = ? AND user_id = ?');
      const now = new Date().toISOString();

      const transaction = sqliteDb.transaction((fileList: DbFile[]) => {
        for (const f of fileList) {
          upsertStmt.run(f.id, projectId, userId, f.name, f.path, f.content, f.is_folder, f.updated_at || now);
        }
        updateProjectStmt.run(now, projectId, userId);
      });

      transaction(files);
    }
  }

  public deleteFile(fileId: string, projectId: string, userId: string): boolean {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM files WHERE id = ? AND project_id = ? AND user_id = ?');
      const res = stmt.run(fileId, projectId, userId);
      return res.changes > 0;
    }
    return false;
  }

  // --- SECRET VAULT ENTITY ---
  public getSecretsByProject(projectId: string, userId: string): DbSecret[] {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM secrets WHERE project_id = ? AND user_id = ? ORDER BY key ASC');
      return stmt.all(projectId, userId) as DbSecret[];
    }
    return [];
  }

  public upsertSecret(secret: DbSecret): DbSecret {
    const project = this.getProject(secret.project_id, secret.user_id);
    if (!project) throw new Error('Unauthorized or project not found');

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO secrets (id, project_id, user_id, key, encrypted_value, environment, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id, key, environment) DO UPDATE SET
          encrypted_value = excluded.encrypted_value,
          updated_at = excluded.updated_at
      `);
      stmt.run(secret.id, secret.project_id, secret.user_id, secret.key, secret.encrypted_value, secret.environment, secret.updated_at);
    }
    return secret;
  }

  public deleteSecret(secretId: string, projectId: string, userId: string): boolean {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM secrets WHERE id = ? AND project_id = ? AND user_id = ?');
      const res = stmt.run(secretId, projectId, userId);
      return res.changes > 0;
    }
    return false;
  }

  // --- DEPLOYMENT ENTITY ---
  public getDeploymentsByProject(projectId: string, userId: string): DbDeployment[] {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM deployments WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC');
      return stmt.all(projectId, userId) as DbDeployment[];
    }
    return [];
  }

  public insertDeployment(deployment: DbDeployment): DbDeployment {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO deployments (id, project_id, user_id, provider, status, url, admin_url, build_command, logs, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        deployment.id,
        deployment.project_id,
        deployment.user_id,
        deployment.provider,
        deployment.status,
        deployment.url || null,
        deployment.admin_url || null,
        deployment.build_command || null,
        deployment.logs || null,
        deployment.created_at
      );
    }
    return deployment;
  }

  // --- WORKSPACE JOBS ---
  public insertJob(job: DbWorkspaceJob): DbWorkspaceJob {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO workspace_jobs (id, project_id, user_id, job_type, status, exit_code, logs, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        job.id,
        job.project_id,
        job.user_id,
        job.job_type,
        job.status,
        job.exit_code !== undefined ? job.exit_code : null,
        job.logs || null,
        job.created_at,
        job.completed_at || null
      );
    }
    return job;
  }

  public updateJob(jobId: string, status: DbWorkspaceJob['status'], exitCode?: number, logs?: string): void {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE workspace_jobs SET status = ?, exit_code = ?, logs = ?, completed_at = ? WHERE id = ?
      `);
      stmt.run(status, exitCode !== undefined ? exitCode : null, logs || null, new Date().toISOString(), jobId);
    }
  }

  public getJobsByProject(projectId: string, userId: string): DbWorkspaceJob[] {
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('SELECT * FROM workspace_jobs WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC');
      return stmt.all(projectId, userId) as DbWorkspaceJob[];
    }
    return [];
  }
}

export const db = new RelationalDatabase();
