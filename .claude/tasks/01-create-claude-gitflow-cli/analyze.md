# Task: Create @atlashub/claude-gitflow CLI

**Date**: 2025-12-30
**Status**: Analysis Complete
**Next Step**: Run `/apex:2-plan` to create implementation plan

---

## Executive Summary

This task involves creating a professional npm CLI tool called `@atlashub/claude-gitflow` that automates GitFlow workflows with EF Core migration support. The CLI will be distributed via GitHub Packages with a license key validation system.

### Key Deliverables
1. TypeScript CLI with Commander.js
2. GitFlow automation commands (gf-plan, gf-exec, gf-status, gf-abort)
3. License key validation system (online/offline)
4. GitHub Packages distribution

---

## Codebase Context

### Current State: NEW/EMPTY PROJECT

The project is a greenfield implementation with no existing source code.

**Existing Files:**
```
d:\atlashub-claudecode-cli-develop/
├── .git/                               (initialized repository)
├── .claude/
│   ├── task/
│   │   ├── claude-gitflow-cli-prompt.md   (1566 lines - full spec)
│   │   └── github-packages-guide.md        (476 lines - deployment guide)
│   └── tasks/
│       └── 01-create-claude-gitflow-cli/   (this analysis)
└── README.md                           (minimal)
```

### Source Specifications

Two comprehensive specification documents exist:

1. **[claude-gitflow-cli-prompt.md](.claude/task/claude-gitflow-cli-prompt.md)**: Complete implementation guide with:
   - Full project architecture
   - All TypeScript source code
   - Configuration templates
   - Command templates for Claude Code

2. **[github-packages-guide.md](.claude/task/github-packages-guide.md)**: Deployment guide with:
   - GitHub Packages setup
   - CI/CD workflow
   - License API (C# backend)
   - Key generation service

---

## Target Architecture

```
claude-gitflow/
├── src/
│   ├── commands/
│   │   ├── install.ts          # Install commands to project
│   │   ├── uninstall.ts        # Remove commands
│   │   ├── activate.ts         # License activation
│   │   ├── status.ts           # Show status
│   │   ├── update.ts           # Update commands
│   │   └── index.ts            # Export all commands
│   ├── lib/
│   │   ├── license.ts          # License validation (online/offline)
│   │   ├── installer.ts        # Command file management
│   │   ├── detector.ts         # Project detection (.NET, Git, EF Core)
│   │   ├── config.ts           # Configuration management
│   │   └── logger.ts           # Colored logging utilities
│   ├── types/
│   │   ├── config.ts           # Zod schemas for configuration
│   │   └── license.ts          # Zod schemas for license
│   ├── utils/
│   │   ├── fs.ts               # File system utilities
│   │   ├── git.ts              # Git operations
│   │   └── crypto.ts           # Cryptographic utilities
│   └── index.ts                # CLI entry point
├── templates/
│   └── commands/
│       ├── gf-plan.md          # GitFlow plan generation
│       ├── gf-exec.md          # Plan execution
│       ├── gf-status.md        # Status display
│       └── gf-abort.md         # Abort with rollback
├── config/
│   └── default-config.json     # Default configuration
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

## Technology Stack

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| commander | ^12.0.0 | CLI framework |
| inquirer | ^9.2.12 | Interactive prompts |
| chalk | ^5.3.0 | Terminal colors |
| ora | ^8.0.1 | Loading spinners |
| fs-extra | ^11.2.0 | File operations |
| node-fetch | ^3.3.2 | HTTP requests |
| zod | ^3.22.4 | Schema validation |
| cli-table3 | ^0.6.3 | Table output |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.3.3 | TypeScript compiler |
| tsup | ^8.0.1 | Bundle for npm |
| eslint | ^8.56.0 | Linting |
| prettier | ^3.2.4 | Formatting |
| @types/node | ^20.10.6 | Node.js types |

### Runtime Requirements
- Node.js >= 18.0.0
- Git (for GitFlow operations)
- Optional: .NET CLI (for EF Core support)

---

## Documentation Insights

### Commander.js Best Practices
- Use fluent API for command definitions
- Separate commands into individual files
- Support both short and long option flags
- Validate inputs with custom parsers
- Add aliases for frequently used commands

### tsup Configuration for CLI
```typescript
// Recommended tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',  // Critical for CLI execution
  },
});
```

### Interactive CLI Patterns
- **Chalk**: Use for errors (red), success (green), info (blue), warnings (yellow)
- **Ora**: Wrap async operations with spinners
- **Inquirer**: Use for license key input, confirmations, selections

### TypeScript Strict Mode
Enable all strict checks for production CLI:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

---

## Research Findings

### License Key Validation

**Recommended Approach**: Ed25519 asymmetric signatures (not simple checksums)

**Key Format**: `CGFW-XXXX-XXXX-XXXX` where:
- `CGFW`: Product prefix
- Parts 2-3: Random alphanumeric
- Part 4: SHA-256 checksum of parts 2+3

**Validation Flow**:
1. Local format validation (checksum)
2. Online API validation (on activation)
3. Cached validation (7-day grace period)
4. Machine ID binding for license portability

**Machine ID**: Use `node-machine-id` package for cross-platform:
- Windows: MachineGuid registry
- macOS: IOPlatformUUID
- Linux: /var/lib/dbus/machine-id

### GitHub Packages Distribution

**Configuration Requirements**:
```json
// package.json
{
  "name": "@atlashub/claude-gitflow",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

```ini
# .npmrc
@atlashub:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**CI/CD Workflow**:
```yaml
name: Publish to GitHub Packages
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@atlashub'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Key Files to Create

### Priority 1: Core Infrastructure
| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `package.json` | Project configuration | 50 |
| `tsconfig.json` | TypeScript config | 30 |
| `tsup.config.ts` | Build config | 15 |
| `src/index.ts` | CLI entry point | 40 |

### Priority 2: Library Modules
| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `src/lib/logger.ts` | Colored logging | 50 |
| `src/lib/license.ts` | License validation | 130 |
| `src/lib/installer.ts` | Command installation | 90 |
| `src/lib/detector.ts` | Project detection | 80 |
| `src/lib/config.ts` | Configuration | 30 |

### Priority 3: Commands
| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `src/commands/install.ts` | Install command | 70 |
| `src/commands/activate.ts` | Activate license | 80 |
| `src/commands/status.ts` | Show status | 70 |
| `src/commands/uninstall.ts` | Uninstall | 50 |
| `src/commands/update.ts` | Update commands | 30 |

### Priority 4: Types & Templates
| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `src/types/license.ts` | License schemas | 40 |
| `src/types/config.ts` | Config schemas | 50 |
| `templates/commands/*.md` | 4 GitFlow templates | 200 |

---

## Patterns to Follow

### Command Structure Pattern
```typescript
// src/commands/example.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';

export const exampleCommand = new Command('example')
  .alias('e')
  .description('Example command description')
  .option('-f, --force', 'Force operation')
  .action(async (options) => {
    logger.header('Example Command');
    try {
      // Implementation
      logger.success('Operation completed');
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
```

### Logger Pattern
```typescript
// src/lib/logger.ts
import chalk from 'chalk';
import ora from 'ora';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  header: (title: string) => {
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${title}`));
    console.log(chalk.cyan('═'.repeat(60)));
  },
  spinner: (text: string) => ora({ text, color: 'cyan' }).start(),
};
```

### Zod Schema Pattern
```typescript
// src/types/license.ts
import { z } from 'zod';

