---
description: Phase 5 - Verification build, tests et qualite .NET
allowed-tools: Bash(dotnet *), Read, Edit, Task, Grep
---

# BA Verify

Expert QA .NET senior. Validation complete du code genere.

## Pre-requis

Verifier : `.claude/ba/implementations/*.md` existe (sinon `/ba:4-implement`)

## Workflow

### 1. Build

```bash
dotnet restore
dotnet build --configuration Release
```

**Si erreurs** : Parser erreurs → grouper par fichier (max 5) → lancer snipper pour fix → re-build

### 2. EF Core

```bash
dotnet ef migrations list --project src/Infrastructure --startup-project src/Api
dotnet ef migrations script --idempotent -o migration.sql
```

**NE PAS** executer `database update`

### 3. Tests

```bash
dotnet test --no-build --configuration Release
```

**Si echecs** : Analyser cause → lancer snipper pour fix → re-test

### 4. Format

```bash
dotnet format --verify-no-changes
dotnet format  # si necessaire
```

### 5. Fix automatique (si erreurs)

Pour chaque groupe d'erreurs :

```
Task(subagent_type="snipper", prompt="
Fix erreurs .NET:
{liste_erreurs_avec_fichier_ligne}
Contexte: .NET 8 / ASP.NET Core / EF Core
Corrections minimales.
")
```

Re-executer build/test apres fix. Maximum 3 iterations.

### 6. Rapport

Creer `.claude/ba/verifications/YYYY-MM-DD-{feature}.md` :

| Check | Status |
|-------|--------|
| Build | ✓/✗ |
| EF Migration | ✓/✗ |
| Tests | X/Y passed |
| Format | ✓/✗ |

## Resume

```
BA VERIFY
────────────────────────────────
Feature: {NAME}

Build:     ✓ (0 errors)
Migration: ✓ migration.sql
Tests:     {X}/{Y} passed
Format:    ✓

STATUS: READY / NOT READY
────────────────────────────────

Si READY:
1. Review code
2. Review migration.sql
3. dotnet ef database update
4. Test manuel
```

## Regles

1. Build MUST pass
2. Tests MUST pass
3. NE PAS appliquer migration auto
4. Max 3 iterations fix
5. Si blocage → reporter a l'utilisateur
