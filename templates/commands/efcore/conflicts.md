---
description: Analyze conflicts before merge (BLOCKING if conflict detected)
agent: efcore-conflicts
model: sonnet
---

# EF Core Conflicts - Cross-Branch Conflict Analysis

Analyzes potential conflicts between current branch and develop. **BLOCKING** if conflict detected.

**USAGE:** Before a merge or commit to ensure there are no migration conflicts.

**BEHAVIOR:** Returns exit code 1 if conflict detected (blocks merge/commit).

---

## STEP 1: Check current branch

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
  echo "No analysis needed on $CURRENT_BRANCH"
  exit 0
fi
```

---

## STEP 2: Locate ModelSnapshots

```bash
# Find local ModelSnapshot
LOCAL_SNAPSHOT=$(find . -name "*ModelSnapshot.cs" -not -path "*/node_modules/*" 2>/dev/null | head -1)

if [ -z "$LOCAL_SNAPSHOT" ]; then
  echo "No ModelSnapshot found - no EF Core migrations"
  exit 0
fi

echo "Local ModelSnapshot: $LOCAL_SNAPSHOT"

# Find develop's ModelSnapshot
WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")
DEVELOP_SNAPSHOT="$WORKTREE_BASE/develop/$(dirname $LOCAL_SNAPSHOT)/*ModelSnapshot.cs"

if [ ! -f "$DEVELOP_SNAPSHOT" ]; then
  # Fallback: get from git
  DEVELOP_SNAPSHOT_CONTENT=$(git show develop:$LOCAL_SNAPSHOT 2>/dev/null)
  if [ -z "$DEVELOP_SNAPSHOT_CONTENT" ]; then
    echo "Cannot find develop's ModelSnapshot"
    exit 1
  fi
fi
```

---

## STEP 3: Compare ModelSnapshots

```bash
echo ""
echo "MODELSNAPSHOT COMPARISON"
echo "========================="

# Create temporary file for develop if needed
if [ -n "$DEVELOP_SNAPSHOT_CONTENT" ]; then
  TEMP_DEVELOP=$(mktemp)
  echo "$DEVELOP_SNAPSHOT_CONTENT" > "$TEMP_DEVELOP"
  DEVELOP_SNAPSHOT="$TEMP_DEVELOP"
fi

# Compare
if diff -q "$LOCAL_SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
  echo "Identical ModelSnapshots - No conflict"
  CONFLICT_LEVEL="NONE"
else
  # Analyze differences
  DIFF_OUTPUT=$(diff "$DEVELOP_SNAPSHOT" "$LOCAL_SNAPSHOT" 2>/dev/null)
  DIFF_LINES=$(echo "$DIFF_OUTPUT" | wc -l)

  echo "Differences detected: $DIFF_LINES lines"
