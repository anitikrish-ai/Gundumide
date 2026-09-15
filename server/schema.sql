-- =========================================================
-- GundamDev Production Database Schema
-- PostgreSQL / Supabase
-- Multi-User Relational Architecture
-- Strict Project Ownership
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    github_token_encrypted TEXT,
    github_username TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template TEXT NOT NULL
        CHECK (template IN ('HTML_CSS_JS', 'React', 'Vite')),
    status TEXT NOT NULL DEFAULT 'Saved'
        CHECK (
            status IN (
                'Saved',
                'Running',
                'GitHub Synced',
                'Deployment Live',
                'Build Failed'
            )
        ),
    git_repo_url TEXT,
    git_branch TEXT NOT NULL DEFAULT 'main',
    deployment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    is_folder BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (project_id, user_id)
        REFERENCES projects(id, user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (project_id, path)
);

CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'DEV'
        CHECK (environment IN ('DEV', 'PROD')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (project_id, user_id)
        REFERENCES projects(id, user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (project_id, key, environment)
);

CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL
        CHECK (provider IN ('netlify', 'cloudflare')),
    status TEXT NOT NULL
        CHECK (
            status IN (
                'QUEUED',
                'BUILDING',
                'DEPLOYING',
                'READY',
                'ERROR'
            )
        ),
    url TEXT,
    admin_url TEXT,
    build_command TEXT,
    logs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (project_id, user_id)
        REFERENCES projects(id, user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    job_type TEXT NOT NULL
        CHECK (
            job_type IN (
                'BUILD',
                'RUN',
                'GIT_PULL',
                'GIT_PUSH'
            )
        ),
    status TEXT NOT NULL
        CHECK (
            status IN (
                'PENDING',
                'RUNNING',
                'SUCCESS',
                'FAILED'
            )
        ),
    exit_code INTEGER,
    logs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    FOREIGN KEY (project_id, user_id)
        REFERENCES projects(id, user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================================
-- Performance Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id
    ON projects(user_id);

CREATE INDEX IF NOT EXISTS idx_files_project_user
    ON files(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_files_user_id
    ON files(user_id);

CREATE INDEX IF NOT EXISTS idx_secrets_project_user
    ON secrets(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_deployments_project_user
    ON deployments(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_workspace_jobs_project_user
    ON workspace_jobs(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON sessions(expires_at);
