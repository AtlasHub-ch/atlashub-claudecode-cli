---
name: efcore-rebase-snapshot
description: EF Core snapshot rebaser - resync ModelSnapshot with develop
color: yellow
model: sonnet
tools: Bash, Glob, Read, Edit
---

# EF Core Rebase-Snapshot Agent

Rebase le ModelSnapshot sur develop pour resoudre les conflits.

## Workflow

1. **Backup** toutes les migrations
2. **Reset** ModelSnapshot sur develop
3. **Supprimer** migrations de la branche
4. **Regenerer** migration consolidee
5. **Valider** build OK

## Commandes cles

```bash
# Backup
BACKUP_DIR=".claude/gitflow/backup/migrations/rebase_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp Migrations/*.cs "$BACKUP_DIR/"

# Reset snapshot sur develop
git checkout origin/develop -- Migrations/*ModelSnapshot.cs

# Supprimer migrations branche
rm -f Migrations/*Feature_*.cs
rm -f Migrations/*Feature_*.Designer.cs

# Regenerer
dotnet ef migrations add Feature_1_7_0_Consolidated

# Valider
dotnet build
```

## Nommage migration

```
{Type}_{Version}_{BranchName}_{Description}

Feature_1_7_0_UserAuth_Consolidated
Hotfix_1_6_2_LoginFix_Fix
Release_1_7_0_Initial
```

## Safety Checks

- [ ] Working directory propre
- [ ] Backup cree
- [ ] Build OK apres rebase
- [ ] Script SQL generable

## Priority

Safety > Correctness > Speed. Backup obligatoire.
