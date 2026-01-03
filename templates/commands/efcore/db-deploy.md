---
description: Deploy EF Core migrations to local database
agent: efcore-db-deploy
model: haiku
---

# EF Core Database Deploy

Applies all pending migrations to the database configured in `appsettings.Local.json`.

---

## STEP 1: Check configuration

```bash
# Check that appsettings.Local.json exists
if [ ! -f "appsettings.Local.json" ]; then
  echo "❌ appsettings.Local.json not found"
  echo "   Use /gitflow:10-start to create it"
  exit 1
fi

# Detect EF Core project
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
if [ -z "$CSPROJ" ]; then
  echo "❌ No EF Core project detected"
  exit 1
fi

PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)
```

---

## STEP 2: Check pending migrations

```bash
cd "$PROJECT_DIR"
dotnet ef migrations list --json 2>/dev/null | grep -E '"applied": false'
PENDING_COUNT=$(dotnet ef migrations list --json 2>/dev/null | grep -c '"applied": false' || echo "0")
```

**Display status:**

```
================================================================================
                         EF CORE - DATABASE DEPLOY
================================================================================

PROJECT:     {PROJECT_NAME}
CONFIG:      appsettings.Local.json
MIGRATIONS:  {PENDING_COUNT} pending

================================================================================
```

---

## STEP 3: Apply migrations

```bash
# Apply migrations with local config
dotnet ef database update --configuration Release --verbose
```

**If connection error:**

```
⚠️  Database connection error

CHECKS:
1. Is SQL Server running?
2. Does the database exist?
3. Are the credentials correct?

USEFUL COMMANDS:
- Check connection:  sqlcmd -S {SERVER} -E
- Create database:   /efcore:db-reset
```

---

## STEP 4: Confirmation

```
================================================================================
                         DEPLOYMENT COMPLETE
================================================================================

✓ {N} migration(s) applied
✓ Database is up to date

NEXT COMMANDS:
  /efcore:db-status  → Check status
  /efcore:db-seed    → Populate test data

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--verbose` | Display SQL details |
| `--connection "..."` | Override connection string |
| `--context {name}` | Specify DbContext if multiple |
