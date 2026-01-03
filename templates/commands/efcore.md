---
description: EF Core Commands - Migration and database management
---

# EF Core Commands

Set of commands to manage Entity Framework Core: migrations, database, and seeding.

## Available Commands

### Migrations

| Command | Description | Risk |
|---------|-------------|------|
| `/efcore:migration` | Create/recreate migration (1 per feature) | Low |
| `/efcore:db-status` | Show migration status | None (read-only) |
| `/efcore:db-deploy` | Apply migrations | Low |
| `/efcore:db-seed` | Populate with data | Low |
| `/efcore:db-reset` | Drop + Recreate database | **HIGH** |

### Cross-Branch (v1.2)

| Command | Description | Risk |
|---------|-------------|------|
| `/efcore:scan` | Scan migrations across all branches | None (read-only) |
| `/efcore:conflicts` | Analyze potential conflicts (BLOCKING) | None (read-only) |
| `/efcore:rebase-snapshot` | Rebase ModelSnapshot on develop | Medium |
| `/efcore:squash` | Merge multiple migrations into one | **HIGH** |

## Golden Rule: 1 Migration per Feature

**Never accumulate multiple migrations on a feature.** If you modify the model:
1. Delete the existing migration
2. Recreate it with `/efcore:migration`

The `/efcore:migration` command handles this automatically.

## Migration Naming

Pattern: `{BranchType}_{Version}_{BranchName}_{Description}`

| Branch | Version | Description | Generated Name |
|--------|---------|-------------|----------------|
| feature/user-auth | 1.2.0 | AddRolesTable | `Feature_1_2_0_UserAuth_AddRolesTable` |
| hotfix/login-fix | 1.2.1 | FixNullEmail | `Hotfix_1_2_1_LoginFix_FixNullEmail` |
| release/v1.3.0 | 1.3.0 | Initial | `Release_1_3_0_Initial` |

## Typical Workflow

```
1. /gitflow:10-start feature xxx    → Create worktree + appsettings.Local.json
2. /efcore:db-deploy                → Apply existing migrations
3. ... model modifications ...
4. /efcore:migration                → Create THE migration for this feature
5. /efcore:db-deploy                → Apply to local DB
6. /gitflow:3-commit                → Commit
```

## Cross-Branch Workflow (v1.2)

With GitFlow worktrees, multiple branches can have migrations in parallel. To avoid conflicts:

```
1. /efcore:scan                → Scan all active branches
2. /efcore:conflicts           → Check for conflicts (BLOCKING)
3. /efcore:rebase-snapshot     → If conflict, rebase on develop
4. /efcore:migration           → Create/recreate migration
```

### Recommended Merge Order

The scan analyzes migrations and recommends a merge order:

```
ACTIVE BRANCHES (3)
--------------------
feature/user-roles    +1 migration    Conflict: NONE
feature/add-products  +1 migration    Conflict: POTENTIAL
feature/orders        +2 migrations   Conflict: HIGH

RECOMMENDED MERGE ORDER:
1. feature/user-roles (independent)
2. feature/add-products (before orders)
3. feature/orders (rebase required)
```

## Configuration

Commands use configuration in `.claude/gitflow/config.json`:

```json
{
  "efcore": {
    "database": {
      "configFile": "appsettings.Local.json",
      "connectionStringName": "DefaultConnection",
      "provider": "SqlServer"
    },
    "crossBranch": {
      "enabled": true,
      "scanOnMigrationCreate": true,
      "blockOnConflict": true,
      "cacheExpiry": 300
    }
  }
}
```

### crossBranch Options

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Enable cross-branch validation | `true` |
| `scanOnMigrationCreate` | Scan before `/efcore:migration` | `true` |
| `blockOnConflict` | Block if conflict detected | `true` |
| `cacheExpiry` | Scan cache duration (seconds) | `300` |

## appsettings.Local.json File

This file contains the local connection string and is **never committed**:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyApp;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

The file is automatically created by `/gitflow:10-start` and added to `.gitignore`.

## Prerequisites

- .NET SDK installed
- EF Core Tools: `dotnet tool install --global dotnet-ef`
- SQL Server (or other configured provider)
