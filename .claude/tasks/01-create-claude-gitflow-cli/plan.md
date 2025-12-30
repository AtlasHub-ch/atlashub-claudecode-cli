# Implementation Plan: @atlashub/claude-gitflow CLI

**Task Folder**: `.claude/tasks/01-create-claude-gitflow-cli/`
**Source Spec**: `.claude/task/claude-gitflow-cli-prompt.md`
**Date**: 2025-12-30

---

## Overview

Create a professional TypeScript CLI for GitFlow automation with license validation. The implementation follows the complete specification in `.claude/task/claude-gitflow-cli-prompt.md` which contains all source code.

**Approach**:
- Create files in dependency order (types → libs → commands → entry)
- Copy code from specification verbatim
- Verify build after each phase

**Total Files**: 22 files across 5 phases

---

## Dependencies

Files must be created in this order to satisfy TypeScript imports:

```
Phase 1: Configuration (no deps)
    ↓
Phase 2: Types (no deps)
    ↓
Phase 3: Libraries (depend on types)
    ↓
Phase 4: Commands (depend on libs)
    ↓
Phase 5: Entry Point (depend on commands)
    ↓
Phase 6: Templates & Docs (no deps)
```

---

## Phase 1: Project Configuration

### `package.json`
- Create npm package configuration
- Set name: `@atlashub/claude-gitflow`
- Set type: `module` for ESM
- Configure bin entries: `claude-gitflow` and `cgf`
- Set publishConfig for GitHub Packages registry
- Add all dependencies from spec (commander, chalk, ora, inquirer, fs-extra, node-fetch, zod, cli-table3)
- Add all devDependencies (typescript, tsup, eslint, prettier, types)
- Source: spec lines 94-172

### `tsconfig.json`
- Configure TypeScript for ES2022 target
- Set moduleResolution: bundler
- Enable strict mode with all checks
- Set rootDir: ./src, outDir: ./dist
- Enable declaration generation
- Source: spec lines 177-203

### `tsup.config.ts`
- Configure tsup bundler
- Set entry: src/index.ts
- Set format: ESM only
- Add shebang banner for CLI execution
- Target node18
- Source: spec lines 208-223

### `.npmrc`
- Configure @atlashub scope for GitHub Packages
- Set registry URL and auth token placeholder
- Source: spec lines 228-230

### `.eslintrc.js`
- Configure ESLint with TypeScript parser
- Add @typescript-eslint plugin and recommended rules
- Set environment: node, es2022
- Source: spec lines 235-256

### `.prettierrc`
- Configure Prettier formatting
- Set: semi, singleQuote, tabWidth: 2, trailingComma: es5
- Source: spec lines 261-268

### `.gitignore`
- Add node_modules, dist, logs, .env files
- Source: spec lines 273-280

---

## Phase 2: Type Definitions

### `src/types/license.ts`
- Create LicenseKeySchema with regex validation for CGFW-XXXX-XXXX-XXXX format
- Create LicensePlanSchema enum: trial, pro, team, enterprise
- Create LicenseResponseSchema for API responses
- Create StoredLicenseSchema for local storage
- Export all types using z.infer
- Source: spec lines 337-366

### `src/types/config.ts`
- Create GitConfigSchema with branches, remote, mergeStrategy, tagPrefix
- Create EfCoreConfigSchema with projectPath, contextName, migrationsFolder
- Create WorkflowConfigSchema with requireConfirmation, autoDeleteBranch, createCheckpoints
- Create ProjectConfigSchema combining all configs with defaults
- Export all types using z.infer
- Source: spec lines 371-409

---

## Phase 3: Library Modules

### `src/lib/logger.ts`
- Import chalk and ora
- Create logger object with methods:
  - info(): blue icon + message
  - success(): green checkmark + message
  - warning(): yellow icon + message
  - error(): red X + message
  - header(): cyan bordered title
  - step(): gray [n/total] + message
  - spinner(): ora spinner with cyan color
  - box(): bordered content with color by type
- Source: spec lines 414-459

