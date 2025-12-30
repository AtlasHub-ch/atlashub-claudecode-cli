# Prompt pour Claude Code : Création de la CLI GitFlow

> Copie ce prompt dans Claude Code (via VS Code ou terminal) pour générer le projet complet.

---

## Instructions pour Claude Code

Je veux créer une CLI npm professionnelle en TypeScript pour automatiser GitFlow avec gestion des migrations EF Core. Le package sera distribué via GitHub Packages (npm privé) avec un système de clé de licence.

## Spécifications techniques

### Stack technologique

```json
{
  "language": "TypeScript",
  "runtime": "Node.js >= 18",
  "packageManager": "npm",
  "distribution": "GitHub Packages (privé)",
  "bundler": "tsup"
}
```

### Dépendances à installer

```bash
# Production
npm install commander inquirer chalk fs-extra node-fetch zod ora cli-table3

# Development
npm install -D typescript @types/node @types/inquirer @types/fs-extra tsup eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## Architecture du projet

Crée cette structure exacte :

```
claude-gitflow/
├── src/
│   ├── commands/
│   │   ├── install.ts
│   │   ├── uninstall.ts
│   │   ├── activate.ts
│   │   ├── status.ts
│   │   ├── update.ts
│   │   └── index.ts
│   ├── agents/
│   │   └── .gitkeep
│   ├── hooks/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── license.ts
│   │   ├── installer.ts
│   │   ├── detector.ts
│   │   ├── config.ts
│   │   └── logger.ts
│   ├── types/
│   │   ├── config.ts
│   │   └── license.ts
│   ├── utils/
│   │   ├── fs.ts
│   │   ├── git.ts
│   │   └── crypto.ts
│   └── index.ts
├── templates/
│   └── commands/
│       ├── gf-plan.md
│       ├── gf-exec.md
│       ├── gf-status.md
│       └── gf-abort.md
├── config/
│   └── default-config.json
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .eslintrc.js
├── .prettierrc
├── .npmrc
├── .gitignore
├── README.md
├── CHANGELOG.md
└── LICENSE
```

---

## Fichiers de configuration

### package.json

```json
{
  "name": "@atlashub/claude-gitflow",
  "version": "1.0.0",
  "description": "GitFlow automation commands for Claude Code with EF Core migration support",
  "author": {
    "name": "David Truninger",
    "email": "david@atlashub.ch",
    "url": "https://atlashub.ch"
  },
  "license": "UNLICENSED",
  "private": false,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "claude-gitflow": "./dist/index.js",
    "cgf": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates",
    "config"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/atlashub/claude-gitflow.git"
  },
  "keywords": [
    "claude",
    "claude-code",
    "gitflow",
    "efcore",
    "entity-framework",
    "migrations",
    "cli",
    "automation",
    "anthropic",
    "dotnet"
  ],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts",
    "prepublishOnly": "npm run build",
    "test": "node --test",
    "link": "npm run build && npm link"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "cli-table3": "^0.6.3",
    "commander": "^12.0.0",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.12",
    "node-fetch": "^3.3.2",
    "ora": "^8.0.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/inquirer": "^9.0.7",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

### .npmrc (pour GitHub Packages)

```
@atlashub:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### .gitignore

```
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
*.tgz
```

---

## Implémentation des fichiers source

### src/index.ts (Point d'entrée CLI)

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { activateCommand } from './commands/activate.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('claude-gitflow')
  .description(chalk.cyan('GitFlow automation commands for Claude Code'))
  .version(pkg.version, '-v, --version');

// Register commands
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(activateCommand);
program.addCommand(statusCommand);
program.addCommand(updateCommand);

// Default action (no command)
program.action(() => {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.bold('Claude GitFlow')} - v${pkg.version}                           ║
║   GitFlow automation for Claude Code                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));
  program.outputHelp();
});

program.parse();
```

### src/types/license.ts

```typescript
import { z } from 'zod';

export const LicenseKeySchema = z.string().regex(
  /^CGFW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  'Invalid license key format. Expected: CGFW-XXXX-XXXX-XXXX'
);

export const LicensePlanSchema = z.enum(['trial', 'pro', 'team', 'enterprise']);

export const LicenseResponseSchema = z.object({
  valid: z.boolean(),
  plan: LicensePlanSchema.optional(),
  expiresAt: z.string().optional(),
  features: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export const StoredLicenseSchema = z.object({
  key: z.string(),
  plan: LicensePlanSchema,
  expiresAt: z.string(),
  validatedAt: z.string(),
  machineId: z.string(),
});

export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type LicensePlan = z.infer<typeof LicensePlanSchema>;
export type LicenseResponse = z.infer<typeof LicenseResponseSchema>;
export type StoredLicense = z.infer<typeof StoredLicenseSchema>;
```

