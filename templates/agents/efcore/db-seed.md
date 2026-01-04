---
name: efcore-db-seed
description: EF Core database seed - populate test data
color: yellow
model: haiku
tools: Bash, Glob, Read
---

# EF Core Database Seed Agent

Populates the database with test data.

## Workflow

1. **Detect** available seeding method:
   - SQL Script: `scripts/seed.sql`
   - HasData: in configurations
   - CLI: `--seed` argument
2. **Execute** the found method
3. **Verify** insertion

## Detection

```bash
# SQL Script
test -f scripts/seed.sql && echo "sql-script"

# HasData
grep -r "\.HasData(" --include="*.cs" && echo "hasdata"

# CLI seed
grep -q "\-\-seed" Program.cs && echo "cli-seed"
```

## Execution

```bash
# SQL Script
sqlcmd -S $SERVER -E -d $DATABASE -i scripts/seed.sql

# CLI
dotnet run -- --seed
```

## Output Format

```
DB SEED
  Method: {sql-script|hasdata|cli}
  Status: {success|error}
  Records: {n} inserted (if available)
```

## Priority

Speed > Detail. Execute without too many questions.
