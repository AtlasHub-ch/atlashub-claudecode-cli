---
description: Scan all branches for migrations with risk analysis
agent: efcore-scan
model: sonnet
---

# EF Core Scan - Cross-Branch Migration Scanner

Scans all active branches to detect migrations and analyze conflict risks.

**USAGE:** Before creating a migration or before a merge to check the status of other branches.

**SECURITY:** Read-only - no modifications.

---

## STEP 1: List active worktrees

```bash
# Check that worktrees exist
WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")

if [ ! -d "$WORKTREE_BASE" ]; then
  echo "Worktrees structure not found: $WORKTREE_BASE"
  echo "Run /gitflow:1-init to create structure"
  exit 1
fi

# List all worktrees
echo "DETECTED WORKTREES"
echo "=================="
git worktree list
echo ""
```

---

## STEP 2: Scan migrations per branch

```bash
# For each worktree
for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ -z "$BRANCH" ]; then
    continue
  fi

  # Find Migrations folder
  MIGRATIONS_DIR=$(find "$worktree" -type d -name "Migrations" 2>/dev/null | head -1)

  if [ -n "$MIGRATIONS_DIR" ]; then
    # Count migrations
    MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -v "Designer" | grep -v "Snapshot" | wc -l)

    # ModelSnapshot hash
    SNAPSHOT=$(find "$MIGRATIONS_DIR" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)
    if [ -n "$SNAPSHOT" ]; then
      SNAPSHOT_HASH=$(md5sum "$SNAPSHOT" 2>/dev/null | cut -d' ' -f1 | head -c 8)
    else
      SNAPSHOT_HASH="N/A"
    fi

    echo "$BRANCH | $MIGRATION_COUNT migrations | Snapshot: $SNAPSHOT_HASH"
  fi
done
```

---

## STEP 3: Compare with develop

```bash
# Get develop's ModelSnapshot hash
DEVELOP_WORKTREE="$WORKTREE_BASE/develop"

if [ -d "$DEVELOP_WORKTREE" ]; then
  DEVELOP_SNAPSHOT=$(find "$DEVELOP_WORKTREE" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$DEVELOP_SNAPSHOT" ]; then
    DEVELOP_HASH=$(md5sum "$DEVELOP_SNAPSHOT" 2>/dev/null | cut -d' ' -f1)
    echo ""
    echo "REFERENCE: develop ModelSnapshot = ${DEVELOP_HASH:0:8}"
  fi
fi
```

---

## STEP 4: Analyze conflict risks

```bash
echo ""
echo "RISK ANALYSIS"
echo "==================="

# Compare each branch with develop
for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "main" ]; then
    continue
  fi

  SNAPSHOT=$(find "$worktree" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$SNAPSHOT" ] && [ -n "$DEVELOP_SNAPSHOT" ]; then
    # Compare snapshots
    if diff -q "$SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
      RISK="NONE"
    else
      # Analyze differences
      DIFF_LINES=$(diff "$DEVELOP_SNAPSHOT" "$SNAPSHOT" 2>/dev/null | wc -l)

      if [ "$DIFF_LINES" -lt 50 ]; then
        RISK="LOW"
      elif [ "$DIFF_LINES" -lt 200 ]; then
        RISK="MEDIUM"
      else
        RISK="HIGH"
      fi
    fi

    echo "$BRANCH: $RISK"
  fi
done
```

---

## STEP 5: Recommend merge order

```bash
echo ""
echo "RECOMMENDED MERGE ORDER"
echo "========================="
echo "1. Branches with RISK=NONE (independent)"
echo "2. Branches with RISK=LOW (minor modifications)"
echo "3. Branches with RISK=MEDIUM (order matters)"
echo "4. Branches with RISK=HIGH (rebase required before merge)"
```

---

## Output Format

```
================================================================================
                    EF CORE CROSS-BRANCH SCAN
================================================================================

DETECTED WORKTREES (5)
  main/                    [main]
  develop/                 [develop]
  features/user-auth/      [feature/user-auth]
  features/add-products/   [feature/add-products]
  hotfixes/login-fix/      [hotfix/login-fix]

MIGRATIONS PER BRANCH
  develop               | 12 migrations | Snapshot: a1b2c3d4 (REFERENCE)
  feature/user-auth     | 13 migrations | Snapshot: e5f6g7h8
  feature/add-products  | 13 migrations | Snapshot: i9j0k1l2
  hotfix/login-fix      | 12 migrations | Snapshot: a1b2c3d4

RISK ANALYSIS
  feature/user-auth     : LOW      (different table)
  feature/add-products  : MEDIUM   (FK to same table)
  hotfix/login-fix      : NONE     (snapshot = develop)

RECOMMENDED MERGE ORDER
  1. hotfix/login-fix      (NONE - direct merge)
  2. feature/user-auth     (LOW - merge OK)
  3. feature/add-products  (MEDIUM - after user-auth)

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--json` | JSON output for CI/CD |
| `--branch <name>` | Scan a specific branch |
| `--verbose` | Display difference details |
| `--no-recommend` | Don't display recommendations |

---

## CI/CD Usage

```yaml
# GitHub Actions
- name: Scan EF Core migrations
  run: |
    OUTPUT=$(claude-code "/efcore:scan --json")
    CONFLICTS=$(echo $OUTPUT | jq '.risks[] | select(.level == "HIGH") | length')
    if [ "$CONFLICTS" -gt 0 ]; then
      echo "::warning::High risk migration conflicts detected"
    fi
```
