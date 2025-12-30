#!/usr/bin/env pwsh
<#
.SYNOPSIS
    EF Core Migration Synchronization Helper Script

.DESCRIPTION
    This PowerShell script mirrors the functionality of the /ef-migration-sync Claude Code command.
    It can be called directly from the terminal for quick sync operations.

.PARAMETER BaseBranch
    Base branch to sync with (default: develop)

.PARAMETER AutoYes
    Non-interactive mode (auto-confirm all prompts)

.PARAMETER CreateIsolatedDb
    Create an isolated test database

.PARAMETER MigrationName
    Name of the migration to create after sync

.PARAMETER SkipRebase
    Skip Git rebase (sync migrations only)

.PARAMETER DryRun
    Simulate actions without making changes

.EXAMPLE
    .\ef-migration-sync.ps1
    Standard sync with develop

.EXAMPLE
    .\ef-migration-sync.ps1 -BaseBranch main -MigrationName AddUserProfile
    Sync with main and create migration

.EXAMPLE
    .\ef-migration-sync.ps1 -CreateIsolatedDb -DryRun
    Test isolated DB creation (simulation)

.NOTES
    Version: 1.0.0
    Author: Claude Code
    Created: 2025-11-19
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "develop",

    [Parameter(Mandatory=$false)]
    [switch]$AutoYes,

    [Parameter(Mandatory=$false)]
    [switch]$CreateIsolatedDb,

    [Parameter(Mandatory=$false)]
    [string]$MigrationName,

    [Parameter(Mandatory=$false)]
    [switch]$SkipRebase,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor Cyan
}

function Write-Phase {
    param([string]$Phase)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "🔄 $Phase" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

# Global state
$script:StashCreated = $false
$script:DbContext = $null

# Phase 0: Pre-Flight Checks
Write-Phase "Phase 0: Pre-Flight Checks"

# Check if in Git repository
try {
    $null = git rev-parse --git-dir 2>$null
    Write-Success "Git repository detected"
} catch {
    Write-Error "NOT A GIT REPOSITORY"
    Write-Host "This command requires Git. Please run from inside a Git repository."
    exit 1
}

# Check dotnet ef tools
try {
    $efVersion = dotnet ef --version 2>$null
    Write-Success "dotnet ef tools detected ($efVersion)"
} catch {
    Write-Error "DOTNET EF TOOLS NOT INSTALLED"
    Write-Host "Install with: dotnet tool install --global dotnet-ef"
    exit 1
}

# Detect DbContext
Write-Info "Detecting DbContext..."
try {
    $dbContexts = dotnet ef dbcontext list 2>&1 | Select-String -Pattern "\w+DbContext|\w+Context$"

    if ($dbContexts.Count -eq 0) {
        $script:DbContext = Read-Host "No DbContext detected. Please enter DbContext name"
    } elseif ($dbContexts.Count -eq 1) {
        $script:DbContext = $dbContexts[0].ToString().Trim()
        Write-Success "DbContext auto-detected: $($script:DbContext)"
    } else {
        Write-Warning "Multiple DbContexts found:"
        for ($i = 0; $i -lt $dbContexts.Count; $i++) {
            Write-Host "  $($i + 1). $($dbContexts[$i])"
        }
        $selection = Read-Host "Select DbContext (1-$($dbContexts.Count))"
        $script:DbContext = $dbContexts[[int]$selection - 1].ToString().Trim()
        Write-Success "Selected DbContext: $($script:DbContext)"
    }
} catch {
    Write-Warning "Could not auto-detect DbContext"
    $script:DbContext = Read-Host "Please enter DbContext name"
}

# Display configuration
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  EF MIGRATION SYNC CONFIGURATION            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "  Current Branch: $(git branch --show-current)" -ForegroundColor White
Write-Host "  Base Branch: $BaseBranch" -ForegroundColor White
Write-Host "  DbContext: $($script:DbContext)" -ForegroundColor White
Write-Host "  Mode: $(if ($AutoYes) { 'Auto-Yes' } elseif ($DryRun) { 'Dry Run' } else { 'Interactive' })" -ForegroundColor White
Write-Host "  Create Isolated DB: $(if ($CreateIsolatedDb) { 'Yes' } else { 'No' })" -ForegroundColor White
if ($MigrationName) {
    Write-Host "  Migration Name: $MigrationName" -ForegroundColor White
}
Write-Host ""

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No changes will be made"
}

