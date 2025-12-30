# @atlashub/claude-tools

Claude Code automation toolkit - GitFlow, APEX, EF Core migrations, prompts and more.

## Features

- GitFlow workflow automation with 6 phases
- Advanced EF Core migration management (multi-context, validation, rollback)
- APEX methodology (Analyze-Plan-Execute-eXamine)
- Git workflow commands (commit, PR creation, merge)
- Prompt generation tools
- License key validation system
- Interactive CLI with colored output
- Project auto-detection (Git, .NET, EF Core)
- Global installation to `~/.claude` (user-level)

## Installation

### Depuis GitHub (Recommande)

```bash
# Installation globale directe depuis GitHub
npm install -g github:atlashub/claude-tools

# Ou depuis une branche specifique
npm install -g github:atlashub/claude-tools#develop

# Ou depuis un tag
npm install -g github:atlashub/claude-tools#v1.0.0
```

### Depuis GitHub Packages (npm)

```bash
# Configure npm for GitHub Packages
npm config set @atlashub:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN

# Install globally
npm install -g @atlashub/claude-tools
```

### Comme dependance de projet

```bash
# Ajouter au projet
npm install -D github:atlashub/claude-tools

# Utiliser via npx
npx claude-tools install --local --skip-license
```

## Quick Start

```bash
# Activate your license
claude-tools activate YOUR-LICENSE-KEY

# Install commands to ~/.claude (global - default)
claude-tools install

# Or install to project directory ./.claude (local)
claude-tools install --local

# Check status
claude-tools status
```

## CLI Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `activate <key>` | `a` | Activate license key |
| `install` | `i` | Install commands, agents, and hooks |
| `uninstall` | `u` | Remove commands, agents, and hooks |
| `status` | `s` | Show license and installation status |
| `update` | - | Update commands to latest version |

### Install Options

```bash
# Install all components (default)
claude-tools install

# Install specific components only
claude-tools install --commands-only
claude-tools install --agents-only
claude-tools install --hooks-only

# Install to project directory instead of user directory
claude-tools install --local

# Force overwrite existing files
claude-tools install --force

# Skip config file creation
claude-tools install --no-config
```

### Uninstall Options

```bash
# Remove all components
claude-tools uninstall

# Remove specific components only
claude-tools uninstall --commands-only
claude-tools uninstall --agents-only
claude-tools uninstall --hooks-only

# Keep configuration file
claude-tools uninstall --keep-config

# Skip confirmation
claude-tools uninstall --yes
```

## Claude Code Commands (after installation)

### GitFlow Workflow

| Command | Description |
|---------|-------------|
| `/gitflow` | Full GitFlow workflow orchestrator |
| `/gitflow:1-init` | Initialize GitFlow structure |
| `/gitflow:2-status` | Show detailed GitFlow status |
| `/gitflow:3-commit` | Smart commit with migration handling |
| `/gitflow:4-plan` | Create integration plan |
| `/gitflow:5-exec` | Execute integration plan |
| `/gitflow:6-abort` | Rollback operations |

### APEX Methodology

| Command | Description |
|---------|-------------|
| `/apex` | Full APEX workflow |
| `/apex:1-analyze` | Gather context and create analysis |
| `/apex:2-plan` | Create implementation strategy |
| `/apex:3-execute` | Implement the plan |
| `/apex:4-examine` | Validate and test |
| `/apex:5-tasks` | Divide into task files |

### EF Core Migrations

| Command | Description |
|---------|-------------|
| `/db-migration` | Database migration management |
| `/ef-migration-sync` | Sync migrations between branches |
| `/ef-migration-squash` | Squash migrations |

### Git Commands

| Command | Description |
|---------|-------------|
| `/git:commit` | Quick commit with clean messages |
| `/git:commitizen` | Conventional commit messages |
| `/git:create-pr` | Create pull request |
| `/git:fix-pr-comments` | Fix PR review comments |
| `/git:merge` | Intelligent branch merge |

### Development Commands

| Command | Description |
|---------|-------------|
| `/epct` | Explore-Plan-Code-Test methodology |
| `/oneshot` | Ultra-fast feature implementation |
| `/debug` | Systematic bug debugging |
| `/explore` | Deep codebase exploration |
| `/explain` | Code explanation with diagrams |
| `/review` | Quick code review |
| `/quick-search` | Lightning-fast search |

### Prompt Generation

| Command | Description |
|---------|-------------|
| `/prompts:create` | Create optimized prompts |
| `/prompts:agent` | Create agent prompts |
| `/prompts:command` | Create command prompts |
| `/prompts:claude-memory` | Create/update CLAUDE.md |

## Configuration

After installation, configuration is stored in `~/.claude/gitflow/config.json`:

```json
{
  "$schema": "https://atlashub.ch/schemas/claude-tools-config.json",
  "version": "1.0.0",
  "git": {
    "branches": {
      "main": "main",
      "develop": "develop",
      "featurePrefix": "feature/",
      "releasePrefix": "release/",
      "hotfixPrefix": "hotfix/"
    },
    "remote": "origin",
    "mergeStrategy": "--no-ff",
    "tagPrefix": "v",
    "protectedBranches": ["main", "develop"]
  },
  "efcore": {
    "enabled": true,
    "contexts": [
      {
        "name": "ApplicationDbContext",
        "projectPath": "./src/Data",
        "migrationsFolder": "Migrations",
        "startupProject": "./src/Api"
      }
    ],
    "scripts": {
      "generateOnRelease": true,
      "outputPath": "./scripts/migrations",
      "idempotent": true
    },
    "validation": {
      "checkModelSnapshotConflicts": true,
      "validateMigrationOrder": true,
      "requireThreeFiles": true
    }
  },
  "workflow": {
    "requireConfirmation": true,
    "autoDeleteBranch": false,
    "createCheckpoints": true
  }
}
```

## Directory Structure

After installation, the following structure is created:

```
~/.claude/                    # User-level (global)
├── commands/                 # Slash commands
│   ├── gitflow.md           # GitFlow orchestrator
│   ├── gitflow/             # GitFlow phases
│   │   ├── 1-init.md
│   │   ├── 2-status.md
│   │   ├── 3-commit.md
│   │   ├── 4-plan.md
│   │   ├── 5-exec.md
│   │   └── 6-abort.md
│   ├── apex.md              # APEX orchestrator
│   ├── apex/                # APEX phases
│   ├── ef-migrations/       # EF Core commands
│   ├── git/                 # Git workflow commands
│   └── prompts/             # Prompt generators
├── agents/                   # Specialized agents
│   ├── explore-codebase.md
│   ├── explore-docs.md
│   ├── action.md
│   ├── snipper.md
│   ├── websearch.md
│   └── fix-grammar.md
├── hooks/                    # Claude Code hooks
│   └── hooks.json
└── gitflow/                  # GitFlow data
    ├── config.json          # Configuration
    ├── plans/               # Integration plans
    ├── logs/                # Operation logs
    └── migrations/          # Migration tracking
        └── history.json
```

## License

This software requires a valid license key. Visit [atlashub.ch/claude-tools](https://atlashub.ch/claude-tools) for licensing information.

## Support

- Documentation: [atlashub.ch/docs](https://atlashub.ch/docs)
- Issues: [GitHub Issues](https://github.com/atlashub/claude-tools/issues)
- Email: support@atlashub.ch
