---
description: Display migrations and database status
agent: efcore-db-status
model: haiku
---

# EF Core Database Status

Displays the complete status of EF Core migrations and database connection.

**Quick command, read-only, no modifications.**

---

## STEP 1: Detect configuration

```bash
# Check config files
CONFIG_LOCAL="appsettings.Local.json"
CONFIG_DEV="appsettings.Development.json"
CONFIG_DEFAULT="appsettings.json"

if [ -f "$CONFIG_LOCAL" ]; then
  CONFIG_USED="$CONFIG_LOCAL"
elif [ -f "$CONFIG_DEV" ]; then
  CONFIG_USED="$CONFIG_DEV"
else
  CONFIG_USED="$CONFIG_DEFAULT"
fi

# Detect EF Core project
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)
```

---

## STEP 2: Test connection

```bash
cd "$PROJECT_DIR"

# Test connection with EF Core
CONNECTION_OK=$(dotnet ef database list 2>&1)
if echo "$CONNECTION_OK" | grep -q "error\|Error\|failed"; then
  CONNECTION_STATUS="❌ Failed"
  CONNECTION_ERROR="$CONNECTION_OK"
else
  CONNECTION_STATUS="✓ OK"
fi
```

---

## STEP 3: List migrations

```bash
# Migrations in code
CODE_MIGRATIONS=$(dotnet ef migrations list 2>/dev/null | grep -v "^Build" | grep -v "^$")
TOTAL_MIGRATIONS=$(echo "$CODE_MIGRATIONS" | wc -l)

# Applied vs pending migrations
APPLIED=$(dotnet ef migrations list 2>/dev/null | grep "(Pending)" -v | grep -v "^Build" | wc -l)
PENDING=$(dotnet ef migrations list 2>/dev/null | grep "(Pending)" | wc -l)
```

---

## STEP 4: Display report

```
================================================================================
                         EF CORE - DATABASE STATUS
================================================================================

PROJECT
  Name:          {PROJECT_NAME}
  Config:        {CONFIG_USED}
  DbContext:     {CONTEXT_NAME}

CONNECTION
  Status:        {CONNECTION_STATUS}
  Server:        {SERVER}
  Database:      {DATABASE}

MIGRATIONS
  Total:         {TOTAL_MIGRATIONS}
  Applied:       {APPLIED} ✓
  Pending:       {PENDING} {⚠️ if > 0}

================================================================================
```

**If pending migrations:**

```
PENDING MIGRATIONS
────────────────────────────────────────────────────────────────────────────────
  1. {MigrationName1}  (Pending)
  2. {MigrationName2}  (Pending)
────────────────────────────────────────────────────────────────────────────────

→ Use /efcore:db-deploy to apply migrations
```

**If connection error:**

```
⚠️  CONNECTION PROBLEM
────────────────────────────────────────────────────────────────────────────────
{CONNECTION_ERROR}
────────────────────────────────────────────────────────────────────────────────

CHECKS:
  1. Is SQL Server running?
  2. Is appsettings.Local.json configured?
  3. Does the database exist?

COMMANDS:
  /efcore:db-reset   → Create/recreate database
  /gitflow:10-start  → Configure appsettings.Local.json
```

---

## STEP 4.5: Check "1 migration per feature" rule

```bash
# Current branch
CURRENT_BRANCH=$(git branch --show-current)

# Extract branch type
if [[ "$CURRENT_BRANCH" == feature/* ]]; then
  BRANCH_TYPE="Feature"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/feature\///' | sed 's/-/_/g')
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
  BRANCH_TYPE="Hotfix"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/hotfix\///' | sed 's/-/_/g')
else
  BRANCH_TYPE=""
fi

# If on a feature/hotfix, count migrations for this branch
if [ -n "$BRANCH_TYPE" ]; then
  # Search for migrations matching the branch pattern
  BRANCH_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" 2>/dev/null | grep -iE "${BRANCH_TYPE}.*${BRANCH_NAME}" | grep -v "Designer" | grep -v "Snapshot" | wc -l)
fi
```

**Display verification:**

```
"1 MIGRATION PER FEATURE" RULE
────────────────────────────────────────────────────────────────────────────────
  Branch:       {CURRENT_BRANCH}
  Migrations:   {BRANCH_MIGRATIONS} for this branch
```

**If BRANCH_MIGRATIONS > 1:**

```
  ⚠️  WARNING: {BRANCH_MIGRATIONS} migrations detected for this branch!
      Rule: 1 migration only per feature/hotfix

      RECOMMENDED ACTION:
        /efcore:migration  → Recreate as single migration

      Multiple migrations cause problems during merge.
────────────────────────────────────────────────────────────────────────────────
```

**If BRANCH_MIGRATIONS == 1:**

```
  ✓ Rule respected: 1 migration for this branch
────────────────────────────────────────────────────────────────────────────────
```

**If BRANCH_MIGRATIONS == 0 and pending modifications:**

```
  ○ No migrations for this branch
    → Use /efcore:migration if you modified the model
────────────────────────────────────────────────────────────────────────────────
```

---

## STEP 5: Additional info (optional)

```bash
# Database size (if connection OK)
DB_SIZE=$(sqlcmd -S "$SERVER" -E -Q "SELECT CAST(SUM(size * 8 / 1024.0) AS DECIMAL(10,2)) AS 'MB' FROM sys.master_files WHERE database_id = DB_ID('$DATABASE')" -h -1 2>/dev/null)

# Number of tables
TABLE_COUNT=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'" -h -1 2>/dev/null)
```

```
STATISTICS
  Size:          {DB_SIZE} MB
  Tables:        {TABLE_COUNT}
```

---

## Options

| Option | Description |
|--------|-------------|
| `--verbose` | Display all migrations with details |
| `--json` | JSON output for scripting |
| `--context {name}` | Specify the DbContext |
