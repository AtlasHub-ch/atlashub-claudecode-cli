---
description: Merge multiple migrations into one (for releases)
agent: efcore-squash
model: sonnet
---

# EF Core Squash - Consolidate Migrations

Merges multiple migrations into a single consolidated migration. Typically used before a release.

**USAGE:** Before creating a release branch to clean up migration history.

**WARNING:** This operation is **DESTRUCTIVE**. Migration history will be lost.

---

## STEP 1: Check prerequisites

```bash
# Check branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check clean state
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working directory not clean"
  exit 1
fi

# Find EF Core project
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"

# List migrations
ALL_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -v "Designer" | grep -v "Snapshot" | sort)
MIGRATION_COUNT=$(echo "$ALL_MIGRATIONS" | grep -c "." || echo "0")

echo "Migrations found: $MIGRATION_COUNT"
```

---

## STEP 2: Request confirmation

```javascript
AskUserQuestion({
  questions: [{
    question: "You are about to merge " + MIGRATION_COUNT + " migrations into one. This operation is DESTRUCTIVE. Continue?",
    header: "Squash",
    options: [
      { label: "Yes, squash", description: "Merge all migrations (recommended for release)" },
      { label: "Selective", description: "Choose migrations to merge" },
      { label: "Cancel", description: "Do nothing" }
    ],
    multiSelect: false
  }]
})
```

---

## STEP 3: Full backup

```bash
# Create backup
BACKUP_DIR=".claude/gitflow/backup/migrations/squash_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backup to $BACKUP_DIR"
cp "$MIGRATIONS_DIR"/*.cs "$BACKUP_DIR/"
echo "  $(ls -1 "$BACKUP_DIR" | wc -l) files backed up"

# Also backup current DB schema
dotnet ef dbcontext script > "$BACKUP_DIR/schema_before_squash.sql" 2>/dev/null
```

---

## STEP 4: Delete all migrations

```bash
echo "Deleting migrations..."

# Keep ModelSnapshot for reference
cp "$MIGRATIONS_DIR"/*ModelSnapshot.cs "$BACKUP_DIR/ModelSnapshot_backup.cs"

# Delete all migration files
for file in $(find "$MIGRATIONS_DIR" -name "*.cs" -not -name "*ModelSnapshot.cs"); do
  rm -f "$file"
  echo "  - $(basename "$file")"
done

# Reset ModelSnapshot (optional - EF will regenerate it)
# rm "$MIGRATIONS_DIR"/*ModelSnapshot.cs
```

---

## STEP 5: Create consolidated migration

```bash
# Version
VERSION=$(grep -oP '(?<=<Version>).*(?=</Version>)' "$CSPROJ" 2>/dev/null | head -1 || echo "1.0.0")
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')

# Migration name
if [[ "$CURRENT_BRANCH" == release/* ]]; then
  MIGRATION_NAME="Release_${VERSION_CLEAN}_Initial"
else
  MIGRATION_NAME="Consolidated_${VERSION_CLEAN}_AllMigrations"
fi

echo ""
echo "Creating consolidated migration: $MIGRATION_NAME"

cd "$PROJECT_DIR"
dotnet ef migrations add "$MIGRATION_NAME" --verbose

if [ $? -eq 0 ]; then
  echo "  Migration created"
else
  echo "  ERROR - restoring backup"
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
```

---

## STEP 6: Generate idempotent SQL script

```bash
# Generate SQL script for deployment
SCRIPTS_DIR="./scripts/migrations"
mkdir -p "$SCRIPTS_DIR"

SCRIPT_NAME="${MIGRATION_NAME}.sql"
dotnet ef migrations script --idempotent -o "$SCRIPTS_DIR/$SCRIPT_NAME"

if [ $? -eq 0 ]; then
  echo "  SQL script generated: $SCRIPTS_DIR/$SCRIPT_NAME"
else
  echo "  Unable to generate SQL script"
fi
```

---

## STEP 7: Validation

```bash
echo ""
echo "Validation..."

# Build
dotnet build --no-restore
if [ $? -ne 0 ]; then
  echo "  ERROR: Build failed"
  exit 1
fi
echo "  Build OK"

# Check that migration can be applied (dry run)
dotnet ef migrations script --no-build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "  ERROR: Script generation failed"
  exit 1
fi
echo "  Script generation OK"
```

---

## STEP 8: Summary

```
================================================================================
                    SQUASH COMPLETE
================================================================================

BRANCH:          {current_branch}
BACKUP:          {backup_dir}

BEFORE:
  Migrations: {old_count}

AFTER:
  Migration:  {migration_name}
  SQL Script: scripts/migrations/{script_name}.sql

================================================================================
IMPORTANT - PRODUCTION
================================================================================

If your production database already has applied migrations:
1. DO NOT apply this consolidated migration directly
2. Use the idempotent SQL script
3. Or mark migration as applied:
   dotnet ef database update {migration_name} --connection "..." -- --skip-apply

================================================================================
NEXT STEPS
================================================================================

1. Check consolidated migration content
2. Test on dev DB: /efcore:db-reset && /efcore:db-deploy
3. Commit: /gitflow:3-commit

================================================================================
RESTORE (if needed)
================================================================================

cp {backup_dir}/*.cs {migrations_dir}/

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--no-backup` | Don't create backup (dangerous) |
| `--no-script` | Don't generate SQL script |
| `--name <name>` | Force a migration name |
| `--keep-snapshot` | Keep current ModelSnapshot |
| `--dry-run` | Show without executing |

---

## When to use Squash

| Situation | Use Squash? |
|-----------|-------------|
| Before release | YES - clean up history |
| After merging multiple features | YES - consolidate |
| In production | NO - use SQL scripts |
| Feature branch in progress | CAUTION - prefer rebase-snapshot |
