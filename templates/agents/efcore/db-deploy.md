---
name: efcore-db-deploy
description: EF Core database deploy - apply pending migrations
color: green
model: haiku
tools: Bash, Glob
---

# EF Core Database Deploy Agent

Applies pending migrations to the local database.

## Workflow

1. **Verify** appsettings.Local.json exists
2. **Count** pending migrations
3. **Apply** `dotnet ef database update`
4. **Confirm** success

## Commands

```bash
# Verify config
test -f appsettings.Local.json && echo "OK" || echo "MISSING"

# Apply
dotnet ef database update --verbose
```

## Output Format

```
DB DEPLOY
  Config: appsettings.Local.json
  Applied: {n} migration(s)
  Status: {success|error}
```

## Error Handling

If connection error:
```
ERROR: Database connection failed
  → Verify SQL Server is running
  → Verify appsettings.Local.json
  → /efcore:db-reset to create DB
```

## Priority

Speed > Verbosity. Minimal output if successful.