### src/types/config.ts

```typescript
import { z } from 'zod';

export const GitConfigSchema = z.object({
  branches: z.object({
    main: z.string().default('main'),
    develop: z.string().default('develop'),
  }),
  remote: z.string().default('origin'),
  mergeStrategy: z.string().default('--no-ff'),
  tagPrefix: z.string().default('v'),
});

export const EfCoreConfigSchema = z.object({
  enabled: z.boolean().default(true),
  projectPath: z.string().default('auto-detect'),
  contextName: z.string().default('ApplicationDbContext'),
  migrationsFolder: z.string().default('Migrations'),
  generateScript: z.boolean().default(true),
  scriptOutputPath: z.string().default('./scripts'),
});

export const WorkflowConfigSchema = z.object({
  requireConfirmation: z.boolean().default(true),
  autoDeleteBranch: z.boolean().default(false),
  createCheckpoints: z.boolean().default(true),
  verboseLogging: z.boolean().default(false),
});

export const ProjectConfigSchema = z.object({
  git: GitConfigSchema.default({}),
  efcore: EfCoreConfigSchema.default({}),
  workflow: WorkflowConfigSchema.default({}),
});

export type GitConfig = z.infer<typeof GitConfigSchema>;
export type EfCoreConfig = z.infer<typeof EfCoreConfigSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
```

### src/lib/logger.ts

```typescript
import chalk from 'chalk';
import ora, { Ora } from 'ora';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  
  header: (title: string) => {
    console.log();
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${title}`));
    console.log(chalk.cyan('═'.repeat(60)));
    console.log();
  },

  step: (current: number, total: number, message: string) => {
    console.log(chalk.gray(`[${current}/${total}]`), message);
  },

  spinner: (text: string): Ora => {
    return ora({ text, color: 'cyan' }).start();
  },

  box: (content: string[], type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
    };
    const color = colors[type];
    const maxLen = Math.max(...content.map((l) => l.length));
    const border = color('─'.repeat(maxLen + 4));

    console.log();
    console.log(border);
    content.forEach((line) => {
      console.log(color('│'), line.padEnd(maxLen), color('│'));
    });
    console.log(border);
    console.log();
  },
};
```

### src/lib/license.ts

```typescript
import { createHash } from 'crypto';
import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { hostname, userInfo, platform } from 'os';
import {
  LicenseKeySchema,
  LicenseResponse,
  LicenseResponseSchema,
  StoredLicense,
  StoredLicenseSchema,
} from '../types/license.js';
import { logger } from './logger.js';

const API_URL = process.env.LICENSE_API_URL || 'https://api.atlashub.ch/api/licenses';
const LICENSE_FILE = join(homedir(), '.claude-gitflow-license.json');
const SECRET_SALT = 'atlashub-cgf-2024';

/**
 * Generate a unique machine identifier
 */
