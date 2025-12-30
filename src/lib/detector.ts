import { join } from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

export interface ProjectInfo {
  isGitRepo: boolean;
  currentBranch: string | null;
  hasDotNet: boolean;
  hasEfCore: boolean;
  csprojFiles: string[];
  dbContextName: string | null;
}

/**
 * Detect project information
 */
export async function detectProject(cwd: string = process.cwd()): Promise<ProjectInfo> {
  const info: ProjectInfo = {
    isGitRepo: false,
    currentBranch: null,
    hasDotNet: false,
    hasEfCore: false,
    csprojFiles: [],
    dbContextName: null,
  };

  // Check Git
  info.isGitRepo = await fs.pathExists(join(cwd, '.git'));

  if (info.isGitRepo) {
    try {
      info.currentBranch = execSync('git branch --show-current', {
        cwd,
        encoding: 'utf-8',
      }).trim();
    } catch {
      info.currentBranch = null;
    }
  }

  // Find .csproj files
  const files = await findFiles(cwd, '.csproj');
  info.csprojFiles = files;
  info.hasDotNet = files.length > 0;

  // Check for EF Core
  for (const csproj of files) {
    const content = await fs.readFile(csproj, 'utf-8');
    if (content.includes('Microsoft.EntityFrameworkCore')) {
      info.hasEfCore = true;

      // Try to find DbContext name
      const match = content.match(/Include="([^"]*DbContext[^"]*)"/);
      if (match) {
        info.dbContextName = match[1];
      }
      break;
    }
  }

  return info;
}

/**
 * Find files with specific extension
 */
async function findFiles(
  dir: string,
  extension: string,
  depth: number = 3
): Promise<string[]> {
  const results: string[] = [];

  async function search(currentDir: string, currentDepth: number) {
    if (currentDepth > depth) return;

    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await search(fullPath, currentDepth + 1);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await search(dir, 0);
  return results;
}