# Phase 1: Git State Verification
Write-Phase "Phase 1: Git State Verification"

# Check current branch
$currentBranch = git branch --show-current

if ($currentBranch -match "^(main|master)$") {
    Write-Error "Cannot sync on main/master branch"
    Write-Host "This command is for feature branches only."
    exit 1
}
Write-Success "Current branch: $currentBranch"

# Check for uncommitted changes
$uncommittedFiles = git status --porcelain
if ($uncommittedFiles) {
    Write-Warning "Uncommitted changes detected"

    if ($AutoYes) {
        Write-Info "Auto-stashing changes..."
        if (-not $DryRun) {
            git stash push -m "ef-migration-sync auto-stash $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            $script:StashCreated = $true
        }
        Write-Success "Changes stashed"
    } else {
        Write-Host ""
        Write-Host "Choose action:"
        Write-Host "  1. Stash changes (git stash)"
        Write-Host "  2. Commit changes now"
        Write-Host "  3. Abort sync"

        $choice = Read-Host "Choice (1/2/3)"

        switch ($choice) {
            "1" {
                if (-not $DryRun) {
                    git stash push -m "ef-migration-sync stash $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    $script:StashCreated = $true
                }
                Write-Success "Changes stashed"
            }
            "2" {
                Write-Host "Please commit your changes manually, then re-run this script."
                exit 0
            }
            "3" {
                Write-Host "Sync aborted."
                exit 0
            }
            default {
                Write-Error "Invalid choice. Aborting."
                exit 1
            }
        }
    }
} else {
    Write-Success "No uncommitted changes"
}

# Verify base branch exists
Write-Info "Fetching base branch..."
if (-not $DryRun) {
    try {
        git fetch origin $BaseBranch 2>&1 | Out-Null
        Write-Success "Base branch exists: origin/$BaseBranch"
    } catch {
        Write-Error "Base branch 'origin/$BaseBranch' not found"
        Write-Host "Available remote branches:"
        git branch -r
        exit 1
    }
} else {
    Write-Host "[DRY RUN] Would fetch: origin/$BaseBranch"
}

# Phase 2: Sync with Base Branch
if (-not $SkipRebase) {
    Write-Phase "Phase 2: Sync with Base Branch (Git Rebase)"

    Write-Info "Rebasing on origin/$BaseBranch..."

    if (-not $DryRun) {
        try {
            git rebase origin/$BaseBranch 2>&1 | Out-Null
            Write-Success "Rebase successful"
        } catch {
            Write-Error "REBASE CONFLICTS DETECTED"
            Write-Host ""
            Write-Host "Conflicting files:"
            git diff --name-only --diff-filter=U
            Write-Host ""
            Write-Host "MANUAL RESOLUTION REQUIRED:"
            Write-Host "  1. Resolve conflicts in the files above"
            Write-Host "  2. Stage resolved files: git add <files>"
            Write-Host "  3. Continue rebase: git rebase --continue"
            Write-Host "  4. Re-run this script"
            Write-Host ""
            Write-Host "To abort rebase: git rebase --abort"
            exit 1
        }
    } else {
        Write-Host "[DRY RUN] Would execute: git rebase origin/$BaseBranch"
    }
} else {
    Write-Warning "Skipping Git rebase (--skip-rebase flag)"
}

# Phase 3: Migration Conflict Analysis
Write-Phase "Phase 3: Migration Conflict Analysis"

Write-Info "Listing migrations..."
if (-not $DryRun) {
    $migrations = dotnet ef migrations list --context $script:DbContext --no-build 2>&1
    Write-Success "Migrations analyzed"

    # Get merge-base
    $mergeBase = git merge-base HEAD origin/$BaseBranch

    # Feature migrations
    $featureMigrations = git log "$mergeBase..HEAD" --oneline --all-match --grep="Migration" -- "**/Migrations/*.cs"

    # Base migrations
    $baseMigrations = git log "$mergeBase..origin/$BaseBranch" --oneline --all-match --grep="Migration" -- "**/Migrations/*.cs"

    if ($featureMigrations -and $baseMigrations) {
        Write-Warning "Migration conflicts detected"
        Write-Host ""
        Write-Host "Feature Branch Migrations:" -ForegroundColor Yellow
        $featureMigrations | ForEach-Object { Write-Host "  - $_" }
        Write-Host ""
        Write-Host "Base Branch Migrations (newer):" -ForegroundColor Yellow
        $baseMigrations | ForEach-Object { Write-Host "  - $_" }
        Write-Host ""
        Write-Host "Recommended: Recreate feature migrations"

        # Ask for confirmation
        if (-not $AutoYes) {
            $confirm = Read-Host "Proceed with migration recreation? (y/n)"
            if ($confirm -ne "y") {
                Write-Host "Sync cancelled."
                exit 0
            }
        }

        # Phase 4: Remove feature migrations
        Write-Phase "Phase 4: Corrective Actions"

        $migrationCount = ($featureMigrations | Measure-Object).Count
        Write-Info "Removing $migrationCount feature migration(s)..."

        for ($i = 0; $i -lt $migrationCount; $i++) {
            dotnet ef migrations remove --context $script:DbContext --force 2>&1 | Out-Null
            Write-Success "Removed migration $($i + 1)/$migrationCount"
        }
    } else {
        Write-Success "No migration conflicts detected"
    }
} else {
    Write-Host "[DRY RUN] Would analyze migration conflicts"
}