export function getMachineId(): string {
  const data = `${hostname()}-${userInfo().username}-${platform()}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Validate license key format locally (checksum verification)
 */
export function validateKeyFormat(key: string): boolean {
  const result = LicenseKeySchema.safeParse(key);
  if (!result.success) return false;

  const parts = key.split('-');
  const expectedChecksum = generateChecksum(parts[1] + parts[2]);
  return parts[3] === expectedChecksum;
}

/**
 * Generate checksum for license key validation
 */
function generateChecksum(input: string): string {
  return createHash('sha256')
    .update(input + SECRET_SALT)
    .digest('base64')
    .replace(/[+/=]/g, '')
    .substring(0, 4)
    .toUpperCase();
}

/**
 * Validate license via API
 */
export async function validateLicenseOnline(licenseKey: string): Promise<LicenseResponse> {
  try {
    const response = await fetch(`${API_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId(),
      }),
    });

    const data = await response.json();
    return LicenseResponseSchema.parse(data);
  } catch (error) {
    return {
      valid: false,
      error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Save license to local file
 */
export async function saveLicense(
  key: string,
  plan: string,
  expiresAt: string
): Promise<void> {
  const license: StoredLicense = {
    key,
    plan: plan as StoredLicense['plan'],
    expiresAt,
    validatedAt: new Date().toISOString(),
    machineId: getMachineId(),
  };

  await fs.writeJson(LICENSE_FILE, license, { spaces: 2 });
}

/**
 * Load license from local file
 */
export async function loadLicense(): Promise<StoredLicense | null> {
  try {
    if (!(await fs.pathExists(LICENSE_FILE))) {
      return null;
    }

    const data = await fs.readJson(LICENSE_FILE);
    return StoredLicenseSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Delete local license
 */
export async function deleteLicense(): Promise<void> {
  if (await fs.pathExists(LICENSE_FILE)) {
    await fs.remove(LICENSE_FILE);
  }
}

/**
 * Check if license is valid (with local cache)
 */
export async function checkLicense(): Promise<{
  valid: boolean;
  plan?: string;
  error?: string;
  offline?: boolean;
}> {
  const local = await loadLicense();

  if (!local) {
    return { valid: false, error: 'No license found' };
  }

  // Check local expiration first
  if (new Date(local.expiresAt) < new Date()) {
    return { valid: false, error: 'License expired' };
  }

  // Check machine ID
  if (local.machineId !== getMachineId()) {
    return { valid: false, error: 'License registered to a different machine' };
  }

  // Re-validate online every 7 days
  const validatedAt = new Date(local.validatedAt);
  const daysSinceValidation = (Date.now() - validatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceValidation > 7) {
    try {
      const result = await validateLicenseOnline(local.key);
      if (result.valid && result.plan && result.expiresAt) {
        await saveLicense(local.key, result.plan, result.expiresAt);
        return { valid: true, plan: result.plan };
      }
      return { valid: false, error: result.error };
    } catch {
      // Offline: accept local license if not expired
      logger.warning('Could not validate online, using cached license');
      return { valid: true, plan: local.plan, offline: true };
    }
  }

  return { valid: true, plan: local.plan };
}
```

### src/lib/installer.ts

```typescript
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
```

### src/lib/config.ts

```typescript
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
```

### src/lib/detector.ts

```typescript
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

    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await search(fullPath, currentDepth + 1);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        results.push(fullPath);
      }
    }
  }

  await search(dir, 0);
  return results;
}
```

### src/commands/install.ts

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';
import { checkLicense } from '../lib/license.js';
import { installCommands } from '../lib/installer.js';
import { detectProject } from '../lib/detector.js';

export const installCommand = new Command('install')
  .alias('i')
  .description('Install GitFlow commands in the current project')
  .option('-f, --force', 'Overwrite existing commands')
  .option('--no-config', 'Skip config file creation')
  .option('--skip-license', 'Skip license check (for testing)')
  .action(async (options) => {
    logger.header('Installing Claude GitFlow Commands');

    // Check license (unless skipped)
    if (!options.skipLicense) {
      const license = await checkLicense();

      if (!license.valid) {
        logger.box(
          [
            'No valid license found.',
            '',
            'To activate your license:',
            `  ${chalk.cyan('claude-gitflow activate <YOUR-KEY>')}`,
            '',
            'To purchase a license:',
            `  ${chalk.cyan('https://atlashub.ch/claude-gitflow')}`,
          ],
          'warning'
        );
        return;
      }

      logger.success(`License valid (${license.plan})`);
    }

    // Detect project
    const spinner = logger.spinner('Detecting project...');
    const project = await detectProject();
    spinner.stop();

    console.log();
    logger.info(`Git repository: ${project.isGitRepo ? chalk.green('Yes') : chalk.yellow('No')}`);
    logger.info(`.NET project: ${project.hasDotNet ? chalk.green('Yes') : chalk.gray('No')}`);
    logger.info(`EF Core: ${project.hasEfCore ? chalk.green('Yes') : chalk.gray('No')}`);
    console.log();

    if (!project.isGitRepo) {
      logger.warning('Not a Git repository. GitFlow commands may not work correctly.');
    }

    // Install
    try {
      await installCommands({
        force: options.force,
        skipConfig: !options.config,
      });

      console.log();
      logger.box(
        [
          chalk.green.bold('Installation complete!'),
          '',
          'Available commands in Claude Code:',
          `  ${chalk.cyan('/gf-plan')}   - Generate integration plan`,
          `  ${chalk.cyan('/gf-exec')}   - Execute a plan`,
          `  ${chalk.cyan('/gf-status')} - Show GitFlow status`,
          `  ${chalk.cyan('/gf-abort')}  - Abort a plan`,
        ],
        'success'
      );
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Installation failed');
      process.exit(1);
    }
  });
```

### src/commands/uninstall.ts

