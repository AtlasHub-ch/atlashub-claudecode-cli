---
description: Phase 1 - Initialize GitFlow structure with versioning and EF Core configuration
agent: gitflow-init
model: haiku
---

# Phase 1: INIT - Project Initialization

You are a GitFlow and EF Core expert. Initialize a project for the GitFlow workflow.

**Workflow:** Analysis → Generate plan → User validates → Execute with `--exec`

**Arguments:** `$ARGUMENTS` = `[repository_url] [target_folder] [--exec] [--yes] [--no-worktrees]`

---

## Detect Init Mode

Parse `$ARGUMENTS` to determine the initialization mode:

| Mode | Detection | Example |
|------|-----------|---------|
| **Clone from URL** | URL pattern (https:// or git@) | `/gitflow:1-init https://github.com/org/repo.git c:/dev` |
| **Interactive** | NOT inside a git repo AND no URL provided | `/gitflow:1-init` (from empty folder) |
| **Existing repo** | Inside a git repository | `/gitflow:1-init` |
| **New local** | Target folder without URL | `/gitflow:1-init c:/dev/my-project` |

**Detection order:**
1. Check if `$ARGUMENTS` contains a URL → MODE A (Clone from URL)
2. Check if current directory is a git repo (`git rev-parse --git-dir`) → MODE B (Existing repo)
3. Otherwise → MODE C (Interactive - ask for repo URL)

---

## MODE A: Clone from URL (New)

**Trigger:** `$ARGUMENTS` contains a repository URL

### A.1 Parse Arguments

```bash
# Extract URL and target folder
REPO_URL="$1"              # https://github.com/org/repo.git
TARGET_FOLDER="$2"         # c:/dev (optional, defaults to current directory)
REPO_NAME=$(basename "$REPO_URL" .git)  # Extract repo name from URL

# Determine project base path
if [ -n "$TARGET_FOLDER" ]; then
  PROJECT_BASE="$TARGET_FOLDER/$REPO_NAME"
else
  PROJECT_BASE="./$REPO_NAME"
fi
```

### A.2 Validate

```bash
# Check URL is accessible
git ls-remote "$REPO_URL" HEAD > /dev/null 2>&1 || {
  echo "ERROR: Cannot access repository: $REPO_URL"
  exit 1
}

# Check target doesn't exist
if [ -d "$PROJECT_BASE" ]; then
  echo "ERROR: Directory already exists: $PROJECT_BASE"
  exit 1
fi
```

### A.3 Create Organized Structure

```bash
# Create project folder with organized structure
mkdir -p "$PROJECT_BASE"
cd "$PROJECT_BASE"

# Clone as bare repository (hidden)
git clone --bare "$REPO_URL" .bare
echo "gitdir: ./.bare" > .git

# Configure bare repo for worktrees
cd .bare
git config core.bare false
git config core.worktree ".."
cd ..

# Create organized worktree structure
mkdir -p features releases hotfixes

# Create permanent worktrees with numbered prefixes
git worktree add "01-Main" main
git worktree add "02-Develop" develop

# Initialize GitFlow config in 02-Develop (working directory)
cd "02-Develop"
mkdir -p .claude/gitflow/{plans,logs,migrations,backup,cache}
```

**Resulting structure:**
```
{target_folder}/{repo_name}/
├── .bare/                    # Hidden bare repository
├── .git                      # gitdir pointer to .bare
├── 01-Main/                  # Permanent worktree (main branch)
│   └── ...
├── 02-Develop/               # Permanent worktree (develop branch) ← WORKING DIR
│   ├── .claude/gitflow/
│   │   ├── config.json
│   │   ├── plans/
│   │   ├── logs/
│   │   └── migrations/
│   └── ...
├── features/                 # Feature worktrees go here
│   └── {feature-name}/
├── releases/                 # Release worktrees go here
│   └── v{version}/
└── hotfixes/                 # Hotfix worktrees go here
    └── {hotfix-name}/
```

### A.4 Config for Clone Mode

```json
{
  "version": "1.3.0",
  "initMode": "clone",
  "repository": {
    "name": "{repo_name}",
    "remoteUrl": "{REPO_URL}",
    "defaultBranch": "main"
  },
  "worktrees": {
    "enabled": true,
    "mode": "organized",
    "basePath": "..",
    "bareRepo": "../.bare",
    "permanent": {
      "main": { "path": "../01-Main", "prefix": "01" },
      "develop": { "path": "../02-Develop", "prefix": "02" }
    },
    "structure": {
      "features": "../features/",
      "releases": "../releases/",
      "hotfixes": "../hotfixes/"
    },
    "cleanupOnFinish": true
  }
}
```

### A.5 Display Summary

```
================================================================================
                    GITFLOW INITIALIZED (Clone Mode)
================================================================================

REPOSITORY
  Name:   {repo_name}
  Remote: {REPO_URL}

STRUCTURE CREATED
  {PROJECT_BASE}/
  ├── 01-Main/        ← main branch
  ├── 02-Develop/     ← develop branch (current directory)
  ├── features/       ← feature worktrees
  ├── releases/       ← release worktrees
  └── hotfixes/       ← hotfix worktrees

WORKING DIRECTORY
  {PROJECT_BASE}/02-Develop

NEXT STEPS
  1. cd "{PROJECT_BASE}/02-Develop"
  2. code .   (or your preferred IDE)
  3. /gitflow:10-start feature {name}

================================================================================
```

---

## MODE C: Interactive (No Repo Detected)

**Trigger:** Current directory is NOT a git repository AND no URL provided in arguments

This mode guides the user through setting up a new GitFlow project interactively.

**Critical Flow Order:**
```
C.1 Target Directory (WHERE?) → C.2 Repository URL → C.3 Project Name (WHAT?) → C.4 Confirmation → C.5 Execute
```

### C.1 Ask for Target Directory (FIRST - Critical)

**IMPORTANT:** Ask WHERE to create the project BEFORE asking for repository details.

```javascript
AskUserQuestion({
  questions: [{
    question: "Where do you want to create your GitFlow project?",
    header: "Location",
    options: [
      { label: "Current directory", description: `Create in: ${process.cwd()} (Recommended)` },
      { label: "C:/Dev", description: "Common development folder (Windows)" },
      { label: "~/projects", description: "Common development folder (Unix)" },
      { label: "Custom path", description: "Enter a different location" }
    ],
    multiSelect: false
  }]
})
```

**If "Custom path" selected:**
```
Enter the target parent folder (project will be created inside):
> Example: C:/Projects or /home/user/dev
```

**Validate path exists:**
```bash
# Expand ~ if present
TARGET_PATH="${TARGET_PATH/#\~/$HOME}"

# Check directory exists
if [ ! -d "$TARGET_PATH" ]; then
  echo "WARNING: Directory does not exist: $TARGET_PATH"
  # Ask: Create it? or Choose different path?
  AskUserQuestion({
    questions: [{
      question: "Directory '$TARGET_PATH' does not exist. Create it?",
      header: "Create Dir",
      options: [
        { label: "Yes, create it", description: "Create the directory and continue (Recommended)" },
        { label: "Choose different path", description: "Enter another location" }
      ],
      multiSelect: false
    }]
  })
fi

# Check write permissions
if [ ! -w "$TARGET_PATH" ]; then
  echo "ERROR: No write permission to: $TARGET_PATH"
  # Ask again
fi
```

### C.2 Ask for Repository URL

```javascript
AskUserQuestion({
  questions: [{
    question: "What repository do you want to clone?",
    header: "Repository",
    options: [
      { label: "GitHub", description: "https://github.com/org/repo.git" },
      { label: "GitLab", description: "https://gitlab.com/org/repo.git" },
      { label: "Azure DevOps", description: "https://dev.azure.com/org/project/_git/repo" },
      { label: "Other", description: "Any git remote URL (SSH or HTTPS)" }
    ],
    multiSelect: false
  }]
})
```

**Then prompt for the actual URL:**
```
Enter the repository URL:
> Example: https://github.com/organization/my-project.git
```

**Validate URL is accessible:**
```bash
git ls-remote "$REPO_URL" HEAD > /dev/null 2>&1 || {
  echo "ERROR: Cannot access repository: $REPO_URL"
  echo "Please verify:"
  echo "  - URL is correct"
  echo "  - You have access permissions"
  echo "  - Network connectivity"
  # Ask again
}
```

### C.3 Ask for Project Name (EXPLICIT - Critical)

**IMPORTANT:** This is a CRITICAL step. Ask EXPLICITLY for the project name, don't just confirm.

Extract suggestion from URL:
```bash
# Extract repo name from various URL formats
# https://github.com/org/my-project.git → my-project
# git@github.com:org/my-project.git → my-project
# https://dev.azure.com/org/project/_git/repo → repo

SUGGESTED_NAME=$(basename "$REPO_URL" .git)
```

**Ask user EXPLICITLY for project name:**

```javascript
AskUserQuestion({
  questions: [{
    question: "What should we name this project folder?",
    header: "Project Name",  // Critical: explicit header
    options: [
      { label: "${SUGGESTED_NAME}", description: `Use repository name: "${SUGGESTED_NAME}" (Recommended)` },
      { label: "Custom name", description: "Enter a different folder name" }
    ],
    multiSelect: false
  }]
})
```

**If "Custom name" selected:**
```
Enter the project folder name:
>
```

**Strict validation:**
```bash
# 1. Not empty
if [ -z "$PROJECT_NAME" ]; then
  echo "ERROR: Project name cannot be empty"
  # Ask again
fi

# 2. Valid characters only
if [[ ! "$PROJECT_NAME" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo "ERROR: Invalid characters in project name"
  echo "Allowed: letters, numbers, dots (.), underscores (_), hyphens (-)"
  echo "Not allowed: spaces, special characters"
  # Ask again
fi

# 3. Doesn't already exist in target location
FULL_PROJECT_PATH="$TARGET_PATH/$PROJECT_NAME"
if [ -d "$FULL_PROJECT_PATH" ]; then
  echo "ERROR: Folder already exists: $FULL_PROJECT_PATH"
  # Ask for different name
fi

# 4. Reasonable length
if [ ${#PROJECT_NAME} -gt 100 ]; then
  echo "ERROR: Project name too long (max 100 characters)"
  # Ask again
fi
```

### C.4 Final Confirmation with Full Path

**Display complete summary before creating:**

```javascript
AskUserQuestion({
  questions: [{
    question: `Create GitFlow project with these settings?\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Project Name:  ${PROJECT_NAME}
  Location:      ${TARGET_PATH}/
  Full Path:     ${FULL_PROJECT_PATH}/
  Repository:    ${REPO_URL}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure to be created:
  ${PROJECT_NAME}/
  ├── .bare/           (hidden bare repository)
  ├── 01-Main/         (main branch)
  ├── 02-Develop/      (develop branch) ← Working directory
  ├── features/
  ├── releases/
  └── hotfixes/`,
    header: "Confirm",
    options: [
      { label: "Yes, create project", description: "Create structure and clone repository (Recommended)" },
      { label: "Change settings", description: "Go back and modify name, location, or repository" }
    ],
    multiSelect: false
  }]
})
```

**If "Change settings" selected:**
- Return to C.1 and let user modify any setting

### C.5 Create Structure and Clone

Once all inputs are confirmed, execute the same steps as MODE A:

```bash
# Final path is already set from C.3 validation
# FULL_PROJECT_PATH="$TARGET_PATH/$PROJECT_NAME"

# Create project folder with organized structure
mkdir -p "$FULL_PROJECT_PATH"
cd "$FULL_PROJECT_PATH"

# Clone as bare repository (hidden)
git clone --bare "$REPO_URL" .bare
echo "gitdir: ./.bare" > .git

# Configure bare repo for worktrees
cd .bare
git config core.bare false
git config core.worktree ".."
cd ..

# Create organized worktree structure
mkdir -p features releases hotfixes

# Create permanent worktrees with numbered prefixes
git worktree add "01-Main" main
git worktree add "02-Develop" develop 2>/dev/null || {
  # If develop doesn't exist, create it from main
  git worktree add "02-Develop" -b develop main
}

# Initialize GitFlow config in 02-Develop (working directory)
cd "02-Develop"
mkdir -p .claude/gitflow/{plans,logs,migrations,backup,cache}
```

### C.6 Generate Config and Display Summary

Generate the same config as MODE A (see A.4) and display:

```
================================================================================
                    GITFLOW INITIALIZED (Interactive Mode)
================================================================================

REPOSITORY
  Name:   ${PROJECT_NAME}
  Remote: ${REPO_URL}

STRUCTURE CREATED
  ${FULL_PROJECT_PATH}/
  ├── .bare/          ← Bare repository (hidden)
  ├── .git            ← Pointer to .bare
  ├── 01-Main/        ← main branch (read-only reference)
  ├── 02-Develop/     ← develop branch (WORKING DIRECTORY)
  ├── features/       ← Feature worktrees will go here
  ├── releases/       ← Release worktrees will go here
  └── hotfixes/       ← Hotfix worktrees will go here

WORKING DIRECTORY
  ${FULL_PROJECT_PATH}/02-Develop

NEXT STEPS
  1. Open the project:
     cd "${FULL_PROJECT_PATH}/02-Develop"
     code .

  2. Start a new feature:
     /gitflow:10-start feature my-feature

================================================================================
```

---

## MODE B: Existing Repository (Default)

**Trigger:** Currently inside a git repository without URL argument

### 0. Check existing structure

**IMPORTANT:** Before analyzing, check if GitFlow is already initialized.

Check for existing structure at [.claude/gitflow/config.json](.claude/gitflow/config.json).

**If structure exists, analyze differences:**

| Check | Expected | Current | Status |
|-------|----------|---------|--------|
| Config version | 1.2.0 | {existing} | {OK/OUTDATED} |
| Worktrees enabled | true | {value} | {OK/MISSING} |
| EF Core config | crossBranch section | {exists?} | {OK/MISSING} |
| Folders | [plans/](.claude/gitflow/plans/), [logs/](.claude/gitflow/logs/), [migrations/](.claude/gitflow/migrations/) | {exists?} | {OK/INCOMPLETE} |

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
1. Backup existing config to [.claude/gitflow/backup/](.claude/gitflow/backup/)
2. Add missing config sections (worktrees, efcore.crossBranch, etc.)
3. Create missing folders
4. Update version to 1.2.0
5. Preserve user customizations (branch names, versioning source, etc.)

**Reset actions (if "Reset" selected):**
1. Backup entire [.claude/gitflow/](.claude/gitflow/) to `.claude/gitflow.bak_<timestamp>/`
2. Delete [.claude/gitflow/](.claude/gitflow/)
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

Create plan file in [.claude/gitflow/plans/](.claude/gitflow/plans/) named `init_<YYYYMMDD>.md` containing:

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
- Init plan exists in [.claude/gitflow/plans/](.claude/gitflow/plans/)

### Actions
1. **Branches**: Create main and develop if absent, checkout develop
2. **Structure**: Create [.claude/gitflow/](.claude/gitflow/) with subdirectories:
   - [plans/](.claude/gitflow/plans/) - Integration plans
   - [logs/](.claude/gitflow/logs/) - Operation history
   - [migrations/](.claude/gitflow/migrations/) - EF Core snapshots
3. **Worktrees** (if `--with-worktrees`): Create worktrees structure (see below)
4. **Config**: Create [config.json](.claude/gitflow/config.json) with plan configuration
5. **CLAUDE.md**: Add Repository section if branches existed
6. **VERSION**: Create file if no source detected
7. **Commit** (ask): `chore(gitflow): initialization v{VERSION}`

### Creating Worktrees (v1.3)

If `--with-worktrees` is specified (default: true), ask user for structure preference:

```javascript
AskUserQuestion({
  questions: [{
    question: "Choose worktree organization style",
    header: "Structure",
    options: [
      { label: "Organized (Recommended)", description: "01-Main/, 02-Develop/, features/, releases/, hotfixes/ in parent folder" },
      { label: "Adjacent", description: "../worktrees/ folder next to repo (legacy mode)" },
      { label: "Skip worktrees", description: "No worktree structure, use branch switching" }
    ],
    multiSelect: false
  }]
})
```

#### Option 1: Organized Structure (Recommended)

```bash
# Move current repo to subfolder with numbered prefix
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
REPO_NAME=$(basename "$CURRENT_DIR")

# Create organized structure in parent
cd "$PARENT_DIR"
mkdir -p "${REPO_NAME}-gitflow"
mv "$REPO_NAME" "${REPO_NAME}-gitflow/.bare-temp"

cd "${REPO_NAME}-gitflow"

# Convert to bare repo structure
git clone --bare ".bare-temp" .bare
rm -rf .bare-temp
echo "gitdir: ./.bare" > .git

# Configure bare repo
cd .bare
git config core.bare false
git config core.worktree ".."
cd ..

# Create worktree structure
mkdir -p features releases hotfixes
git worktree add "01-Main" main
git worktree add "02-Develop" develop

# Move to 02-Develop as working directory
cd "02-Develop"
```

**Resulting structure (Organized):**
```
parent/
└── {repo-name}-gitflow/         # Project folder
    ├── .bare/                   # Bare repository
    ├── .git                     # gitdir pointer
    ├── 01-Main/                 # Permanent worktree (main)
    │   └── ...
    ├── 02-Develop/              # Permanent worktree (develop) ← WORKING DIR
    │   ├── .claude/gitflow/
    │   └── ...
    ├── features/                # Feature worktrees
    │   └── {feature-name}/
    ├── releases/                # Release worktrees
    │   └── v{version}/
    └── hotfixes/                # Hotfix worktrees
        └── {hotfix-name}/
```

#### Option 2: Adjacent Structure (Legacy)

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

**Resulting structure (Adjacent/Legacy):**
```
parent/
├── atlashub-project/          # Main repo (stays as-is)
│   ├── .claude/gitflow/
│   └── ...
└── worktrees/                 # Adjacent folder
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

#### Organized Mode (v1.3)
```json
{
  "version": "1.3.0",
  "initMode": "organized",
  "repository": { "name": "", "defaultBranch": "main", "remoteUrl": "" },
  "versioning": { "strategy": "semver", "current": "0.1.0", "source": "auto", "sourceFile": "", "tagPrefix": "v", "autoIncrement": { "feature": "minor", "hotfix": "patch", "release": "manual" } },
  "git": { "branches": { "main": "main", "develop": "develop", "feature": "feature/", "release": "release/", "hotfix": "hotfix/" }, "mergeStrategy": "--no-ff", "protectedBranches": ["main", "develop"] },
  "worktrees": {
    "enabled": true,
    "mode": "organized",
    "basePath": "..",
    "bareRepo": "../.bare",
    "permanent": {
      "main": { "path": "../01-Main", "prefix": "01" },
      "develop": { "path": "../02-Develop", "prefix": "02" }
    },
    "structure": {
      "features": "../features/",
      "releases": "../releases/",
      "hotfixes": "../hotfixes/"
    },
    "cleanupOnFinish": true
  },
  "efcore": {
    "enabled": false, "contexts": [], "generateScript": false, "scriptOutputPath": "",
    "crossBranch": { "enabled": true, "scanOnMigrationCreate": true, "blockOnConflict": true, "cacheExpiry": "1h" }
  },
  "workflow": { "requireConfirmation": true, "createCheckpoints": true, "commitConventions": "conventional", "push": { "afterCommit": "worktree", "afterFinish": "always" } }
}
```

#### Adjacent/Legacy Mode (v1.2 compatible)
```json
{
  "version": "1.3.0",
  "initMode": "adjacent",
  "repository": { "name": "", "defaultBranch": "main", "remoteUrl": "" },
  "versioning": { "strategy": "semver", "current": "0.1.0", "source": "auto", "sourceFile": "", "tagPrefix": "v", "autoIncrement": { "feature": "minor", "hotfix": "patch", "release": "manual" } },
  "git": { "branches": { "main": "main", "develop": "develop", "feature": "feature/", "release": "release/", "hotfix": "hotfix/" }, "mergeStrategy": "--no-ff", "protectedBranches": ["main", "develop"] },
  "worktrees": {
    "enabled": true,
    "mode": "adjacent",
    "basePath": "../worktrees",
    "permanent": { "main": true, "develop": true },
    "structure": { "features": "features/", "releases": "releases/", "hotfixes": "hotfixes/" },
    "cleanupOnFinish": true
  },
  "efcore": {
    "enabled": false, "contexts": [], "generateScript": false, "scriptOutputPath": "",
    "crossBranch": { "enabled": true, "scanOnMigrationCreate": true, "blockOnConflict": true, "cacheExpiry": "1h" }
  },
  "workflow": { "requireConfirmation": true, "createCheckpoints": true, "commitConventions": "conventional", "push": { "afterCommit": "worktree", "afterFinish": "always" } }
}
```

### Archive plan
Rename to `init_<DATE>_DONE_<TIMESTAMP>.md`

---

## Modes

### Clone Mode (New in v1.3)

| Command | Action |
|---------|--------|
| `/gitflow:1-init {url}` | Clone repo to current directory with organized structure |
| `/gitflow:1-init {url} {folder}` | Clone repo to target folder with organized structure |
| `/gitflow:1-init {url} {folder} --yes` | Clone and initialize without prompts |

**Examples:**
```bash
/gitflow:1-init https://github.com/org/repo.git
/gitflow:1-init https://github.com/org/repo.git c:/dev
/gitflow:1-init git@github.com:org/repo.git c:/dev --yes
```

### Interactive Mode (New in v1.3)

**Trigger:** Run `/gitflow:1-init` from a directory that is NOT a git repository

| Step | Action |
|------|--------|
| 1 | Detect no git repo → **ask for target directory (WHERE?)** |
| 2 | Ask for repository URL |
| 3 | Validate URL is accessible |
| 4 | **Ask EXPLICITLY for project name (WHAT?)** |
| 5 | Final confirmation with full path |
| 6 | Create organized structure and clone |

**Flow:**
```
User runs: /gitflow:1-init

→ "Where do you want to create your GitFlow project?"
  [Current directory] [C:/Dev] [~/projects] [Custom path]

→ "What repository do you want to clone?"
  [GitHub] [GitLab] [Azure DevOps] [Other]

→ "Enter the repository URL:"
  > https://github.com/myorg/my-awesome-project.git

→ "What should we name this project folder?"
  [my-awesome-project (Recommended)] [Custom name]

→ "Create GitFlow project with these settings?
    Project Name: my-awesome-project
    Location:     C:/Dev/
    Full Path:    C:/Dev/my-awesome-project/
    Repository:   https://github.com/myorg/my-awesome-project.git"
  [Yes, create project (Recommended)] [Change settings]

→ Creates structure and clones...
→ Opens in 02-Develop
```

### Existing Repo Mode

| Command | Action |
|---------|--------|
| `/gitflow:1-init` | Generate plan (asks if structure exists, asks for structure style) |
| `/gitflow:1-init --exec` | Execute existing plan |
| `/gitflow:1-init --yes` | Generate + execute without intermediate file |
| `/gitflow:1-init --migrate` | Force migration of existing structure to v1.3.0 |
| `/gitflow:1-init --reset` | Force reset (backup + recreate from scratch) |
| `/gitflow:1-init --organized` | Force organized structure (01-Main, 02-Develop) |
| `/gitflow:1-init --adjacent` | Force adjacent/legacy structure (../worktrees) |
| `/gitflow:1-init --no-worktrees` | Generate plan without worktrees |

---

## Migration Details

### v1.2 → v1.3 (Organized Structure)

When migrating to v1.3, these changes are available:

#### New Config Fields

```json
{
  "version": "1.3.0",
  "initMode": "organized",      // NEW - "organized" | "adjacent" | "clone" | "interactive"
  "worktrees": {
    "mode": "organized",        // NEW - matches initMode
    "bareRepo": "../.bare",     // NEW - path to bare repo (organized mode)
    "permanent": {
      "main": { "path": "../01-Main", "prefix": "01" },     // CHANGED - object with path/prefix
      "develop": { "path": "../02-Develop", "prefix": "02" } // CHANGED
    }
  }
}
```

#### Migration Options

```javascript
AskUserQuestion({
  questions: [{
    question: "v1.2 config detected. How would you like to upgrade?",
    header: "Migrate",
    options: [
      { label: "Keep adjacent", description: "Stay with ../worktrees structure (just update version)" },
      { label: "Convert to organized", description: "Restructure to 01-Main/, 02-Develop/, etc. (Recommended)" },
      { label: "Skip", description: "Keep v1.2 config unchanged" }
    ],
    multiSelect: false
  }]
})
```

#### Convert to Organized (if selected)

1. Backup current worktrees
2. Create new organized structure
3. Move worktree contents to new locations
4. Update config with new paths
5. Clean up old structure

---

### v1.0 → v1.2 (Legacy)

When migrating from v1.0/v1.1 to v1.2:

#### Config additions

```json
{
  "version": "1.2.0",
  "worktrees": {
    "enabled": true,
    "basePath": "../worktrees",
    "permanent": { "main": true, "develop": true },
    "structure": { "features": "features/", "releases": "releases/", "hotfixes": "hotfixes/" },
    "cleanupOnFinish": true
  },
  "efcore": {
    "crossBranch": {
      "enabled": true,
      "scanOnMigrationCreate": true,
      "blockOnConflict": true,
      "cacheExpiry": "1h"
    }
  },
  "workflow": {
    "push": {
      "afterCommit": "worktree",
      "afterFinish": "always"
    }
  }
}
```

#### Structure additions

```
.claude/gitflow/
├── backup/                    # NEW - for migration backups
├── cache/                     # NEW - for cross-branch scan cache
└── (existing folders preserved)
```

### Preserved during all migrations

- `versioning.source` and `versioning.sourceFile`
- `repository.*` settings
- `git.branches.*` custom branch names
- `efcore.contexts` list
- All existing plans and logs
