/**
 * Sandboxed ZIP & Individual File Importer Service
 * Parses uploaded ZIP files safely using JSZip with strict path traversal checks.
 */

import JSZip from 'jszip';
import { ProjectFile } from '../types';
import { FileService } from './fileService';

export class ZipService {
  /**
   * Extracts uploaded ZIP archive into sanitized project file structure
   */
  public static async extractZipArchive(file: File): Promise<{ files: ProjectFile[]; detectedTemplate: 'HTML_CSS_JS' | 'React' | 'Vite' }> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const extractedFiles: ProjectFile[] = [];

    let hasPackageJson = false;
    let hasViteConfig = false;
    let hasAppJsx = false;

    const entries = Object.keys(contents.files);

    for (const relativePath of entries) {
      const zipEntry = contents.files[relativePath];

      // Ignore directories or hidden system files like __MACOSX / .DS_Store
      if (zipEntry.dir || relativePath.includes('__MACOSX') || relativePath.startsWith('.')) {
        continue;
      }

      // Path traversal security verification
      const safePath = FileService.sanitizePath(relativePath);
      const name = safePath.split('/').pop() || 'file';

      if (name === 'package.json') hasPackageJson = true;
      if (name.includes('vite.config')) hasViteConfig = true;
      if (name === 'App.jsx' || name === 'App.tsx') hasAppJsx = true;

      const text = await zipEntry.async('string');
      extractedFiles.push({
        id: `file_${Math.random().toString(36).substr(2, 9)}`,
        name,
        path: safePath,
        content: text,
        isFolder: false,
        updatedAt: new Date().toISOString(),
        language: FileService.detectLanguage(name)
      });
    }

    // Template detection rule engine
    let detectedTemplate: 'HTML_CSS_JS' | 'React' | 'Vite' = 'HTML_CSS_JS';
    if (hasViteConfig) {
      detectedTemplate = 'Vite';
    } else if (hasPackageJson || hasAppJsx) {
      detectedTemplate = 'React';
    }

    return { files: extractedFiles, detectedTemplate };
  }
}