```typescript
import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from '../lib/logger.js';
import { uninstallCommands } from '../lib/installer.js';

export const uninstallCommand = new Command('uninstall')
  .alias('u')
  .description('Remove GitFlow commands from the current project')
  .option('--keep-plans', 'Keep existing plans')
  .option('--keep-config', 'Keep configuration file')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    logger.header('Uninstalling Claude GitFlow Commands');

    // Confirm
    if (!options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to uninstall GitFlow commands?',
          default: false,
        },
      ]);

      if (!confirm) {
        logger.info('Cancelled.');
        return;
      }
    }

    try {
      await uninstallCommands({
        keepPlans: options.keepPlans,
        keepConfig: options.keepConfig,
      });

      console.log();
      logger.success('Uninstalled successfully.');
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Uninstallation failed');
      process.exit(1);
    }
  });
```

### src/commands/activate.ts

```typescript
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';
import {
  validateKeyFormat,
  validateLicenseOnline,
  saveLicense,
  deleteLicense,
} from '../lib/license.js';

export const activateCommand = new Command('activate')
  .description('Activate your license')
  .argument('[key]', 'License key (CGFW-XXXX-XXXX-XXXX)')
  .option('--deactivate', 'Remove current license')
  .action(async (key, options) => {
    logger.header('License Activation');

    // Deactivate
    if (options.deactivate) {
      await deleteLicense();
      logger.success('License deactivated.');
      return;
    }

    // Prompt for key if not provided
    if (!key) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'licenseKey',
          message: 'Enter your license key:',
          validate: (input) => {
            if (validateKeyFormat(input)) {
              return true;
            }
            return 'Invalid format. Expected: CGFW-XXXX-XXXX-XXXX';
          },
        },
      ]);
      key = answer.licenseKey;
    }

    // Validate format locally
    if (!validateKeyFormat(key)) {
      logger.error('Invalid license key format.');
      logger.info('Expected format: CGFW-XXXX-XXXX-XXXX');
      return;
    }

    // Validate online
    const spinner = logger.spinner('Validating license...');

    try {
      const result = await validateLicenseOnline(key);
      spinner.stop();

      if (result.valid && result.plan && result.expiresAt) {
        await saveLicense(key, result.plan, result.expiresAt);

        console.log();
        logger.box(
          [
            chalk.green.bold('License activated successfully!'),
            '',
            `Plan:    ${chalk.cyan(result.plan)}`,
            `Expires: ${chalk.cyan(new Date(result.expiresAt).toLocaleDateString())}`,
          ],
          'success'
        );
      } else {
        console.log();
        logger.error(result.error || 'License validation failed.');
        logger.info(`Purchase at: ${chalk.cyan('https://atlashub.ch/claude-gitflow')}`);
      }
    } catch (error) {
      spinner.stop();
      logger.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
```

### src/commands/status.ts

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../lib/logger.js';
import { checkLicense, loadLicense } from '../lib/license.js';
import { checkInstallation } from '../lib/installer.js';
import { detectProject } from '../lib/detector.js';

export const statusCommand = new Command('status')
  .alias('s')
  .description('Show installation and license status')
  .action(async () => {
    logger.header('Claude GitFlow Status');

    // License status
    const license = await loadLicense();
    const licenseCheck = await checkLicense();

    const licenseTable = new Table({
      head: [chalk.cyan('License')],
      style: { head: [], border: [] },
    });

    if (license && licenseCheck.valid) {
      licenseTable.push(
        [`Status: ${chalk.green('Active')}`],
        [`Plan: ${chalk.cyan(license.plan)}`],
        [`Expires: ${new Date(license.expiresAt).toLocaleDateString()}`],
        [`Machine: ${license.machineId.substring(0, 8)}...`]
      );
    } else {
      licenseTable.push(
        [`Status: ${chalk.yellow('Not activated')}`],
        [`Run: ${chalk.cyan('claude-gitflow activate')}`]
      );
    }

    console.log(licenseTable.toString());
    console.log();

    // Installation status
    const installation = await checkInstallation();

    const installTable = new Table({
      head: [chalk.cyan('Commands'), chalk.cyan('Status')],
      style: { head: [], border: [] },
    });

    for (const cmd of installation.commands) {
      const status = cmd.installed ? chalk.green('✓ Installed') : chalk.gray('Not installed');
      installTable.push([`/${cmd.name}`, status]);
    }

    console.log(installTable.toString());
    console.log();

    // Project info
    const project = await detectProject();

    const projectTable = new Table({
      head: [chalk.cyan('Project')],
      style: { head: [], border: [] },
    });

    projectTable.push(
      [`Git: ${project.isGitRepo ? chalk.green('Yes') : chalk.yellow('No')}`],
      [`Branch: ${project.currentBranch || chalk.gray('N/A')}`],
      [`.NET: ${project.hasDotNet ? chalk.green('Yes') : chalk.gray('No')}`],
      [`EF Core: ${project.hasEfCore ? chalk.green('Yes') : chalk.gray('No')}`]
    );

    if (installation.plansCount > 0) {
      projectTable.push([`Pending plans: ${chalk.yellow(installation.plansCount)}`]);
    }

    console.log(projectTable.toString());
  });
