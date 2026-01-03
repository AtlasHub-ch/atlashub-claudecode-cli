# @atlashub/claude-tools

Claude Code automation toolkit - GitFlow, APEX, EF Core migrations, prompts and more.

[![npm version](https://img.shields.io/npm/v/@atlashub/claude-tools.svg)](https://www.npmjs.com/package/@atlashub/claude-tools)
[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](https://atlashub.ch/claude-tools)

## Documentation

```bash
ct docs
```

Ouvre la documentation interactive complete avec :
- **GitFlow** - Workflow complet avec 12 phases et diagrammes interactifs
- **EF Core** - Gestion avancee des migrations multi-contextes
- **APEX** - Methodologie Analyze-Plan-Execute-eXamine
- **Business Analyse** - Workflow specification → implementation
- **Agents** - Agents specialises pour chaque tache
- **Installation** - Guide detaille avec exemples

## Features

- GitFlow workflow automation with 12 phases
- Advanced EF Core migration management (multi-context, validation, rollback)
- APEX methodology (Analyze-Plan-Execute-eXamine)
- Git workflow commands (commit, PR creation, merge)
- Prompt generation tools
- License key validation system
- Interactive CLI with colored output
- Project auto-detection (Git, .NET, EF Core)
- Global installation to `~/.claude` (user-level)

## Installation

### Installation globale (recommandé)

```bash
npm install -g @atlashub/claude-tools
```

Puis utilisez les commandes `claude-tools` ou `ct` :

```bash
claude-tools --help
ct --help
```

### Installation dans un projet

```bash
npm install -D @atlashub/claude-tools
npx claude-tools install --local
```

### Exécution directe (sans installation)

```bash
npx @atlashub/claude-tools install --local
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

# Open interactive documentation
claude-tools docs
```

## CLI Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `activate <key>` | `a` | Activate license key |
| `install` | `i` | Install commands, agents, and hooks |
| `uninstall` | `u` | Remove commands, agents, and hooks |
| `status` | `s` | Show license and installation status |
| `update` | - | Update commands to latest version |
| `docs` | `d` | Open interactive documentation |

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
| `/gitflow:3-commit` | Smart commit with migration handling + auto-push for worktrees |
| `/gitflow:4-plan` | Create integration plan |
| `/gitflow:5-exec` | Execute integration plan |
| `/gitflow:6-abort` | Rollback operations |
| `/gitflow:7-pull-request` | Create PR with auto-generated description and checks |
| `/gitflow:8-review` | Review PR with checklist and suggestions |
| `/gitflow:9-merge` | Merge PR with all validations |
| `/gitflow:10-start` | Start new feature/release/hotfix branch (with worktree) |
| `/gitflow:11-finish` | Finalize branch (tag + merge back + cleanup worktree) |
| `/gitflow:12-cleanup` | Audit and cleanup orphan/stale worktrees |

### APEX Methodology

| Command | Description |
|---------|-------------|
| `/apex` | Full APEX workflow |
| `/apex:1-analyze` | Gather context and create analysis |
| `/apex:2-plan` | Create implementation strategy |
| `/apex:3-execute` | Implement the plan |
| `/apex:4-examine` | Validate and test |
| `/apex:5-tasks` | Divide into task files |

### Business Analyse (Specification to Implementation)

| Command | Description |
|---------|-------------|
| `/business-analyse` | Full BA workflow (7 phases) |
| `/business-analyse:1-init` | Initialize .business-analyse/ structure |
| `/business-analyse:2-discover` | Adaptive questionnaire (ultrathink) |
| `/business-analyse:3-analyse` | BRD generation (ultrathink) |
| `/business-analyse:4-specify` | FRD with use cases & wireframes (ultrathink) |
| `/business-analyse:5-document` | Cross-cutting documentation |
| `/business-analyse:6-handoff` | Generate autonomous dev prompt |
| `/business-analyse:7-dev` | Guided implementation with user validation |
| `/business-analyse:bug` | Bug documentation & specification |

> **Note**: Phases 1-6 produce specifications only. Phase 7 implements with mandatory user validation before each step.

### EF Core Migrations

| Command | Description |
|---------|-------------|
| `/efcore:migration` | Create/recreate the migration (1 per feature) |
| `/efcore:db-status` | Show migration status |
| `/efcore:db-deploy` | Apply migrations |
| `/efcore:db-seed` | Populate with test data |
| `/efcore:db-reset` | Drop + Recreate database |

### EF Core Cross-Branch (v1.2)

| Command | Description |
|---------|-------------|
| `/efcore:scan` | Scan migrations on all active branches |
| `/efcore:conflicts` | Analyze potential conflicts (BLOCKING) |
| `/efcore:rebase-snapshot` | Rebase ModelSnapshot on develop |
| `/efcore:squash` | Merge multiple migrations into one |

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
  "$schema": "https://atlashub.ch/schemas/claude-gitflow-config.json",
  "version": "1.1.0",
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
    "protectedBranches": ["main", "develop"],
    "requireLinearHistory": false
  },
  "efcore": {
    "enabled": true,
    "autoDetect": true,
    "contexts": [
      {
        "name": "ApplicationDbContext",
        "projectPath": "auto-detect",
        "startupProject": "auto-detect",
        "migrationsFolder": "Migrations"
      }
    ],
    "database": {
      "configFile": "appsettings.Local.json",
      "connectionStringName": "DefaultConnection",
      "provider": "SqlServer"
    },
    "scripts": {
      "generateOnRelease": true,
      "generateOnHotfix": true,
      "idempotent": true,
      "outputPath": "./scripts/migrations"
    },
    "validation": {
      "validateBeforeCommit": true,
      "validateBeforeMerge": true,
      "checkModelSnapshotConflicts": true,
      "requireBuildSuccess": true
    }
  },
  "workflow": {
    "requireConfirmation": true,
    "autoDeleteBranch": false,
    "createCheckpoints": true,
    "push": {
      "afterCommit": "worktree"
    },
    "commitConventions": {
      "enabled": true,
      "feature": "feat: ",
      "fix": "fix: ",
      "release": "release: ",
      "hotfix": "hotfix: "
    }
  },
  "ui": {
    "colors": true,
    "showProgress": true,
    "language": "fr"
  }
}
```

## Directory Structure

After installation, the following structure is created:

```
~/.claude/                    # User-level (global)
├── commands/                 # Slash commands
│   ├── gitflow.md           # GitFlow orchestrator
│   ├── gitflow/             # GitFlow phases (11)
│   │   ├── 1-init.md
│   │   ├── 2-status.md
│   │   ├── 3-commit.md
│   │   ├── 4-plan.md
│   │   ├── 5-exec.md
│   │   ├── 6-abort.md
│   │   ├── 7-pull-request.md
│   │   ├── 8-review.md
│   │   ├── 9-merge.md
│   │   ├── 10-start.md
│   │   ├── 11-finish.md
│   │   └── 12-cleanup.md
│   ├── apex.md              # APEX orchestrator
│   ├── apex/                # APEX phases
│   ├── ef-migrations/       # EF Core commands
│   ├── git/                 # Git workflow commands
│   └── prompts/             # Prompt generators
├── agents/                   # Specialized agents
│   ├── gitflow/             # GitFlow agents (12)
│   │   ├── init.md
│   │   ├── status.md
│   │   ├── commit.md
│   │   ├── plan.md
│   │   ├── exec.md
│   │   ├── abort.md
│   │   ├── pr.md
│   │   ├── review.md
│   │   ├── merge.md
│   │   ├── start.md
│   │   ├── finish.md
│   │   └── cleanup.md
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
