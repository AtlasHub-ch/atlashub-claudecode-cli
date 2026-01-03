---
description: Completely reset database (Drop + Recreate + Migrations)
agent: efcore-db-reset
model: sonnet
---

# EF Core Database Reset

Drops and recreates the database, then applies all migrations.

**⚠️ WARNING: This command DELETES all data!**

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool in an **interactive** manner. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

---

## STEP 1: Mandatory confirmation

```javascript
AskUserQuestion({
  questions: [{
    question: "⚠️ WARNING: This will DELETE all database data. Confirm?",
    header: "Reset DB",
    options: [
      { label: "Yes, delete", description: "Drop + Recreate database (DATA LOSS)" },
      { label: "No, cancel", description: "Keep current database" }
    ],
    multiSelect: false
  }]
})
```

**If No → Stop immediately**

---

## STEP 2: Check configuration

```bash
# Check that appsettings.Local.json exists
if [ ! -f "appsettings.Local.json" ]; then
  echo "❌ appsettings.Local.json not found"
  exit 1
fi

# Detect EF Core project
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
```

---

## STEP 3: Optional backup

```javascript
AskUserQuestion({
  questions: [{
    question: "Create backup before deletion?",
    header: "Backup",
    options: [
      { label: "Yes", description: "Backup to ./backups/ (Recommended)" },
      { label: "No", description: "No backup" }
    ],
    multiSelect: false
  }]
})
```

**If backup:**

```bash
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).bak"
mkdir -p "$BACKUP_DIR"

# Extract connection info from appsettings.Local.json
SERVER=$(grep -oP '"Server=\K[^;]+' appsettings.Local.json | head -1)
DATABASE=$(grep -oP '"Database=\K[^;]+' appsettings.Local.json | head -1)

# SQL Server backup
sqlcmd -S "$SERVER" -E -Q "BACKUP DATABASE [$DATABASE] TO DISK = N'$(pwd)/$BACKUP_FILE' WITH FORMAT"
echo "✓ Backup created: $BACKUP_FILE"
```

---

## STEP 4: Drop database

```bash
cd "$PROJECT_DIR"

# EF Core method
dotnet ef database drop --force

# OR direct SQL method if EF fails
# sqlcmd -S "$SERVER" -E -Q "DROP DATABASE IF EXISTS [$DATABASE]"
```

---

## STEP 5: Recreate and apply migrations

```bash
# Apply all migrations (creates database if missing)
dotnet ef database update --verbose
```

---

## STEP 6: Optional seed

```javascript
AskUserQuestion({
  questions: [{
    question: "Populate database with test data?",
    header: "Seed",
    options: [
      { label: "Yes", description: "Execute seeding" },
      { label: "No", description: "Empty database" }
    ],
    multiSelect: false
  }]
})
```

**If yes:**

```bash
# Search for seed script or use dotnet command
dotnet run --project "$PROJECT_DIR" -- --seed
# OR
dotnet ef database seed 2>/dev/null || echo "No seed configured"
```

---

## STEP 7: Summary

```
================================================================================
                         DATABASE RESET COMPLETE
================================================================================

✓ Old database deleted
✓ New database created
✓ {N} migration(s) applied
{✓ Test data inserted | ○ Empty database}
{✓ Backup: ./backups/backup_xxx.bak | ○ No backup}

NEXT COMMANDS:
  /efcore:db-status  → Check status
  /efcore:db-seed    → Add test data

================================================================================
```

---

## Security

| Protection | Description |
|------------|-------------|
| Confirmation | Required before deletion |
| Backup | Automatically offered |
| Env Check | Blocked if `ASPNETCORE_ENVIRONMENT=Production` |
