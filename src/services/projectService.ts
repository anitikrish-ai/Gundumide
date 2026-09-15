/**
 * Project Management Service
 * All persistence is done through the real backend API.
 * No localStorage for project/file data.
 */

import { Project, ProjectFile, ProjectTemplateType } from '../types';
import { AuthService } from './authService';

// ─── Template file generator (pure client logic, no persistence) ──────────

export function getTemplateFiles(template: ProjectTemplateType, name: string): ProjectFile[] {
  const formattedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (template === 'HTML_CSS_JS') {
    return [
      {
        id: 'f_html',
        name: 'index.html',
        path: '/index.html',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <h1>Welcome to ${name}</h1>
    <p>Mobile-first project powered by GundamDev.</p>
    <button id="btn" class="primary-btn">Click Me</button>
    <div id="output"></div>
  </main>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'f_css',
        name: 'style.css',
        path: '/style.css',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'css',
        content: `:root {
  --primary: #6366f1;
  --bg: #0f172a;
  --text: #f8fafc;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.container {
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.primary-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
}`
      },
      {
        id: 'f_js',
        name: 'script.js',
        path: '/script.js',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'javascript',
        content: `document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn');
  const output = document.getElementById('output');
  let count = 0;

  btn.addEventListener('click', () => {
    count++;
    output.innerHTML = \`<p style="margin-top:1rem;color:#10b981;">Button clicked \${count} times!</p>\`;
  });
});`
      }
    ];
  }

  if (template === 'React') {
    return [
      {
        id: 'f_pkg',
        name: 'package.json',
        path: '/package.json',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'json',
        content: `{
  "name": "${formattedName}",
  "private": true,
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`
      },
      {
        id: 'f_app',
        name: 'App.jsx',
        path: '/src/App.jsx',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'javascript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#f8fafc', background: '#090a0f', minHeight: '100vh' }}>
      <h1 style={{ color: '#6366f1' }}>⚡ GundamDev React Workspace</h1>
      <p style={{ color: '#94a3b8' }}>Edit src/App.jsx to see instant preview updates.</p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 'bold' }}
      >
        Count: {count}
      </button>
    </div>
  );
}`
      },
      {
        id: 'f_index',
        name: 'index.html',
        path: '/index.html',
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/App.jsx"></script>
</body>
</html>`
      }
    ];
  }

  // Vite template
  return [
    {
      id: 'f_vite_cfg',
      name: 'vite.config.js',
      path: '/vite.config.js',
      isFolder: false,
      updatedAt: new Date().toISOString(),
      language: 'javascript',
      content: `import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3000 }
});`
    },
    {
      id: 'f_main_ts',
      name: 'main.ts',
      path: '/src/main.ts',
      isFolder: false,
      updatedAt: new Date().toISOString(),
      language: 'typescript',
      content: `console.log("Vite environment initialized inside GundamDev!");
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = \`
  <div style="padding:2rem; text-align:center;">
    <h1 style="color:#3b82f6;">Fast Vite App</h1>
    <p style="color:#94a3b8;">Instant preview powered by GundamDev Remote Compute.</p>
  </div>
\`;`
    },
    {
      id: 'f_vite_html',
      name: 'index.html',
      path: '/index.html',
      isFolder: false,
      updatedAt: new Date().toISOString(),
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
</head>
<body style="background:#090a0f; color:#f8fafc; font-family:sans-serif;">
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`
    }
  ];
}

// ─── API-backed Project Service ────────────────────────────────────────────

function apiHeaders(): HeadersInit {
  return AuthService.authHeaders();
}

export class ProjectService {
  // ── Fetch all user's projects ──────────────────────────────────────────

  public static async getAllProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects', { headers: apiHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch projects');
    return (json.data as any[]).map(mapDbProject);
  }

  // ── Get single project with files ─────────────────────────────────────

  public static async getProjectById(id: string): Promise<Project | null> {
    const res = await fetch(`/api/projects/${id}`, { headers: apiHeaders() });
    if (res.status === 404) return null;
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch project');
    return mapDbProjectWithFiles(json.data);
  }

  // ── Create a new project ───────────────────────────────────────────────

  public static async createProject(
    name: string,
    description: string,
    template: ProjectTemplateType
  ): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ name, description, template })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to create project');

    const project = mapDbProject(json.data);

    const templateFiles = getTemplateFiles(template, name);
    await this.saveFiles(project.id, templateFiles);
    project.files = templateFiles;

    return project;
  }

  // ── Update project status ──────────────────────────────────────────────

  public static async updateProjectStatus(
    projectId: string,
    status: Project['status'],
    deploymentUrl?: string
  ): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify({ status, deploymentUrl })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to update project status');
  }

  // ── Delete a project ───────────────────────────────────────────────────

  public static async deleteProject(projectId: string): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: apiHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to delete project');
  }

  // ── Save files (batch upsert) ──────────────────────────────────────────

  public static async saveFiles(projectId: string, files: ProjectFile[]): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({ files: files.map(mapFileToDb) })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to save files');
  }

  // ── Convenience wrappers kept for WorkspaceContext compatibility ───────

  public static async updateProjectFiles(projectId: string, files: ProjectFile[]): Promise<void> {
    return this.saveFiles(projectId, files);
  }
}

// ─── Shape Mappers ──────────────────────────────────────────────────────────

function mapDbProject(p: any): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    template: p.template,
    status: p.status || 'Saved',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    isGitHubConnected: !!p.git_repo_url,
    gitRepoUrl: p.git_repo_url,
    gitBranch: p.git_branch,
    deploymentUrl: p.deployment_url,
    files: []
  };
}

function mapDbProjectWithFiles(p: any): Project {
  const proj = mapDbProject(p);
  if (p.files && Array.isArray(p.files)) {
    proj.files = p.files.map(mapDbFile);
  }
  return proj;
}

function mapDbFile(f: any): ProjectFile {
  const name = f.name || '';
  return {
    id: f.id,
    name,
    path: f.path || `/${name}`,
    content: f.content || '',
    isFolder: !!f.is_folder,
    updatedAt: f.updated_at || new Date().toISOString(),
    language: detectLanguage(name)
  };
}

function mapFileToDb(f: ProjectFile) {
  return {
    id: f.id,
    name: f.name,
    path: f.path,
    content: f.content,
    isFolder: f.isFolder
  };
}

function detectLanguage(name: string): string {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.md')) return 'markdown';
  return 'plaintext';
}