export const LicenseKeySchema = z.string().regex(
  /^CGFW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  'Invalid license key format'
);

export type LicenseKey = z.infer<typeof LicenseKeySchema>;
```

---

## Dependencies & Prerequisites

### Required for Development
- [ ] Node.js >= 18 installed
- [ ] npm or pnpm available
- [ ] Git configured

### Required for Distribution
- [ ] GitHub repository: `atlashub/claude-gitflow`
- [ ] GitHub PAT with `write:packages` scope
- [ ] License API endpoint on api.atlashub.ch

### Optional (for full testing)
- [ ] .NET SDK for EF Core testing
- [ ] Sample project with GitFlow setup

---

## Risks & Considerations

### Technical Risks
1. **ESM/CJS Compatibility**: chalk v5+ is ESM-only, ensure tsup bundles correctly
2. **Windows Path Handling**: Use `path.join()` consistently
3. **Git Detection**: Handle edge cases (bare repos, worktrees)

### Security Considerations
1. **License Keys**: Store in home directory with restricted permissions
2. **PAT Tokens**: Never commit to repository
3. **API Calls**: Use HTTPS, validate responses with Zod

### User Experience
1. **Offline Mode**: Grace period for license checks (7 days)
2. **Error Messages**: Clear, actionable feedback
3. **Progress Indication**: Spinners for all async operations

---

## Implementation Order

### Phase 1: Project Setup
1. Initialize npm project with package.json
2. Configure TypeScript and tsup
3. Set up ESLint and Prettier
4. Create .gitignore and .npmrc

### Phase 2: Core Libraries
1. Implement logger.ts
2. Implement license.ts (local validation only initially)
3. Implement config.ts and types

### Phase 3: Commands
1. Implement status command (simplest)
2. Implement activate command
3. Implement install/uninstall commands
4. Implement update command

### Phase 4: Templates & Testing
1. Create GitFlow command templates
2. Local testing with npm link
3. Build verification

### Phase 5: Distribution
1. Set up GitHub Actions workflow
2. Configure GitHub Packages
3. Test installation from registry

---

## Sources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [tsup Documentation](https://tsup.egoist.dev/)
- [GitHub Packages - npm Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Keygen - License Key Best Practices](https://keygen.sh/blog/how-to-generate-license-keys/)
- [node-machine-id](https://www.npmjs.com/package/node-machine-id)
