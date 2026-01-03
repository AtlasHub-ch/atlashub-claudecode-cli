---
description: Phase 1 - Initialize GitFlow structure with versioning and EF Core configuration
agent: gitflow-init
model: haiku
---

# Phase 1: INIT - Project Initialization

You are a GitFlow and EF Core expert. Initialize the .NET project for the GitFlow workflow.

**Workflow:** Analysis → Generate plan → User validates → Execute with `--exec`

---

## Default mode: Generate the plan

### 0. Check existing structure

**IMPORTANT:** Before analyzing, check if GitFlow is already initialized.

```bash
# Check for existing structure
CONFIG_FILE=".claude/gitflow/config.json"
EXPECTED_VERSION="1.2.0"

if [ -f "$CONFIG_FILE" ]; then
  EXISTING_VERSION=$(grep -oP '"version":\s*"\K[^"]+' "$CONFIG_FILE" 2>/dev/null || echo "unknown")
  echo "Existing GitFlow detected: v$EXISTING_VERSION"
fi
```

**If structure exists, analyze differences:**

| Check | Expected | Current | Status |
|-------|----------|---------|--------|
| Config version | 1.2.0 | {existing} | {OK/OUTDATED} |
| Worktrees enabled | true | {value} | {OK/MISSING} |
| EF Core config | crossBranch section | {exists?} | {OK/MISSING} |
| Folders | plans/, logs/, migrations/ | {exists?} | {OK/INCOMPLETE} |

**If differences detected, ask user:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Existing GitFlow structure detected (v{existing_version}). What do you want to do?",
    header: "Init",
    options: [
      { label: "Migrate", description: "Update to v1.2.0 - preserve existing config (Recommended)" },
      { label: "Reset", description: "Delete and recreate from scratch (loses config)" },
      { label: "Skip", description: "Keep current structure unchanged" }
    ],
    multiSelect: false
  }]
})
```

**Migration actions (if "Migrate" selected):**
1. Backup existing config to `.claude/gitflow/backup/config_<timestamp>.json`
2. Add missing config sections (worktrees, efcore.crossBranch, etc.)
3. Create missing folders
4. Update version to 1.2.0
5. Preserve user customizations (branch names, versioning source, etc.)

**Reset actions (if "Reset" selected):**
1. Backup entire `.claude/gitflow/` to `.claude/gitflow.bak_<timestamp>/`
2. Delete `.claude/gitflow/`
3. Continue with fresh initialization

**Skip actions:**
1. Display current config summary
2. Exit without changes

---

### 1. Analysis

Analyze the repository and detect:

**Git:**
- Check if it's a Git repo
- List existing branches (main/master, develop)
- Get remote origin URL

**Version (.NET - priority order):**
1. `*.csproj` → `<Version>` tag
2. `Directory.Build.props` → `<Version>` tag
3. `AssemblyInfo.cs` → `[AssemblyVersion]` attribute
4. `VERSION` file → raw content
5. Last git tag → format `vX.Y.Z`
6. None → suggest `0.1.0` with `VERSION` file

**EF Core:**
- Detect if EF Core is referenced in csproj files
- List existing DbContexts

### 2. Generate the plan file

Create `.claude/gitflow/plans/init_<YYYYMMDD>.md` containing:

````markdown
# GitFlow Initialization Plan

> Read this file then execute:

```
/gitflow:1-init --exec
```

## Repository
| Info | Value |
|------|-------|
| Name | {repo_name} |
| Remote | {url_or_local} |

## Version
| Source | File | Version |
|--------|------|---------|
| {type} | {path} | {version} |

## Planned Actions
- [ ] Branches: main ({create|exists}), develop ({create|exists})
- [ ] Structure: .claude/gitflow/{config.json, plans/, logs/, migrations/}
- [ ] CLAUDE.md: Repository section
- [ ] EF Core: {active|inactive} - Contexts: {list}

## Configuration
- Versioning: SemVer
- Tag prefix: v
- Auto-increment: feature→minor, hotfix→patch, release→manual

## Modify?
Edit this file before executing.

## Execute

```
/gitflow:1-init --exec
```
````

### 3. Display message

````
Plan generated: .claude/gitflow/plans/init_<DATE>.md

1. Read the file
2. Modify if necessary
3. Execute:

```
/gitflow:1-init --exec
```
````

---

## --exec mode: Execute the plan

### Prerequisites
- Init plan exists in `.claude/gitflow/plans/`

### Actions
1. **Branches**: Create main and develop if absent, checkout develop
2. **Structure**: Create `.claude/gitflow/{plans,logs,migrations}`
3. **Worktrees** (if `--with-worktrees`): Create worktrees structure (see below)
4. **Config**: Create `config.json` with plan configuration
5. **CLAUDE.md**: Add Repository section if branches existed
6. **VERSION**: Create file if no source detected
7. **Commit** (ask): `chore(gitflow): initialization v{VERSION}`

### Creating Worktrees (v1.2)

If `--with-worktrees` is specified (default: true), create the structure:

```bash
# Base path (relative to main repo)
WORKTREE_BASE="../worktrees"

