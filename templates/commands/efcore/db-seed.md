---
description: Populate database with test or initial data
agent: efcore-db-seed
model: haiku
---

# EF Core Database Seed

Inserts test or initial data into the database.

> **CLAUDE INSTRUCTION:** The `AskUserQuestion({...})` blocks are instructions to use the `AskUserQuestion` tool in an **interactive** manner. You MUST execute the tool with these parameters to get the user's response BEFORE continuing.

---

## STEP 1: Detect available seeding methods

```bash
# Search for different seed methods
SEED_METHODS=""

# 1. DbSeeder or DataSeeder class
if grep -rq "class.*Seeder\|class.*Seed\|IDataSeeder" . --include="*.cs" 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS seeder-class"
fi

# 2. HasData() in configurations
if grep -rq "\.HasData(" . --include="*.cs" 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS hasdata"
fi

# 3. SQL seed script
if [ -f "./scripts/seed.sql" ] || [ -f "./Data/seed.sql" ]; then
  SEED_METHODS="$SEED_METHODS sql-script"
fi

# 4. --seed argument in Program.cs
if grep -q "\-\-seed" ./Program.cs 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS cli-argument"
fi
```

---

## STEP 2: Display options

```
================================================================================
                         EF CORE - DATABASE SEED
================================================================================

DETECTED METHODS:
```

**If methods found:**

```javascript
// Build options dynamically
options = []

if (SEED_METHODS.includes("seeder-class")) {
  options.push({
    label: "Seeder Class",
    description: "Execute DbSeeder/DataSeeder class"
  })
}

if (SEED_METHODS.includes("hasdata")) {
  options.push({
    label: "HasData (migrations)",
    description: "Data is already in migrations"
  })
}

if (SEED_METHODS.includes("sql-script")) {
  options.push({
    label: "SQL Script",
    description: "Execute ./scripts/seed.sql"
  })
}

if (SEED_METHODS.includes("cli-argument")) {
  options.push({
    label: "CLI --seed",
    description: "Launch app with --seed"
  })
}

AskUserQuestion({
  questions: [{
    question: "Which seeding method to use?",
    header: "Seed",
    options: options,
    multiSelect: false
  }]
})
```

**If no method found:**

```
⚠️  No seeding method detected

OPTIONS:
1. Create SQL script in ./scripts/seed.sql
2. Add HasData() in your EntityTypeConfiguration
3. Create an IDataSeeder class

HASDATA EXAMPLE:
────────────────────────────────────────────────────────────────────────────────
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasData(new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@example.com"
        });
    }
}
────────────────────────────────────────────────────────────────────────────────
```

---

## STEP 3: Execute seeding

### Option A: Seeder Class

```bash
# Detect startup project
STARTUP_PROJECT=$(find . -name "*.csproj" -exec grep -l "Microsoft.AspNetCore" {} \; | head -1)

# Execute with seed option
dotnet run --project "$STARTUP_PROJECT" -- --seed
```

### Option B: SQL Script

```bash
# Extract connection info
SERVER=$(grep -oP 'Server=\K[^;]+' appsettings.Local.json | head -1)
DATABASE=$(grep -oP 'Database=\K[^;]+' appsettings.Local.json | head -1)

# Execute script
sqlcmd -S "$SERVER" -E -d "$DATABASE" -i "./scripts/seed.sql"
```

### Option C: CLI --seed

```bash
dotnet run --project "$STARTUP_PROJECT" -- --seed
```

---

## STEP 4: Verification

```bash
# Count records in main tables
TABLES=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'" -h -1)

for table in $TABLES; do
  COUNT=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT COUNT(*) FROM [$table]" -h -1)
  echo "$table: $COUNT rows"
done
```

---

## STEP 5: Summary

```
================================================================================
                         SEEDING COMPLETE
================================================================================

METHOD:      {method used}
RESULTS:
  Users:     {N} records
  Products:  {N} records
  ...

✓ Database populated successfully

NEXT COMMANDS:
  /efcore:db-status  → Check status
  dotnet run         → Launch application

================================================================================
```

---

## Create a seed.sql script

If you don't have a seeding method, create `./scripts/seed.sql`:

```sql
-- Seed data for development
SET IDENTITY_INSERT [Users] ON;

INSERT INTO [Users] ([Id], [Name], [Email], [CreatedAt])
VALUES
    (1, 'Admin', 'admin@example.com', GETDATE()),
    (2, 'Test User', 'test@example.com', GETDATE());

SET IDENTITY_INSERT [Users] OFF;

-- Add more seed data here...
```

Then execute the following command and select "SQL Script":

```
/efcore:db-seed
```
