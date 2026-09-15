/**
 * Virtual File System & Path Sanitizer Security Service
 * Strict path traversal protection, null-byte stripping, and syntax engine.
 */

import { ProjectFile } from '../types';

export class FileService {
  /**
   * Sanitizes relative path to prevent path traversal vulnerabilities (e.g. `../../etc/passwd`, `%2e%2e/`, `\0`)
   */
  public static sanitizePath(rawPath: string): string {
    if (!rawPath) return '/untitled';

    // Decode URI components safely & remove null bytes
    let clean = decodeURIComponent(rawPath).replace(/\0/g, '');
    clean = clean.replace(/\\/g, '/').replace(/\/\//g, '/');

    const segments = clean.split('/').filter(p => p !== '' && p !== '.');
    const safeSegments: string[] = [];

    for (const segment of segments) {
      if (segment === '..') {
        if (safeSegments.length > 0) safeSegments.pop();
      } else {
        // Strip illegal path characters
        const safeName = segment.replace(/[^a-zA-Z0-9_.-]/g, '_');
        if (safeName) safeSegments.push(safeName);
      }
    }

    return '/' + (safeSegments.length > 0 ? safeSegments.join('/') : 'untitled');
  }

  /**
   * Automatically detects file extension language for syntax highlighting
   */
  public static detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
      case 'htm': return 'html';
      case 'css': return 'css';
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'svg': return 'xml';
      default: return 'plaintext';
    }
  }

  /**
   * Flatten tree structure into flat array of files
   */
  public static flattenFiles(files: ProjectFile[]): ProjectFile[] {
    const result: ProjectFile[] = [];
    const traverse = (items: ProjectFile[]) => {
      for (const file of items) {
        if (!file.isFolder) {
          result.push(file);
        }
        if (file.children && file.children.length > 0) {
          traverse(file.children);
        }
      }
    };
    traverse(files);
    return result;
  }
}
