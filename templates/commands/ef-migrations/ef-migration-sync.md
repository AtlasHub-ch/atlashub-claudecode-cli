# Commande: /ef-migration-sync [options]

<role>
You are a senior .NET DevOps engineer with 10+ years experience in Git workflows and Entity Framework Core migrations, specializing in multi-branch database change management for enterprise teams. You have deep expertise in Git rebase strategies, EF Core migration conflict resolution, branch synchronization patterns, and production-ready database deployment workflows. You enforce Git best practices while maintaining data integrity across feature branches.
</role>

<parameters>
**Usage:** `/ef-migration-sync [options]`

**Options disponibles:**

- **`--base-branch <nom>`** - Branche de base pour synchronisation (défaut: develop)
- **`--auto-yes`** - Mode non-interactif (répond automatiquement "yes")
- **`--create-isolated-db`** - Créer automatiquement une DB de test isolée
- **`--migration-name <nom>`** - Nom de la migration à créer après sync
- **`--skip-rebase`** - Sauter la synchronisation Git (sync migrations seulement)
- **`--dry-run`** - Simuler les actions sans modifier les fichiers

**Exemples:**
```bash
/ef-migration-sync                                          # Sync standard avec develop
/ef-migration-sync --base-branch main                       # Sync avec main
/ef-migration-sync --migration-name AddUserProfile          # Sync + création migration
/ef-migration-sync --create-isolated-db                     # Sync + test DB
/ef-migration-sync --auto-yes --base-branch main            # Mode CI/CD
/ef-migration-sync --dry-run                                # Simulation seulement
```
</parameters>

<instructions>
This command automates the complete workflow for synchronizing Entity Framework Core migrations across feature branches. It handles Git rebase, migration conflict detection, automated recreation, and database testing.

**Auto-Detection:**
- Detects current branch and base branch (develop/main)
- Identifies DbContext automatically
- Detects migration conflicts (timestamp overlaps)
- Identifies uncommitted changes
- Auto-discovers connection strings for isolated DB

**What this command does:**
1. Verifies Git state (uncommitted changes, current branch)
2. Synchronizes with base branch via rebase
3. Analyzes migration conflicts (timestamp comparisons)
4. Proposes corrective actions (remove + recreate migrations)
5. Creates new migration with branch naming convention
6. Validates ModelSnapshot consistency
7. Optionally creates isolated test database
8. Generates deployment SQL scripts

**CRITICAL BEST PRACTICES:**
- ✅ **ALWAYS** sync before creating new migrations
- ✅ **ALWAYS** stash/commit changes before rebase
- ✅ **PREFER** recreating migrations over manual conflict resolution
- ✅ **ENFORCE** branch naming in migration names: `{BranchName}_{Description}`
- ⚠️ **NEVER** edit migration files manually after creation
- ⚠️ **NEVER** merge migrations from different branches
</instructions>

<context>
**Multi-Branch Migration Strategy:**

**Problem Solved:**
- **Timestamp Conflicts:** EF Core migrations use timestamps - feature branches diverge and create overlapping timestamps
- **ModelSnapshot Conflicts:** Multiple branches modifying same snapshot cause merge conflicts
- **Database State:** Testing migrations requires DB state matching base branch
- **Deployment Risk:** Deploying migrations in wrong order causes production failures

**Solution Pattern:**
1. **Before starting work on feature:**
   - Sync with base branch (`git rebase origin/develop`)
   - Check for migration conflicts
   - Recreate feature migrations if base has new migrations
2. **During development:**
   - Recreate same migration as models change (1 migration per feature)
   - Test against isolated database
3. **Before PR/merge:**
   - Final sync with base branch
   - Validate migration order
   - Test clean deployment

**Git Workflow Integration:**
```
Feature Branch Workflow:
1. git checkout -b feature/user-profile
2. /ef-migration-sync --base-branch develop        # Sync first!
3. Make model changes
4. /db-migration                                    # Create migration
5. Continue development...
6. /ef-migration-sync --migration-name AddUserProfile  # Sync + recreate if needed
7. /ef-migration-sync --create-isolated-db          # Final validation
8. git push + create PR
```

