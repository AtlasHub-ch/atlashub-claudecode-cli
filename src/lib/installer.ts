import { join, dirname } from 'path';
import { homedir } from 'os';
import fs from 'fs-extra';
import { logger } from './logger.js';

// __dirname is available in CommonJS
// When bundled by tsup, __dirname = /path/to/package/dist
// So we only go up ONE level to reach package root

const PACKAGE_ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(PACKAGE_ROOT, 'templates');

// Directories to install
const INSTALL_DIRS = ['commands', 'agents', 'hooks'];

export interface InstallOptions {
  force?: boolean;
  global?: boolean; // true = ~/.claude, false = ./.claude
  skipConfig?: boolean;
  components?: ('commands' | 'agents' | 'hooks' | 'all')[];
}

export interface UninstallOptions {
  global?: boolean;
  keepConfig?: boolean;
  components?: ('commands' | 'agents' | 'hooks' | 'all')[];
}

/**
 * Get the target .claude directory
 */
function getClaudeDir(global: boolean): string {
  if (global) {
    // User-level: ~/.claude or C:\Users\<user>\.claude
    return join(homedir(), '.claude');
  } else {
    // Project-level: ./.claude
    return join(process.cwd(), '.claude');
  }
}

/**
 * Get list of all files to install from a template directory
 */