```

### src/commands/update.ts

```typescript
import { Command } from 'commander';
import { logger } from '../lib/logger.js';
import { updateCommands, checkInstallation } from '../lib/installer.js';

export const updateCommand = new Command('update')
  .description('Update commands to the latest version')
  .action(async () => {
    logger.header('Updating Claude GitFlow Commands');

    // Check if installed
    const installation = await checkInstallation();

    if (!installation.installed) {
      logger.warning('GitFlow commands are not installed.');
      logger.info('Run: claude-gitflow install');
      return;
    }

    const spinner = logger.spinner('Updating commands...');

    try {
      await updateCommands();
      spinner.succeed('Commands updated successfully!');
    } catch (error) {
      spinner.fail('Update failed');
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
```

### src/commands/index.ts

```typescript
export { installCommand } from './install.js';
export { uninstallCommand } from './uninstall.js';
export { activateCommand } from './activate.js';
export { statusCommand } from './status.js';
export { updateCommand } from './update.js';
```

---

## Templates des commandes Claude Code

Crée ces fichiers dans `templates/commands/` :

### templates/commands/gf-plan.md

```markdown
---
description: Génère un plan d'intégration GitFlow pour la branche courante
---

# GitFlow Plan Generator

Tu es un expert GitFlow et EF Core. Ta mission est de créer un plan d'intégration détaillé.

## Étape 1 : Analyse du contexte

Exécute ces commandes :

\`\`\`bash
# Branche courante et type
BRANCH=$(git branch --show-current)
TYPE=$(echo $BRANCH | grep -oE '^(feature|release|hotfix)' || echo "autre")

echo "Branche: $BRANCH"
echo "Type: $TYPE"

# Commits en avance/retard sur develop
git rev-list --left-right --count develop...HEAD 2>/dev/null || echo "0 0"

# Migrations EF Core
dotnet ef migrations list --no-build 2>/dev/null | tail -10

# Fichiers modifiés vs develop
git diff develop --name-only | head -20
\`\`\`

## Étape 2 : Déterminer les actions

| Type | Cible | Actions |
|------|-------|---------|
| feature | develop | Rebase + Merge --no-ff |
| release | main + develop | Tag + Double merge |
| hotfix | main + develop | Patch + Tag + Double merge |

## Étape 3 : Générer le plan

Crée le fichier `.claude/gitflow/plans/<type>-<nom>_<date>.md` avec :

1. Métadonnées (branche, commit initial, date)
2. Pré-requis à vérifier
3. Étapes numérotées avec commandes exactes
4. Checkpoints de validation
5. Procédure de rollback

## Étape 4 : Demander validation

Affiche un résumé et demande confirmation avant de sauvegarder.
```

### templates/commands/gf-exec.md

```markdown
---
description: Exécute un plan d'intégration GitFlow étape par étape
args: [fichier_plan]
---

# GitFlow Plan Executor

## Argument

`$ARGUMENTS` : Chemin vers le fichier plan (optionnel)

## Processus

1. Si pas d'argument, lister les plans dans `.claude/gitflow/plans/`
2. Charger et parser le plan sélectionné
3. Vérifier les pré-requis (branche correcte, pas de changements non commités)
4. Exécuter chaque étape avec confirmation
5. Logger les résultats dans le plan
6. Renommer le plan avec suffix `_DONE` à la fin

## Gestion des erreurs

Si une commande échoue :
- Afficher l'erreur clairement
- Proposer : Réessayer / Skip / Abort + Rollback
- Si rollback : exécuter les commandes de la section rollback du plan
```

### templates/commands/gf-status.md

```markdown
---
description: Affiche l'état GitFlow complet du repository
---

# GitFlow Status

Affiche :

1. **Branche courante** et son type (feature/release/hotfix/autre)
2. **Synchronisation** avec develop et main (commits ahead/behind)
3. **Migrations EF Core** pending
4. **Plans en attente** dans `.claude/gitflow/plans/`
5. **Dernier tag** de version

## Commandes à exécuter

\`\`\`bash
git branch --show-current
git rev-list --left-right --count develop...HEAD
git rev-list --left-right --count main...HEAD
git describe --tags --abbrev=0 main 2>/dev/null
dotnet ef migrations list --no-build 2>/dev/null
ls -la .claude/gitflow/plans/*.md 2>/dev/null | grep -v "_DONE"
\`\`\`

## Format d'affichage

Utilise un format visuel avec des emojis et une structure claire.
```

### templates/commands/gf-abort.md

```markdown
---
description: Annule un plan GitFlow en cours et propose un rollback
args: [fichier_plan]
---

# GitFlow Abort

## Processus

1. Identifier le plan à annuler
2. Détecter les opérations Git en cours (rebase, merge, cherry-pick)
3. Proposer les options :
   - Annuler l'opération en cours
   - Rollback au dernier checkpoint
   - Rollback complet à l'état initial
4. Exécuter l'action choisie
5. Marquer le plan comme `_ABORTED`

## Commandes de détection

\`\`\`bash
test -d .git/rebase-merge && echo "REBASE_IN_PROGRESS"
test -f .git/MERGE_HEAD && echo "MERGE_IN_PROGRESS"
test -f .git/CHERRY_PICK_HEAD && echo "CHERRY_PICK_IN_PROGRESS"
\`\`\`

## Commandes de rollback

\`\`\`bash
git rebase --abort 2>/dev/null
git merge --abort 2>/dev/null
git cherry-pick --abort 2>/dev/null
\`\`\`
```

---

## Fichiers supplémentaires

### config/default-config.json

```json
{
  "git": {
    "branches": {
      "main": "main",
      "develop": "develop"
    },
    "remote": "origin",
    "mergeStrategy": "--no-ff",
    "tagPrefix": "v"
  },
  "efcore": {
    "enabled": true,
    "projectPath": "auto-detect",
    "contextName": "ApplicationDbContext",
    "migrationsFolder": "Migrations",
    "generateScript": true,
    "scriptOutputPath": "./scripts"
  },
  "workflow": {
    "requireConfirmation": true,
    "autoDeleteBranch": false,
    "createCheckpoints": true,
    "verboseLogging": false
  }
}
```

### README.md

```markdown
# @atlashub/claude-gitflow

> GitFlow automation commands for Claude Code with EF Core migration support.

## Installation

\`\`\`bash
# Configure npm for GitHub Packages
npm config set @atlashub:registry https://npm.pkg.github.com

# Install globally
npm install -g @atlashub/claude-gitflow

# Activate your license
claude-gitflow activate CGFW-XXXX-XXXX-XXXX

# Install in your project
cd your-project
claude-gitflow install
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
| \`/gf-plan\` | Generate integration plan |
| \`/gf-exec\` | Execute a plan step by step |
| \`/gf-status\` | Show GitFlow status |
| \`/gf-abort\` | Abort a plan with rollback |

## CLI Commands

\`\`\`bash
claude-gitflow install     # Install commands in project
claude-gitflow uninstall   # Remove commands
claude-gitflow activate    # Activate license
claude-gitflow status      # Check status
claude-gitflow update      # Update commands
\`\`\`

## License

Proprietary - Requires valid license from [AtlasHub](https://atlashub.ch/claude-gitflow)
```

### LICENSE

```
PROPRIETARY LICENSE

Copyright (c) 2024 AtlasHub / David Truninger

This software is proprietary and requires a valid license for use.
Unauthorized copying, modification, or distribution is prohibited.

For licensing information, visit: https://atlashub.ch/claude-gitflow
```

### CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2024-12-30

### Added
- Initial release
- GitFlow commands: /gf-plan, /gf-exec, /gf-status, /gf-abort
- License validation system
- EF Core migration support
- Interactive CLI with colored output
```

---

## Instructions finales

Après avoir créé tous les fichiers :

1. **Initialiser le projet** :
   \`\`\`bash
   npm install
   \`\`\`

2. **Build** :
   \`\`\`bash
   npm run build
   \`\`\`

3. **Tester localement** :
   \`\`\`bash
   npm link
   claude-gitflow status
   \`\`\`

4. **Publier sur GitHub Packages** :
   \`\`\`bash
   npm publish
   \`\`\`

Crée tous ces fichiers maintenant.
