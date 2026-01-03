---
description: Rebase ModelSnapshot on develop and regenerate migration
agent: efcore-rebase-snapshot
model: sonnet
---

# EF Core Rebase-Snapshot - Resync with Develop

Rebases the ModelSnapshot on develop and regenerates a consolidated migration. Used when conflict is detected.

**USAGE:** After `/efcore:conflicts` signals a HIGH conflict.

**WARNING:** This operation modifies migration files. A backup is created automatically.

---

## STEP 1: Check prerequisites

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check that it's a feature/release/hotfix branch
if [[ ! $CURRENT_BRANCH =~ ^(feature|release|hotfix)/ ]]; then
  echo "ERROR: This command can only be executed from a GitFlow branch"
  exit 1
fi

# Check that working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working directory not clean"
  echo "Commit or stash your changes first"
  exit 1
fi

# Find EF Core project
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; 2>/dev/null | head -1)
if [ -z "$CSPROJ" ]; then
  echo "ERROR: No EF Core project found"
  exit 1
fi

PROJECT_DIR=$(dirname "$CSPROJ")
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"
echo "Project: $PROJECT_DIR"
echo "Migrations: $MIGRATIONS_DIR"
```

---

## STEP 2: Backup current migrations

```bash
BACKUP_DIR=".claude/gitflow/backup/migrations/rebase_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "BACKUP"
echo "======"
cp "$MIGRATIONS_DIR"/*.cs "$BACKUP_DIR/" 2>/dev/null
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
echo "  $BACKUP_COUNT files backed up to $BACKUP_DIR"
```

---

## STEP 3: Identify this branch's migrations

```bash
# Find migrations added on this branch (not on develop)
echo ""
echo "THIS BRANCH'S MIGRATIONS"
echo "==========================="

# Get migration list on develop
DEVELOP_MIGRATIONS=$(git show develop:$MIGRATIONS_DIR 2>/dev/null | grep "\.cs$" | grep -v "Designer" | grep -v "Snapshot")

# Local migrations
LOCAL_MIGRATIONS=$(ls -1 "$MIGRATIONS_DIR"/*.cs 2>/dev/null | xargs -n1 basename | grep -v "Designer" | grep -v "Snapshot")

# New migrations (on this branch but not on develop)
BRANCH_MIGRATIONS=""
for migration in $LOCAL_MIGRATIONS; do
  if ! echo "$DEVELOP_MIGRATIONS" | grep -q "$migration"; then
    BRANCH_MIGRATIONS="$BRANCH_MIGRATIONS $migration"
    echo "  + $migration"
  fi
done

if [ -z "$BRANCH_MIGRATIONS" ]; then
  echo "  No migration specific to this branch"
  echo "  Nothing to rebase"
  exit 0
fi
```

---

## STEP 4: Reset ModelSnapshot on develop

```bash
echo ""
echo "RESET MODELSNAPSHOT"
echo "==================="

# Get develop's ModelSnapshot
git fetch origin develop
SNAPSHOT_FILE=$(find "$MIGRATIONS_DIR" -name "*ModelSnapshot.cs" | head -1)
SNAPSHOT_NAME=$(basename "$SNAPSHOT_FILE")

git checkout origin/develop -- "$MIGRATIONS_DIR/$SNAPSHOT_NAME"
echo "  ModelSnapshot reset on develop"
```

---

## STEP 5: Delete this branch's migrations

```bash
echo ""
echo "DELETE BRANCH MIGRATIONS"
echo "=============================="

for migration in $BRANCH_MIGRATIONS; do
  BASE_NAME="${migration%.cs}"
  rm -f "$MIGRATIONS_DIR/$BASE_NAME.cs"
  rm -f "$MIGRATIONS_DIR/$BASE_NAME.Designer.cs"
  echo "  - $BASE_NAME"
done
```

---

## STEP 6: Regenerate consolidated migration

```bash
echo ""
echo "REGENERATE MIGRATION"
echo "======================"

# Extract branch info for name
BRANCH_TYPE=$(echo "$CURRENT_BRANCH" | cut -d'/' -f1)
BRANCH_NAME=$(echo "$CURRENT_BRANCH" | cut -d'/' -f2 | sed 's/-/_/g' | sed 's/.*/\u&/')

# Version
VERSION=$(grep -oP '(?<=<Version>).*(?=</Version>)' "$CSPROJ" 2>/dev/null | head -1 || echo "1.0.0")
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')

# Migration name
case $BRANCH_TYPE in
  "feature")
    MIGRATION_NAME="Feature_${VERSION_CLEAN}_${BRANCH_NAME}_Consolidated"
    ;;
  "hotfix")
    MIGRATION_NAME="Hotfix_${VERSION_CLEAN}_${BRANCH_NAME}_Fix"
    ;;
  "release")
    MIGRATION_NAME="Release_${VERSION_CLEAN}_Consolidated"
    ;;
  *)
    MIGRATION_NAME="Branch_${VERSION_CLEAN}_${BRANCH_NAME}"
    ;;
esac

echo "Name: $MIGRATION_NAME"

cd "$PROJECT_DIR"
dotnet ef migrations add "$MIGRATION_NAME" --verbose

if [ $? -eq 0 ]; then
  echo "  Migration created successfully"
else
  echo "  ERROR: Failed to create migration"
  echo "  Restoring backup..."
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
```

---

## STEP 7: Validation

```bash
echo ""
echo "VALIDATION"
echo "=========="

# Build
dotnet build --no-restore
if [ $? -ne 0 ]; then
  echo "  ERROR: Build failed"
  echo "  Restoring backup..."
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
echo "  Build: OK"

# Check that migration can generate script
dotnet ef migrations script --no-build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "  ERROR: Script generation failed"
  exit 1
fi
echo "  Script: OK"
```

---

## STEP 8: Summary

```
================================================================================
                    REBASE-SNAPSHOT COMPLETE
================================================================================

BRANCH:          {current_branch}
BACKUP:          {backup_dir}

BEFORE:
  Migrations:    {old_migrations}
  ModelSnapshot: {old_hash}

AFTER:
  Migration:     {new_migration_name}
  ModelSnapshot: {new_hash} (= develop)

================================================================================
NEXT STEPS
================================================================================

1. Check migration content
2. Test: /efcore:db-reset && /efcore:db-deploy
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
| `--name <name>` | Force a specific migration name |
| `--dry-run` | Show what would be done without executing |

---

## When to use

| Situation | Action |
|-----------|--------|
| `/efcore:conflicts` returns HIGH | Use rebase-snapshot |
| Merge conflict on ModelSnapshot | Use rebase-snapshot |
| Multiple migrations to consolidate | Use rebase-snapshot |
| Broken migration | Use rebase-snapshot |
