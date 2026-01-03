---
description: Create or recreate the EF Core migration for the current branch (1 migration per feature)
agent: efcore-migration
model: sonnet
---

# EF Core Migration - 1 Migration per Feature

Creates or recreates the unique migration for the current branch.

**GOLDEN RULE: 1 single migration per feature/hotfix. If it already exists, delete and recreate it.**

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

---

## STEP 0: Cross-Branch Validation (v1.2)

**NEW:** Before creating a migration, check for conflicts with other branches.

```bash
# Check if cross-branch validation is enabled
CROSS_BRANCH_ENABLED=$(git config --get efcore.crossBranch.enabled 2>/dev/null || echo "true")
BLOCK_ON_CONFLICT=$(git config --get efcore.crossBranch.blockOnConflict 2>/dev/null || echo "true")

if [ "$CROSS_BRANCH_ENABLED" = "true" ]; then
  echo "Cross-branch validation..."

  # Scan other branches via worktrees
  WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")

  if [ -d "$WORKTREE_BASE/develop" ]; then
    # Compare ModelSnapshot with develop
    LOCAL_SNAPSHOT=$(find . -name "*ModelSnapshot.cs" -not -path "*/node_modules/*" | head -1)
    DEVELOP_SNAPSHOT=$(find "$WORKTREE_BASE/develop" -name "*ModelSnapshot.cs" | head -1)

    if [ -n "$LOCAL_SNAPSHOT" ] && [ -n "$DEVELOP_SNAPSHOT" ]; then
      if ! diff -q "$LOCAL_SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
        # Differences detected - analyze risk level
        DIFF_LINES=$(diff "$DEVELOP_SNAPSHOT" "$LOCAL_SNAPSHOT" 2>/dev/null | wc -l)

        if [ "$DIFF_LINES" -gt 100 ]; then
          echo ""
          echo "WARNING: CROSS-BRANCH CONFLICT DETECTED"
          echo ""
          echo "Your ModelSnapshot differs significantly from develop."
          echo "Differences: $DIFF_LINES lines"
          echo ""
          echo "RESOLUTIONS:"
          echo "  1. /efcore:rebase-snapshot    (recommended)"
          echo "  2. /efcore:conflicts          (see details)"
          echo "  3. /efcore:migration --force  (not recommended)"
          echo ""

          if [ "$BLOCK_ON_CONFLICT" = "true" ]; then
            echo "BLOCKED: Use --force to ignore"
            exit 1
          fi
        fi
      fi
    fi
  fi

  echo "Cross-branch validation: OK"
fi
```

**Options to ignore:**
- `--force` : Ignore cross-branch validation
- `--no-cross-check` : Disable validation for this execution
- `--rebase-first` : Run rebase-snapshot automatically if conflict

---

## STEP 1: Analyze Git Context

```bash
# Current branch
CURRENT_BRANCH=$(git branch --show-current)

# Extract type and name
if [[ "$CURRENT_BRANCH" == feature/* ]]; then
  BRANCH_TYPE="Feature"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/feature\///' | sed 's/-/_/g' | sed 's/\b\w/\u&/g')
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
  BRANCH_TYPE="Hotfix"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/hotfix\///' | sed 's/-/_/g' | sed 's/\b\w/\u&/g')
elif [[ "$CURRENT_BRANCH" == release/* ]]; then
  BRANCH_TYPE="Release"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/release\///' | sed 's/v//')
else
  BRANCH_TYPE="Dev"
  BRANCH_NAME="Manual"
fi

# Current version
VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json 2>/dev/null || grep -oP '(?<=<Version>).*(?=</Version>)' *.csproj 2>/dev/null | head -1)
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')
```

---

## STEP 2: Detect EF Core Project

```bash
# Find the project with EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)

# Migrations folder
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"
```

---

## STEP 3: Search for Existing Migration for This Branch

```bash
# Search pattern based on branch name
SEARCH_PATTERN="${BRANCH_TYPE}_.*_${BRANCH_NAME}"

# Find matching migration files
EXISTING_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -E "$SEARCH_PATTERN" | grep -v "Designer" | grep -v "Snapshot")
MIGRATION_COUNT=$(echo "$EXISTING_MIGRATIONS" | grep -c "." || echo "0")
```

**Display context:**

```
================================================================================
                    EF CORE MIGRATION - CONTEXT
================================================================================

BRANCH
  Current:     {CURRENT_BRANCH}
  Type:        {BRANCH_TYPE}
  Name:        {BRANCH_NAME}

VERSION:       {VERSION}

EXISTING MIGRATIONS FOR THIS BRANCH:
  {MIGRATION_COUNT} migration(s) found
  {File list if > 0}

================================================================================
```

---

## STEP 4: Decision - Create or Recreate

### If existing migration (MIGRATION_COUNT > 0):

```javascript
AskUserQuestion({
  questions: [{
    question: "A migration already exists for this branch. What to do?",
    header: "Migration",
    options: [
      { label: "Recreate", description: "Delete and recreate the migration (Recommended)" },
      { label: "Keep", description: "Keep existing, add a new one (Not recommended)" },
      { label: "Cancel", description: "Do nothing" }
    ],
    multiSelect: false
  }]
})
```

**If Recreate:**