# Create directories
mkdir -p "$WORKTREE_BASE/features"
mkdir -p "$WORKTREE_BASE/releases"
mkdir -p "$WORKTREE_BASE/hotfixes"

# Create permanent worktrees for main and develop
git worktree add "$WORKTREE_BASE/main" main
git worktree add "$WORKTREE_BASE/develop" develop
```

**Resulting structure:**
```
parent/
├── atlashub-project/          # Main repo
│   ├── .claude/gitflow/
│   └── ...
└── worktrees/
    ├── main/                  # Permanent worktree
    ├── develop/               # Permanent worktree
    ├── features/              # Features in progress
    │   └── {feature-name}/
    ├── releases/              # Releases in progress
    │   └── v{version}/
    └── hotfixes/              # Hotfixes in progress
        └── {hotfix-name}/
```

### Config.json structure
```json
{
  "version": "1.2.0",
  "repository": { "name", "defaultBranch", "remoteUrl" },
  "versioning": { "strategy", "current", "source", "sourceFile", "tagPrefix", "autoIncrement" },
  "git": { "branches", "mergeStrategy", "protectedBranches" },
  "worktrees": {
    "enabled": true,
    "basePath": "../worktrees",
    "permanent": { "main": true, "develop": true },
    "structure": { "features", "releases", "hotfixes" },
    "cleanupOnFinish": true
  },
  "efcore": {
    "enabled", "contexts", "generateScript", "scriptOutputPath",
    "crossBranch": { "enabled", "scanOnMigrationCreate", "blockOnConflict", "cacheExpiry" }
  },
  "workflow": { "requireConfirmation", "createCheckpoints", "commitConventions" }
}
```

### Archive plan
Rename to `init_<DATE>_DONE_<TIMESTAMP>.md`

---

## Modes

| Command | Action |
|---------|--------|
| `/gitflow:1-init` | Generate plan (asks if structure exists) |
| `/gitflow:1-init --exec` | Execute existing plan |
| `/gitflow:1-init --yes` | Generate + execute without intermediate file |
| `/gitflow:1-init --migrate` | Force migration of existing structure to v1.2.0 |
| `/gitflow:1-init --reset` | Force reset (backup + recreate from scratch) |
| `/gitflow:1-init --with-worktrees` | Generate plan with worktrees structure (default) |
| `/gitflow:1-init --no-worktrees` | Generate plan without worktrees |

---

## Migration Details (v1.0 → v1.2)

When migrating from an older version, these changes are applied:

### Config additions

```json
{
  "version": "1.2.0",           // Updated
  "worktrees": {                // NEW SECTION
    "enabled": true,
    "basePath": "../worktrees",
    "permanent": { "main": true, "develop": true },
    "structure": { "features": "features/", "releases": "releases/", "hotfixes": "hotfixes/" },
    "cleanupOnFinish": true
  },
  "efcore": {
    "crossBranch": {            // NEW SUBSECTION
      "enabled": true,
      "scanOnMigrationCreate": true,
      "blockOnConflict": true,
      "cacheExpiry": "1h"
    }
  },
  "workflow": {
    "push": {                   // NEW SUBSECTION
      "afterCommit": "worktree",
      "afterFinish": "always"
    }
  }
}
```

### Structure additions

```
.claude/gitflow/
├── backup/                    # NEW - for migration backups
├── cache/                     # NEW - for cross-branch scan cache
└── (existing folders preserved)
```

### Preserved during migration

- `versioning.source` and `versioning.sourceFile`
- `repository.*` settings
- `git.branches.*` custom branch names
- `efcore.contexts` list
- All existing plans and logs
