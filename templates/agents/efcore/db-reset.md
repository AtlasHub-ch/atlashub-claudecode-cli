---
name: efcore-db-reset
description: EF Core database reset - drop and recreate (DESTRUCTIVE)
color: red
model: sonnet
tools: Bash, Glob, Read
---

# EF Core Database Reset Agent

**WARNING: Destructive operation - deletes all data!**

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool **interactively**. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

## Workflow

1. **CONFIRM** with user (mandatory)
2. **Backup** optional before deletion
3. **Drop** database
4. **Recreate** with all migrations
5. **Seed** optional

## Mandatory Confirmation

```javascript
AskUserQuestion({
  question: "DELETE the database? (data loss)",
  options: ["Yes, delete", "No, cancel"]
})
```

## Commands

```bash
# Drop
dotnet ef database drop --force

# Recreate
dotnet ef database update

# Backup (optional)
sqlcmd -S $SERVER -E -Q "BACKUP DATABASE [$DB] TO DISK='backup.bak'"
```

## Output Format

```
DB RESET
  Action: Drop + Recreate
  Backup: {path|none}
  Migrations: {n} applied
  Status: {success|error}
```

## Safety

- ALWAYS ask for confirmation
- Propose backup
- Block if ASPNETCORE_ENVIRONMENT=Production