```bash
# 1. List migrations to delete
echo "Migrations to delete:"
for file in $EXISTING_MIGRATIONS; do
  echo "  - $file"
  # Find associated files (Designer, etc.)
  BASE_NAME=$(basename "$file" .cs)
  rm -f "$MIGRATIONS_DIR/${BASE_NAME}.cs"
  rm -f "$MIGRATIONS_DIR/${BASE_NAME}.Designer.cs"
done

# 2. Rollback in DB if applied
LAST_GOOD_MIGRATION=$(dotnet ef migrations list 2>/dev/null | grep -v "(Pending)" | tail -2 | head -1)
if [ -n "$LAST_GOOD_MIGRATION" ]; then
  dotnet ef database update "$LAST_GOOD_MIGRATION" --force
fi
```

---

## STEP 5: Request Description

```javascript
AskUserQuestion({
  questions: [{
    question: "Short migration description (e.g., AddUserRoles, FixEmailIndex)",
    header: "Description",
    options: [
      { label: "Add", description: "Adding tables/columns" },
      { label: "Update", description: "Structure modification" },
      { label: "Fix", description: "Schema correction" },
      { label: "Remove", description: "Removing elements" }
    ],
    multiSelect: false
  }]
})

// Then ask for specific name in free text
// E.g., "AddUserRoles", "FixEmailNullable", "RemoveObsoleteTable"
```

---

## STEP 6: Generate Migration Name

```bash
# Pattern: {BranchType}_{Version}_{BranchName}_{Description}
# Example: Feature_1_2_0_UserAuth_AddRolesTable

MIGRATION_NAME="${BRANCH_TYPE}_${VERSION_CLEAN}_${BRANCH_NAME}_${DESCRIPTION}"

# Clean the name (no spaces, no special characters)
MIGRATION_NAME=$(echo "$MIGRATION_NAME" | sed 's/[^a-zA-Z0-9_]//g')

echo "Migration name: $MIGRATION_NAME"
```

**Generated name examples:**

| Branch | Version | Description | Final Name |
|--------|---------|-------------|------------|
| feature/user-auth | 1.2.0 | AddRolesTable | Feature_1_2_0_UserAuth_AddRolesTable |
| hotfix/login-fix | 1.2.1 | FixNullEmail | Hotfix_1_2_1_LoginFix_FixNullEmail |
| release/v1.3.0 | 1.3.0 | Initial | Release_1_3_0_Initial |

---

## STEP 7: Create Migration

```bash
cd "$PROJECT_DIR"

# Create migration with generated name
dotnet ef migrations add "$MIGRATION_NAME" --verbose

# Verify creation
if [ $? -eq 0 ]; then
  echo "OK Migration created successfully"

  # List created files
  NEW_FILES=$(find "$MIGRATIONS_DIR" -name "*${MIGRATION_NAME}*" -type f)
  echo ""
  echo "Created files:"
  for f in $NEW_FILES; do
    echo "  - $f"
  done
else
  echo "ERROR Failed to create migration"
  exit 1
fi
```

---

## STEP 8: Content Validation

```bash
# Display migration preview
MIGRATION_FILE=$(find "$MIGRATIONS_DIR" -name "*${MIGRATION_NAME}.cs" | grep -v "Designer" | head -1)

echo ""
echo "================================================================================
                    MIGRATION PREVIEW
================================================================================"
echo ""

# Display Up() and Down() methods
grep -A 20 "protected override void Up" "$MIGRATION_FILE"
echo ""
echo "..."
echo ""
grep -A 10 "protected override void Down" "$MIGRATION_FILE"
```

**Verify operations:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Does the migration look correct?",
    header: "Validation",
    options: [
      { label: "Yes, apply", description: "Deploy to local DB" },
      { label: "Yes, not now", description: "Keep without applying" },
      { label: "No, delete", description: "Cancel and start over" }
    ],
    multiSelect: false
  }]
})
```

---

## STEP 9: Summary

```
================================================================================
                    MIGRATION CREATED
================================================================================

NAME:         {MIGRATION_NAME}
BRANCH:       {CURRENT_BRANCH}
VERSION:      {VERSION}

FILES:
  OK {timestamp}_{MIGRATION_NAME}.cs
  OK {timestamp}_{MIGRATION_NAME}.Designer.cs
  OK ApplicationDbContextModelSnapshot.cs (updated)

RULES FOLLOWED:
  OK 1 migration per feature
  OK Standardized naming
  OK Branch/version traceability

================================================================================
NEXT STEPS
================================================================================

1. Review generated code in Migrations/
2. /efcore:db-deploy    -> Apply to local DB
3. /gitflow:3-commit    -> Commit changes
4. Before merge: rebase on develop + recreate if conflicts

================================================================================
```

---

## Migration Conflict Handling

When you rebase on develop and there are conflicts on ModelSnapshot:

```bash
# 1. Accept develop version for ModelSnapshot
git checkout --theirs Migrations/ApplicationDbContextModelSnapshot.cs

# 2. Delete your migration
rm Migrations/*_{MIGRATION_NAME}.*

# 3. Recreate the migration
/efcore:migration
```

This command will do it automatically if it detects a conflict.

---

## Options

| Option | Description |
|--------|-------------|
| `--name {name}` | Force a specific name |
| `--no-apply` | Don't offer to apply |
| `--force` | Delete existing without confirmation |
| `--no-cross-check` | Disable cross-branch validation |
| `--rebase-first` | Run rebase-snapshot automatically if conflict |