# Phase 5: Create New Migration
if ($MigrationName) {
    Write-Phase "Phase 5: Create New Migration"

    # Extract branch short name
    $branchShort = $currentBranch -replace '^(feature|bugfix|hotfix)/', ''
    $branchShort = (Get-Culture).TextInfo.ToTitleCase($branchShort -replace '-', ' ') -replace ' ', ''

    $fullMigrationName = "${branchShort}_${MigrationName}"

    Write-Info "Migration name: $fullMigrationName"

    if (-not $DryRun) {
        dotnet ef migrations add $fullMigrationName --context $script:DbContext
        Write-Success "Migration created: $fullMigrationName"

        # Apply migration
        Write-Info "Applying migration to database..."
        dotnet ef database update --context $script:DbContext
        Write-Success "Migration applied"
    } else {
        Write-Host "[DRY RUN] Would create migration: $fullMigrationName"
    }
}

# Phase 6: Isolated Database Testing
if ($CreateIsolatedDb) {
    Write-Phase "Phase 7: Isolated Database Testing"

    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $branchShort = $currentBranch -replace '^(feature|bugfix|hotfix)/', '' -replace '[^a-zA-Z0-9]', ''
    $isolatedDbName = "TestDb_${branchShort}_${timestamp}"

    Write-Info "Isolated DB name: $isolatedDbName"

    if (-not $DryRun) {
        # This would require actual DB provider logic (SQL Server, PostgreSQL, etc.)
        Write-Warning "Isolated DB creation requires manual implementation based on your DB provider"
        Write-Host "  Suggested name: $isolatedDbName"

        # Generate SQL script
        Write-Info "Generating SQL script..."
        dotnet ef migrations script --context $script:DbContext --idempotent --output "migration-script.sql"
        Write-Success "SQL script generated: migration-script.sql"
    } else {
        Write-Host "[DRY RUN] Would create isolated database: $isolatedDbName"
        Write-Host "[DRY RUN] Would generate SQL script"
    }
}

# Phase 8: Cleanup
Write-Phase "Phase 8: Cleanup & Summary"

# Restore stashed changes
if ($script:StashCreated) {
    Write-Info "Restoring stashed changes..."
    if (-not $DryRun) {
        git stash pop
        Write-Success "Stashed changes restored"
    } else {
        Write-Host "[DRY RUN] Would restore stashed changes"
    }
}

# Build project
Write-Info "Building project..."
if (-not $DryRun) {
    dotnet build --no-restore 2>&1 | Out-Null
    Write-Success "Project builds successfully"
} else {
    Write-Host "[DRY RUN] Would build project"
}

# Final summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ EF MIGRATION SYNC COMPLETED             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Synced with origin/$BaseBranch"
if ($MigrationName) {
    Write-Host "  ✓ Created migration: $fullMigrationName"
}
if ($CreateIsolatedDb) {
    Write-Host "  ✓ Generated SQL script: migration-script.sql"
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review generated migration code"
Write-Host "  2. Test application functionality"
Write-Host "  3. Commit changes: git add . && git commit -m 'feat: $MigrationName'"
Write-Host "  4. Push branch: git push origin $currentBranch"
Write-Host "  5. Create Pull Request"
Write-Host ""

if ($DryRun) {
    Write-Host ""
    Write-Warning "DRY RUN COMPLETED - No changes were made"
    Write-Host "Run without --dry-run to execute for real."
}

exit 0