### `src/lib/license.ts`
- Import crypto, os, fs-extra, node-fetch
- Import types from types/license.ts
- Define API_URL constant (env or https://api.atlashub.ch/api/licenses)
- Define LICENSE_FILE path (~/.claude-gitflow-license.json)
- Define SECRET_SALT constant
- Implement getMachineId(): Generate SHA-256 hash from hostname+username+platform
- Implement validateKeyFormat(): Validate regex + checksum verification
- Implement generateChecksum(): SHA-256 hash with salt, base64, extract 4 chars
- Implement validateLicenseOnline(): POST to API with licenseKey and machineId
- Implement saveLicense(): Write StoredLicense to JSON file
- Implement loadLicense(): Read and parse StoredLicense from file
- Implement deleteLicense(): Remove license file
- Implement checkLicense(): Full validation with 7-day grace period, machine check
- Source: spec lines 464-629

### `src/lib/config.ts`
- Import path, fs-extra
- Import ProjectConfigSchema from types/config.ts
- Define CONFIG_PATH constant (.claude/gitflow/config.json)
- Implement loadConfig(): Read and parse config, return defaults if missing
- Implement saveConfig(): Merge with existing config, write to file
- Source: spec lines 786-820

### `src/lib/detector.ts`
- Import path, fs-extra, child_process
- Define ProjectInfo interface (isGitRepo, currentBranch, hasDotNet, hasEfCore, csprojFiles, dbContextName)
- Implement detectProject():
  - Check .git directory exists
  - Get current branch via git command
  - Find .csproj files recursively (max depth 3)
  - Check for EF Core in .csproj content
  - Extract DbContext name if found
- Implement findFiles() helper: Recursive file search by extension
- Source: spec lines 825-917

### `src/lib/installer.ts`
- Import path, url, fs-extra
- Import logger from logger.ts
- Import ProjectConfigSchema from types/config.ts
- Define COMMANDS array: ['gf-plan', 'gf-exec', 'gf-status', 'gf-abort']
- Calculate PACKAGE_ROOT from __dirname
- Define InstallOptions interface (force, skipConfig)
- Define UninstallOptions interface (keepPlans, keepConfig)
- Implement installCommands():
  - Create .claude/commands and .claude/gitflow/plans directories
  - Check existing installation, error if exists without --force
  - Copy templates from package to project
  - Create default config.json if not skipped
- Implement uninstallCommands():
  - Remove gf-*.md files from commands directory
  - Optionally remove gitflow directory
- Implement updateCommands(): Call installCommands with force: true
- Implement checkInstallation(): Return installed status, commands list, config exists, plans count
- Source: spec lines 634-781

---

## Phase 4: CLI Commands

### `src/commands/index.ts`
- Export all commands from individual files
- Source: spec lines 1256-1261

### `src/commands/status.ts`
- Import Command from commander
- Import chalk, Table from cli-table3
- Import logger, license functions, installer functions, detector
- Create statusCommand:
  - Name: 'status', alias: 's'
  - Description: 'Show installation and license status'
  - Action:
    - Show header
    - Load and check license, display in table
    - Check installation, display commands table
    - Detect project, display project info table
- Source: spec lines 1140-1217

### `src/commands/activate.ts`
- Import Command, inquirer, chalk
- Import logger, license functions
- Create activateCommand:
  - Name: 'activate'
  - Argument: [key] optional
  - Option: --deactivate
  - Action:
    - If deactivate: delete license and return
    - If no key: prompt with inquirer
    - Validate format locally
    - Validate online with spinner
    - Save license if valid, show success box
    - Show error and purchase link if invalid
- Source: spec lines 1055-1135

### `src/commands/install.ts`
- Import Command, chalk
- Import logger, checkLicense, installCommands, detectProject
- Create installCommand:
  - Name: 'install', alias: 'i'
  - Options: --force, --no-config, --skip-license
  - Action:
    - Check license unless skipped
    - Detect project with spinner
    - Display project info (Git, .NET, EF Core)
    - Call installCommands with options
    - Show success box with available commands
- Source: spec lines 922-1001

### `src/commands/uninstall.ts`
- Import Command, inquirer
- Import logger, uninstallCommands
- Create uninstallCommand:
  - Name: 'uninstall', alias: 'u'
  - Options: --keep-plans, --keep-config, --yes
  - Action:
    - Prompt confirmation unless --yes
    - Call uninstallCommands with options
    - Show success message
- Source: spec lines 1006-1050

### `src/commands/update.ts`
- Import Command
- Import logger, updateCommands, checkInstallation
- Create updateCommand:
  - Name: 'update'
  - Action:
    - Check if installed
    - Call updateCommands with spinner
    - Show success or failure
- Source: spec lines 1223-1251

---

## Phase 5: CLI Entry Point

### `src/index.ts`
- Import Command from commander
- Import chalk
- Import all commands from commands/index.ts
- Import fs, url, path for package.json reading
- Calculate __dirname using fileURLToPath
- Read package.json for version
- Create program with commander:
  - Name: 'claude-gitflow'
  - Description with cyan color
  - Version from package.json
  - Register all commands with addCommand
  - Default action: Show banner and help
- Call program.parse()
- Source: spec lines 289-332

---

## Phase 6: Templates & Documentation

### `templates/commands/gf-plan.md`
- Create GitFlow plan generator template
- Include frontmatter with description
- Document analysis steps (branch detection, commits, migrations, files)
- Define action matrix by branch type
- Describe plan file structure
- Source: spec lines 1272-1323

### `templates/commands/gf-exec.md`
- Create plan executor template
- Document $ARGUMENTS for plan file path
- Define execution process (list, parse, verify, execute, log, rename)
- Document error handling with retry/skip/abort options
- Source: spec lines 1328-1354

### `templates/commands/gf-status.md`
- Create status display template
- List what to display (branch, sync status, migrations, plans, tags)
- Include git commands to execute
- Specify visual format with emojis
- Source: spec lines 1359-1387

### `templates/commands/gf-abort.md`
- Create abort template
- Define process (identify, detect ops, propose options, execute, mark)
- Include detection commands for rebase/merge/cherry-pick
- Include rollback commands
- Source: spec lines 1392-1425

### `config/default-config.json`
- Create default configuration JSON
- Include git settings (branches, remote, mergeStrategy, tagPrefix)
- Include efcore settings (enabled, projectPath, contextName, etc.)
- Include workflow settings (requireConfirmation, autoDeleteBranch, etc.)
- Source: spec lines 1434-1459

### `README.md`
- Create package documentation
- Include installation instructions for GitHub Packages
- Document CLI commands (install, uninstall, activate, status, update)
- Document Claude Code commands (/gf-plan, /gf-exec, /gf-status, /gf-abort)
- Include license information
- Source: spec lines 1464-1507

### `CHANGELOG.md`
- Create changelog with initial 1.0.0 release
- Document all initial features
- Source: spec lines 1525-1535

### `LICENSE`
- Create proprietary license file
- Include copyright and restrictions
- Source: spec lines 1512-1520

---

## Phase 7: Placeholder Directories

### `src/agents/.gitkeep`
- Create empty .gitkeep file for future agent implementations

### `src/hooks/.gitkeep`
- Create empty .gitkeep file for future hook implementations

### `src/utils/fs.ts`
- Create placeholder file (can be empty or with TODO comment)

### `src/utils/git.ts`
- Create placeholder file (can be empty or with TODO comment)

### `src/utils/crypto.ts`
- Create placeholder file (can be empty or with TODO comment)

---

## Testing Strategy

### Build Verification
1. Run `npm install` after Phase 1
2. Run `npm run build` after Phase 5
3. Verify no TypeScript errors

### Local Testing
1. Run `npm link` to create global symlink
2. Test: `claude-gitflow --help`
3. Test: `claude-gitflow status`
4. Test: `claude-gitflow install --skip-license`
5. Verify commands are copied to `.claude/commands/`

### Manual Verification Checklist
- [ ] CLI shows banner with version
- [ ] Help displays all commands
- [ ] Status shows license and installation info
- [ ] Install creates command files
- [ ] Uninstall removes command files
- [ ] Activate prompts for license key

---

## Rollout Considerations

### Pre-Publish Checklist
1. Verify all files are created
2. Build succeeds without errors
3. Local testing passes
4. README is accurate

### GitHub Packages Setup
1. Create repository at github.com/atlashub/claude-gitflow
2. Configure PAT with write:packages scope
3. Run `npm publish` for initial release

### Known Limitations
- License API (api.atlashub.ch) must be deployed separately
- EF Core detection requires .NET projects
- GitFlow commands require Git repository

---

## File Summary

| Phase | Files | Estimated Lines |
|-------|-------|-----------------|
| 1. Configuration | 7 | ~150 |
| 2. Types | 2 | ~80 |
| 3. Libraries | 5 | ~400 |
| 4. Commands | 6 | ~330 |
| 5. Entry Point | 1 | ~45 |
| 6. Templates & Docs | 8 | ~250 |
| 7. Placeholders | 5 | ~5 |
| **Total** | **34** | **~1260** |

---

## Next Steps

1. Run `/apex:5-tasks` to divide this plan into individual task files
2. Or run `/apex:3-execute` to implement directly

**Recommended**: Execute directly since all code is provided in the specification.