fi
```

---

## STEP 4: Analyze conflict type

```bash
if [ "$CONFLICT_LEVEL" != "NONE" ]; then
  # Extract modified entities
  LOCAL_ENTITIES=$(grep -E "entity\.(Property|HasKey|HasIndex|ToTable)" "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_ENTITIES=$(grep -E "entity\.(Property|HasKey|HasIndex|ToTable)" "$DEVELOP_SNAPSHOT" | sort -u)

  # Find locally modified tables
  LOCAL_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$DEVELOP_SNAPSHOT" | sort -u)

  # Compare tables
  COMMON_MODIFIED=$(comm -12 <(echo "$LOCAL_TABLES") <(echo "$DEVELOP_TABLES"))

  if [ -n "$COMMON_MODIFIED" ]; then
    echo ""
    echo "TABLES MODIFIED ON BOTH SIDES:"
    echo "$COMMON_MODIFIED"
    CONFLICT_LEVEL="HIGH"
  else
    CONFLICT_LEVEL="LOW"
  fi

  # Check columns
  LOCAL_COLUMNS=$(grep -oE 'Property<[^>]+>\("([^"]+)"' "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_COLUMNS=$(grep -oE 'Property<[^>]+>\("([^"]+)"' "$DEVELOP_SNAPSHOT" | sort -u)

  # New local columns
  NEW_LOCAL_COLUMNS=$(comm -23 <(echo "$LOCAL_COLUMNS") <(echo "$DEVELOP_COLUMNS"))

  if [ -n "$NEW_LOCAL_COLUMNS" ]; then
    echo ""
    echo "NEW COLUMNS (this branch):"
    echo "$NEW_LOCAL_COLUMNS" | head -10
  fi
fi
```

---

## STEP 5: Scan other active branches

```bash
echo ""
echo "OTHER BRANCHES WITH MIGRATIONS"
echo "==============================="

for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ "$BRANCH" = "$CURRENT_BRANCH" ] || [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "main" ]; then
    continue
  fi

  OTHER_SNAPSHOT=$(find "$worktree" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$OTHER_SNAPSHOT" ]; then
    if ! diff -q "$LOCAL_SNAPSHOT" "$OTHER_SNAPSHOT" > /dev/null 2>&1; then
      echo "$BRANCH: Different ModelSnapshot"

      # Check if same table modified
      OTHER_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$OTHER_SNAPSHOT" | sort -u)
      OVERLAP=$(comm -12 <(echo "$LOCAL_TABLES") <(echo "$OTHER_TABLES"))

      if [ -n "$OVERLAP" ]; then
        echo "  WARNING: Common tables modified with $BRANCH"
        CONFLICT_LEVEL="HIGH"
      fi
    fi
  fi
done
```

---

## STEP 6: Final verdict

```bash
echo ""
echo "================================================================================
                    ANALYSIS RESULT
================================================================================
"

case $CONFLICT_LEVEL in
  "NONE")
    echo "STATUS: OK"
    echo "No conflict detected. Merge allowed."
    exit 0
    ;;
  "LOW")
    echo "STATUS: OK (with caution)"
    echo "Modifications on different tables. Merge allowed."
    exit 0
    ;;
  "MEDIUM")
    echo "STATUS: CAUTION"
    echo "FK to same tables. Check merge order."
    exit 0
    ;;
  "HIGH")
    echo "STATUS: CONFLICT DETECTED"
    echo ""
    echo "RESOLUTION REQUIRED:"
    echo "  1. /efcore:rebase-snapshot   (recommended)"
    echo "  2. /efcore:conflicts --force (not recommended)"
    echo "  3. Merge other branch first"
    echo ""
    echo "BLOCKING: Merge not allowed."
    exit 1
    ;;
  "CRITICAL")
    echo "STATUS: CRITICAL CONFLICT"
    echo ""
    echo "Same column modified on both sides."
    echo "Manual intervention required."
    echo ""
    exit 1
    ;;
esac
```

---

## Output Format

```
================================================================================
                    EF CORE CONFLICT ANALYSIS
================================================================================

BRANCH: feature/user-auth
TARGET: develop

MODELSNAPSHOT
  Local:   a1b2c3d4 (13 migrations)
  Develop: e5f6g7h8 (12 migrations)
  Status:  DIFFERENT

MODIFIED TABLES
  Local:   Users, Roles, UserRoles
  Develop: Users, Permissions

CONFLICT DETECTED
  Table "Users" modified on both sides

OTHER BRANCHES
  feature/add-products: OK (different tables)

================================================================================
STATUS: CONFLICT - EXIT CODE 1
================================================================================

RESOLUTION:
  /efcore:rebase-snapshot    Rebase on develop (recommended)
  /efcore:conflicts --force  Force (not recommended)

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--force` | Ignore conflict (not recommended) |
| `--verbose` | Display detailed differences |
| `--json` | JSON output for CI/CD |
| `--target <branch>` | Compare with branch other than develop |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No conflict or minor conflict |
| 1 | Conflict detected - merge blocked |
| 2 | Technical error |
