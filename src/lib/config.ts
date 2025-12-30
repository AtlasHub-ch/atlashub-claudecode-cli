import { join } from 'path';
import fs from 'fs-extra';
import { ProjectConfig, ProjectConfigSchema } from '../types/config.js';

const CONFIG_PATH = '.claude/gitflow/config.json';

/**
 * Load project configuration
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<ProjectConfig> {
  const configPath = join(cwd, CONFIG_PATH);

  if (await fs.pathExists(configPath)) {
    const data = await fs.readJson(configPath);
    return ProjectConfigSchema.parse(data);
  }

  return ProjectConfigSchema.parse({});
}

/**
 * Save project configuration
 */
export async function saveConfig(
  config: Partial<ProjectConfig>,
  cwd: string = process.cwd()
): Promise<void> {
  const configPath = join(cwd, CONFIG_PATH);
  const existing = await loadConfig(cwd);
  const merged = ProjectConfigSchema.parse({ ...existing, ...config });

  await fs.ensureDir(join(cwd, '.claude', 'gitflow'));
  await fs.writeJson(configPath, merged, { spaces: 2 });
}