**Migration Conflict Detection:**
- Compare timestamps of feature migrations vs base migrations
- Identify "outdated" migrations (created before base migrations)
- Flag ModelSnapshot divergence
- Detect duplicate migration names
</context>

<workflow>

## Phase 0: Pre-Flight Checks

**Step 0.1: Validate Environment**

```bash
# Check Git repository
git status

# Check for dotnet ef tool
dotnet ef --version

# Detect DbContext
dotnet ef dbcontext list 2>/dev/null
```

**Validations:**
- [ ] Inside Git repository
- [ ] `dotnet ef` tools installed
- [ ] DbContext detected (auto-select or prompt)

**If NOT in Git repo:**
```
❌ ERROR: Not a Git repository
This command requires Git for branch synchronization.
Please run from inside a Git repository.
```

**If dotnet ef not found:**
```
❌ ERROR: EF Core tools not installed
Install with: dotnet tool install --global dotnet-ef
```

**Step 0.2: Parse Command Options**

Parse command-line options:
- `--base-branch` → Store in `$baseBranch` (default: "develop")
- `--auto-yes` → Store in `$autoYes` (default: false)
- `--create-isolated-db` → Store in `$createIsolatedDb` (default: false)
- `--migration-name` → Store in `$migrationName` (default: null)
- `--skip-rebase` → Store in `$skipRebase` (default: false)
- `--dry-run` → Store in `$dryRun` (default: false)

**Step 0.3: Detect DbContext**

Same logic as `/db-migration`:
- If multiple → Ask user to select
- If one → Auto-select
- If none → Prompt for name

Store in `$dbContext` variable.

**Step 0.4: Display Configuration**

```markdown
🔄 EF Migration Sync Configuration

**Current Branch:** {currentBranch}
**Base Branch:** {baseBranch}
**DbContext:** {dbContext}
**Mode:** {Interactive / Auto-Yes / Dry Run}
**Create Isolated DB:** {Yes / No}
**Migration Name:** {migrationName or "TBD"}
```

If `--dry-run`:
```
⚠️  DRY RUN MODE - No changes will be made
```

---

## Phase 1: Git State Verification

**Step 1.1: Check Current Branch**

```bash
$currentBranch = git branch --show-current
```

**Validations:**
- If `main` or `master` → **STOP** with error
- If `develop` → **WARN** but allow (might be syncing develop with main)
- If feature branch → Proceed

**Error if on main:**
```
❌ ERROR: Cannot sync on main/master branch
This command is for feature branches only.
Please checkout a feature branch first.
```

**Step 1.2: Check Uncommitted Changes**

```bash
git status --porcelain
```

**If uncommitted changes detected:**

If `--auto-yes` is false:
```
⚠️  UNCOMMITTED CHANGES DETECTED

You have uncommitted changes. Choose action:
1. Stash changes (git stash)
2. Commit changes now
3. Abort sync

Choice (1/2/3):
```

If `--auto-yes` is true:
```
⚠️  Auto-stashing uncommitted changes...
```

```bash
git stash push -m "ef-migration-sync auto-stash $(date)"
```

Store `$stashCreated = true` to pop later.

**Step 1.3: Verify Base Branch Exists**

```bash
git fetch origin $baseBranch
```

**If base branch not found:**
```
❌ ERROR: Base branch 'origin/{baseBranch}' not found
Available remote branches:
{list branches}

Use --base-branch to specify correct base branch.
```

---

## Phase 2: Sync with Base Branch (Git Rebase)

**Skip if `--skip-rebase` is true**

**Step 2.1: Fetch Latest Changes**

```bash
git fetch origin $baseBranch
```

Output:
```
✓ Fetched latest changes from origin/{baseBranch}
```

**Step 2.2: Perform Rebase**

```bash
git rebase origin/$baseBranch
```

**If rebase succeeds:**
```
✓ Successfully rebased on origin/{baseBranch}
```

**If rebase conflicts:**

