import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { logger } from './logger.js';
import { ProjectConfig, ProjectConfigSchema } from '../types/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS = ['gf-plan', 'gf-exec', 'gf-status', 'gf-abort'];
const PACKAGE_ROOT = join(__dirname, '..', '..');

export interface InstallOptions {
  force?: boolean;
  skipConfig?: boolean;
}

export interface UninstallOptions {
  keepPlans?: boolean;
  keepConfig?: boolean;
}

/**
 * Install GitFlow commands to the current project
 */
export async function installCommands(options: InstallOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const commandsDir = join(cwd, '.claude', 'commands');
  const gitflowDir = join(cwd, '.claude', 'gitflow', 'plans');
  const sourceDir = join(PACKAGE_ROOT, 'templates', 'commands');

  // Check existing installation
  if (await fs.pathExists(commandsDir)) {
    const existingCommands = await fs.readdir(commandsDir);
    const hasGitflowCommands = existingCommands.some((f) => f.startsWith('gf-'));

    if (hasGitflowCommands && !options.force) {
      throw new Error(
        'GitFlow commands already installed. Use --force to overwrite.'
      );
    }
  }

  // Create directories
  await fs.ensureDir(commandsDir);
  await fs.ensureDir(gitflowDir);

  // Copy command templates
  for (const cmd of COMMANDS) {
    const src = join(sourceDir, `${cmd}.md`);
    const dest = join(commandsDir, `${cmd}.md`);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: options.force });
      logger.success(`Installed ${cmd}.md`);
    } else {
      logger.warning(`Template not found: ${cmd}.md`);
    }
  }

  // Copy default config if requested
  if (!options.skipConfig) {
    const configDest = join(cwd, '.claude', 'gitflow', 'config.json');

    if (!(await fs.pathExists(configDest))) {
      const defaultConfig: ProjectConfig = ProjectConfigSchema.parse({});
      await fs.writeJson(configDest, defaultConfig, { spaces: 2 });
      logger.success('Created config.json');
    }
  }

  // Copy templates directory
  const templatesSrc = join(PACKAGE_ROOT, 'templates', 'plans');
  const templatesDest = join(cwd, '.claude', 'gitflow', 'templates');

  if ((await fs.pathExists(templatesSrc)) && !(await fs.pathExists(templatesDest))) {
    await fs.copy(templatesSrc, templatesDest);
    logger.success('Copied plan templates');
  }
}

/**
 * Uninstall GitFlow commands
 */
export async function uninstallCommands(options: UninstallOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const commandsDir = join(cwd, '.claude', 'commands');

  // Remove command files
  for (const cmd of COMMANDS) {
    const file = join(commandsDir, `${cmd}.md`);
    if (await fs.pathExists(file)) {
      await fs.remove(file);
      logger.success(`Removed ${cmd}.md`);
    }
  }

  // Remove gitflow directory if requested
  if (!options.keepPlans && !options.keepConfig) {
    const gitflowDir = join(cwd, '.claude', 'gitflow');
    if (await fs.pathExists(gitflowDir)) {
      await fs.remove(gitflowDir);
      logger.success('Removed gitflow directory');
    }
  }
}

/**
 * Update commands to latest version
 */
export async function updateCommands(): Promise<void> {
  await installCommands({ force: true, skipConfig: true });
}

/**
 * Check installation status
 */
export async function checkInstallation(): Promise<{
  installed: boolean;
  commands: { name: string; installed: boolean }[];
  configExists: boolean;
  plansCount: number;
}> {
  const cwd = process.cwd();
  const commandsDir = join(cwd, '.claude', 'commands');
  const configPath = join(cwd, '.claude', 'gitflow', 'config.json');
  const plansDir = join(cwd, '.claude', 'gitflow', 'plans');

  const commands = await Promise.all(
    COMMANDS.map(async (cmd) => ({
      name: cmd,
      installed: await fs.pathExists(join(commandsDir, `${cmd}.md`)),
    }))
  );

  const configExists = await fs.pathExists(configPath);

  let plansCount = 0;
  if (await fs.pathExists(plansDir)) {
    const files = await fs.readdir(plansDir);
    plansCount = files.filter((f) => f.endsWith('.md')).length;
  }

  const installed = commands.some((c) => c.installed);

  return { installed, commands, configExists, plansCount };
}
