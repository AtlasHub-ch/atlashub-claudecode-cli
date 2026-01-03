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
| `/gitflow:1-init` | Generate plan |
| `/gitflow:1-init --exec` | Execute existing plan |
| `/gitflow:1-init --yes` | Generate + execute without intermediate file |
| `/gitflow:1-init --with-worktrees` | Generate plan with worktrees structure (default) |
| `/gitflow:1-init --no-worktrees` | Generate plan without worktrees |