```
❌ REBASE CONFLICTS DETECTED

Conflicting files:
{list conflicted files}

MANUAL RESOLUTION REQUIRED:
1. Resolve conflicts in the files above
2. Stage resolved files: git add <files>
3. Continue rebase: git rebase --continue
4. Re-run this command: /ef-migration-sync

To abort rebase: git rebase --abort
```

**STOP** execution - conflicts must be resolved manually.

**If `--dry-run` is true:**
```
[DRY RUN] Would execute: git rebase origin/{baseBranch}
```

---

## Phase 3: Migration Conflict Analysis

**Step 3.1: List All Migrations**

```bash
# List migrations with timestamps
dotnet ef migrations list --context $dbContext --no-build
```

Parse output to extract migration names and timestamps.

**Step 3.2: Identify Base Migrations vs Feature Migrations**

```bash
# Get merge-base commit (where feature branch diverged)
$mergeBase = git merge-base HEAD origin/$baseBranch

# List migrations added in feature branch
$featureMigrations = git log $mergeBase..HEAD --oneline --grep="Migration" -- "**/Migrations/*.cs"

# List migrations added in base branch since divergence
$baseMigrations = git log $mergeBase..origin/$baseBranch --oneline --grep="Migration" -- "**/Migrations/*.cs"
```

**Step 3.3: Detect Timestamp Conflicts**

For each feature migration:
- Extract timestamp (first 14 chars of filename: `YYYYMMDDHHmmss`)
- Compare with base migration timestamps
- If feature timestamp < any base timestamp → **CONFLICT**

**Conflict Report:**
```markdown
⚠️  MIGRATION CONFLICTS DETECTED

**Feature Branch Migrations:**
- 20241115120000_AddUserProfile (2024-11-15 12:00)
- 20241116090000_AddUserPermissions (2024-11-16 09:00)

**Base Branch Migrations (newer):**
- 20241116100000_AddProductsTable (2024-11-16 10:00)  ← NEWER!

**Problem:**
Your migration '20241116090000_AddUserPermissions' has timestamp BEFORE
base migration '20241116100000_AddProductsTable'.

EF Core will apply migrations in timestamp order, causing issues.

**Recommended Action:**
Recreate your feature migrations to get new timestamps AFTER base migrations.
```

**If NO conflicts:**
```
✓ No migration conflicts detected
✓ All feature migrations have timestamps after base migrations
```

**Step 3.4: Check ModelSnapshot Divergence**

```bash
# Check if ModelSnapshot has conflicts
git diff origin/$baseBranch -- "**/Migrations/*ModelSnapshot.cs"
```

If divergence detected:
```
⚠️  ModelSnapshot has diverged from base branch
This is expected - will be regenerated when migrations are recreated.
```

---

## Phase 4: Corrective Actions (Migration Recreation)

**Skip if no conflicts detected in Phase 3**

**Step 4.1: Confirm Recreate Action**

If `--auto-yes` is false:
```
🔧 CORRECTIVE ACTION REQUIRED

To fix migration conflicts, we need to:
1. Remove {X} feature migration(s)
2. Recreate migration(s) with new timestamps
3. Apply to database for validation

This will:
✓ Fix timestamp ordering
✓ Regenerate ModelSnapshot
✓ Maintain your schema changes

Proceed with migration recreation? (y/n):
```

If `--auto-yes` is true:
```
🔧 Auto-recreating migrations to fix conflicts...
```

**Step 4.2: Remove Feature Migrations**

For each feature migration (oldest first):
```bash
dotnet ef migrations remove --context $dbContext --force
```

Output:
```
✓ Removed migration: {MigrationName}
```

Repeat until all feature migrations are removed.

**Step 4.3: Verify Clean State**

```bash
dotnet ef migrations list --context $dbContext
```

Expected: Only base migrations remain.

```
✓ All feature migrations removed
✓ Database reset to base branch state
```

**If `--dry-run` is true:**
```
[DRY RUN] Would remove migrations:
- {Migration1}
- {Migration2}
```

---

## Phase 5: Create New Migration

**Skip if `--migration-name` not provided AND conflicts were not detected**

**Step 5.1: Determine Migration Name**