async function getTemplateFiles(dir: string, baseDir: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = baseDir ? join(baseDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const subFiles = await getTemplateFiles(join(dir, entry.name), relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && !entry.name.startsWith('.')) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Install all templates to the target directory
 */
export async function installCommands(options: InstallOptions = {}): Promise<{
  installed: number;
  skipped: number;
  errors: string[];
}> {
  const global = options.global ?? true; // Default to global (user-level)
  const claudeDir = getClaudeDir(global);
  const components = options.components ?? ['all'];
  const installAll = components.includes('all');

  const result = {
    installed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  logger.info(`Installing to: ${claudeDir}`);

  // Determine which directories to install
  const dirsToInstall = installAll
    ? INSTALL_DIRS
    : INSTALL_DIRS.filter((d) => components.includes(d as any));

  for (const dir of dirsToInstall) {
    const sourceDir = join(TEMPLATES_DIR, dir);
    const targetDir = join(claudeDir, dir);

    if (!(await fs.pathExists(sourceDir))) {
      logger.warning(`Source directory not found: ${dir}`);
      continue;
    }

    // Get all files to install
    const files = await getTemplateFiles(sourceDir);

    for (const file of files) {
      const src = join(sourceDir, file);
      const dest = join(targetDir, file);

      try {
        // Check if file exists
        const exists = await fs.pathExists(dest);

        if (exists && !options.force) {
          result.skipped++;
          continue;
        }

        // Ensure parent directory exists
        await fs.ensureDir(dirname(dest));

        // Copy file
        await fs.copy(src, dest, { overwrite: options.force });
        result.installed++;

        // Log individual files only in verbose mode or for important ones
        if (file.endsWith('.md') && !file.includes('/')) {
          logger.success(`Installed ${dir}/${file}`);
        }
      } catch (error) {
        const msg = `Failed to install ${file}: ${error}`;
        result.errors.push(msg);
        logger.error(msg);
      }
    }

    // Log summary for this directory
    const dirFiles = files.length;
    logger.success(`Installed ${dir}/ (${dirFiles} files)`);
  }

  // Create gitflow structure if installing commands
  if (installAll || components.includes('commands')) {
    const gitflowDir = join(claudeDir, 'gitflow');
    await fs.ensureDir(join(gitflowDir, 'plans'));
    await fs.ensureDir(join(gitflowDir, 'logs'));
    await fs.ensureDir(join(gitflowDir, 'migrations'));

    // Copy default config
    if (!options.skipConfig) {
      const configSrc = join(PACKAGE_ROOT, 'config', 'default-config.json');
      const configDest = join(gitflowDir, 'config.json');

      if (!(await fs.pathExists(configDest)) || options.force) {
        if (await fs.pathExists(configSrc)) {
          await fs.copy(configSrc, configDest);
          logger.success('Created gitflow/config.json');
        }
      }
    }
  }

  return result;
}

/**
 * Uninstall templates from the target directory
 */
export async function uninstallCommands(options: UninstallOptions = {}): Promise<{
  removed: number;
  errors: string[];
}> {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const components = options.components ?? ['all'];
  const removeAll = components.includes('all');

  const result = {
    removed: 0,
    errors: [] as string[],
  };

  // Determine which directories to remove
  const dirsToRemove = removeAll
    ? INSTALL_DIRS
    : INSTALL_DIRS.filter((d) => components.includes(d as any));

  for (const dir of dirsToRemove) {
    const targetDir = join(claudeDir, dir);

    if (await fs.pathExists(targetDir)) {
      try {
        // For commands, only remove our files (gitflow/, apex/, etc.)
        if (dir === 'commands') {
          const ourDirs = ['gitflow', 'gitflow.md', 'apex', 'apex.md', 'ef-migrations', 'git', 'prompts', 'epct.md', 'debug.md', 'explore.md', 'explain.md', 'oneshot.md', 'quick-search.md', 'review.md'];

          for (const item of ourDirs) {
            const itemPath = join(targetDir, item);
            if (await fs.pathExists(itemPath)) {
              await fs.remove(itemPath);
              result.removed++;
            }
          }
          logger.success(`Removed commands (our files only)`);
        } else {
          // For agents and hooks, remove the whole directory
          await fs.remove(targetDir);
          result.removed++;
          logger.success(`Removed ${dir}/`);
        }
      } catch (error) {
        const msg = `Failed to remove ${dir}: ${error}`;
        result.errors.push(msg);
        logger.error(msg);
      }
    }
  }

  // Remove gitflow directory if not keeping config
  if (!options.keepConfig && (removeAll || components.includes('commands'))) {
    const gitflowDir = join(claudeDir, 'gitflow');
    if (await fs.pathExists(gitflowDir)) {
      await fs.remove(gitflowDir);
      logger.success('Removed gitflow/');
      result.removed++;
    }
  }

  return result;
}

/**
 * Update commands to latest version
 */
export async function updateCommands(options: { global?: boolean } = {}): Promise<void> {
  await installCommands({
    force: true,
    skipConfig: true,
    global: options.global ?? true,
  });
}

/**
 * Check installation status
 */
export async function checkInstallation(options: { global?: boolean } = {}): Promise<{
  location: string;
  installed: boolean;
  components: {
    commands: { installed: boolean; count: number };
    agents: { installed: boolean; count: number };
    hooks: { installed: boolean; count: number };
  };
  gitflow: {
    configExists: boolean;
    plansCount: number;
  };
}> {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);

  const result = {
    location: claudeDir,
    installed: false,
    components: {
      commands: { installed: false, count: 0 },
      agents: { installed: false, count: 0 },
      hooks: { installed: false, count: 0 },
    },
    gitflow: {
      configExists: false,
      plansCount: 0,
    },
  };

  // Check commands
  const commandsDir = join(claudeDir, 'commands');
  if (await fs.pathExists(commandsDir)) {
    const gitflowExists = await fs.pathExists(join(commandsDir, 'gitflow.md'));
    const apexExists = await fs.pathExists(join(commandsDir, 'apex.md'));
    result.components.commands.installed = gitflowExists || apexExists;

    // Count .md files
    const files = await getTemplateFiles(commandsDir);
    result.components.commands.count = files.filter((f) => f.endsWith('.md')).length;
  }

  // Check agents
  const agentsDir = join(claudeDir, 'agents');
  if (await fs.pathExists(agentsDir)) {
    const files = await fs.readdir(agentsDir);
    result.components.agents.count = files.filter((f) => f.endsWith('.md')).length;
    result.components.agents.installed = result.components.agents.count > 0;
  }

  // Check hooks
  const hooksDir = join(claudeDir, 'hooks');
  if (await fs.pathExists(hooksDir)) {
    result.components.hooks.installed = await fs.pathExists(join(hooksDir, 'hooks.json'));
    result.components.hooks.count = result.components.hooks.installed ? 1 : 0;
  }

  // Check gitflow
  const gitflowDir = join(claudeDir, 'gitflow');
  result.gitflow.configExists = await fs.pathExists(join(gitflowDir, 'config.json'));

  const plansDir = join(gitflowDir, 'plans');
  if (await fs.pathExists(plansDir)) {
    const plans = await fs.readdir(plansDir);
    result.gitflow.plansCount = plans.filter((f) => f.endsWith('.md')).length;
  }

  result.installed =
    result.components.commands.installed ||
    result.components.agents.installed ||
    result.components.hooks.installed;

  return result;
}

/**
 * List all installed commands
 */
export async function listInstalledCommands(options: { global?: boolean } = {}): Promise<string[]> {
  const global = options.global ?? true;
  const claudeDir = getClaudeDir(global);
  const commandsDir = join(claudeDir, 'commands');

  if (!(await fs.pathExists(commandsDir))) {
    return [];
  }

  const files = await getTemplateFiles(commandsDir);
  return files.filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''));
}