If `$migrationName` is provided:
- Use provided name
Else:
- Prompt user: "Enter migration name (2-5 words):"

**Step 5.2: Construct Migration Name with Branch Prefix**

Extract branch name components:
```bash
# Example: feature/user-profile → UserProfile
# Example: bugfix/fix-orders → FixOrders
$branchShort = $currentBranch -replace '^(feature|bugfix|hotfix)/', '' |
               ConvertTo-PascalCase
```

**Migration Naming Convention:**
```
Format: {BranchShort}_{MigrationDescription}

Examples:
- Branch: feature/user-profile → UserProfile_AddEmailField
- Branch: bugfix/fix-orders → FixOrders_UpdateStatusEnum
```

Construct full name:
```
$fullMigrationName = "{$branchShort}_{$migrationName}"
```

**Validate:**
- [ ] PascalCase format
- [ ] Length ≤ 80 characters
- [ ] No special characters except underscore

**Step 5.3: Create Migration**

```bash
dotnet ef migrations add $fullMigrationName --context $dbContext
```

Output:
```
✓ Migration created: {fullMigrationName}
✓ ModelSnapshot regenerated
```

**Step 5.4: Verify Generated Migration**

Read migration file and check:
- [ ] Uses RenameColumn (not Drop+Add)
- [ ] NOT NULL columns have defaultValue
- [ ] No SQL injection risks
- [ ] Foreign keys reference correct tables

Display summary:
```markdown
📝 Migration Code Review

**File:** Migrations/{timestamp}_{fullMigrationName}.cs

**Changes Detected:**
- AddColumn: Users.Email (string, nullable)
- CreateIndex: IX_Users_Email
- AddColumn: Users.ProfileImage (string, nullable)

**Validations:**
✓ No data loss risks detected
✓ All NOT NULL columns have default values
✓ No raw SQL detected
```

**If `--dry-run` is true:**
```
[DRY RUN] Would create migration: {fullMigrationName}
```

---

## Phase 6: Database Validation

**Step 6.1: Apply Migration to Current Database**

```bash
dotnet ef database update --context $dbContext
```

Output:
```
✓ Migration applied to database
```

**If errors occur:**
```
❌ Migration failed to apply

Error: {error message}

Common fixes:
- Check connection string in appsettings.json
- Verify database exists
- Check for missing defaultValue on NOT NULL columns
```

**Step 6.2: Verify Migration List**

```bash
dotnet ef migrations list --context $dbContext
```

Display:
```markdown
📋 Final Migration Order

**Applied Migrations:**
1. 20241110100000_InitialCreate (base)
2. 20241115080000_AddProductsTable (base)
3. 20241116100000_AddOrdersTable (base)
4. {timestamp}_{fullMigrationName} (feature) ✓ NEW

**Status:** All migrations applied successfully
**Migration Count:** {total}
```

**If `--dry-run` is true:**
```
[DRY RUN] Would apply migration to database
```

---

## Phase 7: Isolated Database Testing (Optional)

**Skip if `--create-isolated-db` is false**

**Step 7.1: Detect Connection String**

Read `appsettings.json` or `appsettings.Development.json`:
```bash
$connectionString = Get-Content appsettings.json | ConvertFrom-Json |
                    Select -ExpandProperty ConnectionStrings |
                    Select -ExpandProperty DefaultConnection
```

**Step 7.2: Create Isolated Database Name**

```
Original DB: MyAppDb
Isolated DB: MyAppDb_FeatureTest_{branchShort}_{timestamp}

Example: MyAppDb_FeatureTest_UserProfile_20241116
```

**Step 7.3: Create Isolated Database**

**For SQL Server:**
```sql
CREATE DATABASE MyAppDb_FeatureTest_{branchShort}_{timestamp}
```

**For PostgreSQL:**
```sql
CREATE DATABASE "myappdb_featuretest_{branchshort}_{timestamp}"
```

Execute via:
```bash
sqlcmd -S {server} -Q "CREATE DATABASE {isolatedDb}" # SQL Server
psql -c "CREATE DATABASE {isolatedDb}" # PostgreSQL
```

**Step 7.4: Apply All Migrations to Isolated DB**

Update connection string temporarily, then:
```bash
dotnet ef database update --context $dbContext --connection "{isolatedConnectionString}"
```

Output:
```
✓ Isolated database created: {isolatedDb}
✓ All migrations applied successfully
```

**Step 7.5: Generate SQL Script**

```bash
dotnet ef migrations script --context $dbContext --idempotent --output migration-script.sql
```

Output:
```
✓ SQL script generated: migration-script.sql
✓ Script is idempotent (safe to run multiple times)
```

**If `--dry-run` is true:**
```
[DRY RUN] Would create isolated database: {isolatedDb}
[DRY RUN] Would generate SQL script
```

---

## Phase 8: Cleanup & Summary

**Step 8.1: Restore Stashed Changes**

If `$stashCreated` is true:
```bash
git stash pop
```

Output:
```
✓ Restored previously stashed changes
```

**Step 8.2: Build Project**

```bash
dotnet build
```

Output:
```
✓ Project builds successfully
```

**Step 8.3: Display Final Summary**

```markdown
✅ EF MIGRATION SYNC COMPLETED

## Summary

**Current Branch:** {currentBranch}
**Base Branch:** {baseBranch}
**DbContext:** {dbContext}

## Actions Performed

✓ Rebased on origin/{baseBranch}
✓ Analyzed migration conflicts
✓ Recreated {X} feature migration(s)
✓ Applied migrations to database
{✓ Created isolated test database: {isolatedDb}}
{✓ Generated SQL script: migration-script.sql}

## Final State

**Total Migrations:** {totalMigrations}
**Feature Migrations:** {featureMigrationCount}
**Migration Name:** {fullMigrationName}
**ModelSnapshot:** ✓ Synchronized

## Validation

✓ All migrations applied successfully
✓ Database schema matches model
✓ No timestamp conflicts
✓ Project builds without errors

## Next Steps

1. Review generated migration code
2. Test application functionality
3. Commit changes: git add . && git commit -m "feat: {migrationName}"
4. Push branch: git push origin {currentBranch}
5. Create Pull Request

## Files Modified

- Migrations/{timestamp}_{fullMigrationName}.cs
- Migrations/{dbContext}ModelSnapshot.cs
{- migration-script.sql (generated)}

---

💡 **Best Practice Tip:**
Before merging to {baseBranch}, run `/ef-migration-sync --dry-run` to verify no new conflicts.
```

**If `--dry-run` was true:**
```markdown
📋 DRY RUN SUMMARY

**No changes were made.**

## Actions That Would Be Performed

- Rebase on origin/{baseBranch}
- Remove {X} conflicting migration(s)
- Create new migration: {fullMigrationName}
- Apply to database
{- Create isolated DB: {isolatedDb}}

## To Execute

Run without --dry-run flag:
/ef-migration-sync {original options without --dry-run}
```

---

</workflow>

<error_handling>

## Error Scenarios

**Error 1: Git Rebase Conflicts**
```markdown
❌ REBASE CONFLICTS - MANUAL RESOLUTION REQUIRED

**Conflicting Files:**
{list files}

**Steps to Resolve:**
1. Open conflicted files in editor
2. Resolve conflicts (keep/merge changes)
3. Stage resolved files: git add {files}
4. Continue rebase: git rebase --continue
5. Re-run: /ef-migration-sync

**To Abort:**
git rebase --abort
```

**Error 2: Migration Apply Fails**
```markdown
❌ MIGRATION FAILED TO APPLY

**Error:** {error message}

**Common Causes:**
- Database connection failed (check connection string)
- NOT NULL column without defaultValue
- Foreign key references missing table
- Data type mismatch

**Troubleshooting:**
1. Check appsettings.json connection string
2. Verify database exists and is accessible
3. Review migration code for issues
4. Run: dotnet ef migrations remove
5. Fix issues and recreate migration
```

**Error 3: Uncommitted Changes on Auto-Yes**
```markdown
⚠️  AUTO-YES MODE: Stashing uncommitted changes...

**Stashed Changes:**
{list modified files}

**To Restore Later:**
git stash pop

**Stash Reference:** {stash id}
```

**Error 4: Base Branch Not Found**
```markdown
❌ BASE BRANCH NOT FOUND: origin/{baseBranch}

**Available Remote Branches:**
{list available branches}

**Fix:**
Use correct base branch name:
/ef-migration-sync --base-branch {correct-name}

**Or fetch all branches:**
git fetch --all
```

**Error 5: EF Tools Not Found**
```markdown
❌ DOTNET EF TOOLS NOT INSTALLED

**Install Command:**
dotnet tool install --global dotnet-ef

**Or Update Existing:**
dotnet tool update --global dotnet-ef

**Verify Installation:**
dotnet ef --version
```

**Error 6: Not a Git Repository**
```markdown
❌ NOT A GIT REPOSITORY

This command requires Git for branch synchronization.

**Fix:**
1. Navigate to project root: cd path/to/project
2. Initialize Git: git init
3. Or check you're in correct directory: pwd
```

</error_handling>

<output_format>

## Progress Indicators

Use clear visual indicators for each phase:

```markdown
🔄 Phase 1: Git State Verification
  ✓ Current branch: {branch}
  ✓ Uncommitted changes: {stashed/none}
  ✓ Base branch exists: origin/{baseBranch}

🔄 Phase 2: Sync with Base Branch
  ✓ Fetched latest changes
  ✓ Rebase successful

🔄 Phase 3: Migration Conflict Analysis
  ⚠️  {X} conflicts detected
  ✓ ModelSnapshot analyzed

🔄 Phase 4: Corrective Actions
  ✓ Removed {X} outdated migrations
  ✓ Database reset to base state

🔄 Phase 5: Create New Migration
  ✓ Migration name: {fullMigrationName}
  ✓ Migration created successfully
  ✓ Code review passed

🔄 Phase 6: Database Validation
  ✓ Migration applied
  ✓ Migration order validated

🔄 Phase 7: Isolated Database Testing
  ✓ Isolated DB created: {isolatedDb}
  ✓ All migrations applied
  ✓ SQL script generated

🔄 Phase 8: Cleanup
  ✓ Stashed changes restored
  ✓ Project builds successfully
```

</output_format>

---

## 📋 Command Reference

**Basic Usage:**
```bash
/ef-migration-sync
```

**With Options:**
```bash
/ef-migration-sync --base-branch develop --migration-name AddUserProfile
/ef-migration-sync --create-isolated-db --auto-yes
/ef-migration-sync --dry-run
```

**Common Workflows:**

**Workflow 1: Daily Sync (Before Starting Work)**
```bash
# Sync with develop, no migration creation
/ef-migration-sync --base-branch develop
```

**Workflow 2: Sync + Create Migration**
```bash
# Sync and immediately create feature migration
/ef-migration-sync --migration-name AddEmailNotifications
```

**Workflow 3: Pre-PR Validation**
```bash
# Test sync with isolated database
/ef-migration-sync --create-isolated-db --dry-run
```

**Workflow 4: CI/CD Pipeline**
```bash
# Non-interactive mode for automation
/ef-migration-sync --auto-yes --skip-rebase --migration-name AutoMigration
```

---

**Version:** 1.0.0 (User-Level)
**Scope:** Global - Works with any .NET EF Core project
**Created:** 2025-11-19
**Author:** Claude Code
**Dependencies:** Git, dotnet-ef tools, EF Core 6.0+

---

## 🎯 Best Practices Integration

This command enforces:
1. **Git-First Workflow:** Always sync before creating migrations
2. **Branch Naming Convention:** Migrations named after feature branches
3. **Conflict Prevention:** Auto-detects and fixes timestamp conflicts
4. **Database Safety:** Isolated testing before merge
5. **Clean History:** One migration per feature (recreate pattern)

Use in combination with `/db-migration` for complete EF Core workflow:
- `/ef-migration-sync` → Sync with base branch
- `/db-migration` → Create/recreate feature migration
- `/db-migration verify` → Validate before commit
- `/ef-migration-sync --dry-run` → Pre-PR check

