---
description: Phase 2 - Display complete GitFlow state with EF Core migrations details
---

# Phase 2: STATUS - Overview

Tu es un expert GitFlow et EF Core. Ta mission est d'afficher un etat complet et clair du projet.

## Etape 1 : Collecte des informations Git

```bash
# Branche courante
BRANCH=$(git branch --show-current)
echo "BRANCH:$BRANCH"

# Type de branche
TYPE=$(echo "$BRANCH" | grep -oE '^(feature|release|hotfix|develop|main)' || echo "other")
echo "TYPE:$TYPE"

# Etat du working directory
if git diff --quiet && git diff --cached --quiet; then
  echo "WORKDIR:clean"
else
  MODIFIED=$(git diff --name-only | wc -l)
  STAGED=$(git diff --cached --name-only | wc -l)
  echo "WORKDIR:dirty:$MODIFIED modified, $STAGED staged"
fi

# Synchronisation avec develop
if git show-ref --verify refs/heads/develop >/dev/null 2>&1; then
  SYNC_DEV=$(git rev-list --left-right --count develop...HEAD 2>/dev/null || echo "0 0")
  echo "SYNC_DEVELOP:$SYNC_DEV"
fi

# Synchronisation avec main
if git show-ref --verify refs/heads/main >/dev/null 2>&1; then
  SYNC_MAIN=$(git rev-list --left-right --count main...HEAD 2>/dev/null || echo "0 0")
  echo "SYNC_MAIN:$SYNC_MAIN"
fi

# Dernier tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
echo "LAST_TAG:$LAST_TAG"

# Remote status
git fetch --dry-run 2>&1 | grep -q "." && echo "REMOTE:updates_available" || echo "REMOTE:up_to_date"
```

## Etape 2 : Collecte des informations EF Core

```bash
# Verifier si EF Core est configure
CONFIG_FILE=".claude/gitflow/config.json"
if [ -f "$CONFIG_FILE" ]; then
  echo "CONFIG:found"
  EF_ENABLED=$(grep -o '"enabled"[[:space:]]*:[[:space:]]*[^,}]*' "$CONFIG_FILE" | grep -o 'true\|false' | head -1)
  echo "EFCORE_ENABLED:$EF_ENABLED"
else
  echo "CONFIG:not_found"
  echo "EFCORE_ENABLED:unknown"
fi

# Lister les migrations avec leur etat
echo "=== MIGRATIONS ==="
dotnet ef migrations list --no-build 2>/dev/null | while read line; do
  if echo "$line" | grep -q "(Pending)"; then
    echo "MIGRATION:pending:$line"
  elif echo "$line" | grep -qE "^[0-9]{14}_"; then
    echo "MIGRATION:applied:$line"
  fi
done

# Compter les migrations
TOTAL_MIGRATIONS=$(dotnet ef migrations list --no-build 2>/dev/null | grep -cE "^[0-9]{14}_" || echo "0")
PENDING_MIGRATIONS=$(dotnet ef migrations list --no-build 2>/dev/null | grep -c "(Pending)" || echo "0")
echo "MIGRATIONS_TOTAL:$TOTAL_MIGRATIONS"
echo "MIGRATIONS_PENDING:$PENDING_MIGRATIONS"

# Verifier les DbContext
echo "=== DBCONTEXTS ==="
grep -r "class.*:.*DbContext" --include="*.cs" . 2>/dev/null | while read line; do
  FILE=$(echo "$line" | cut -d: -f1)
  CLASS=$(echo "$line" | grep -oE "class[[:space:]]+[A-Za-z0-9_]+" | sed 's/class[[:space:]]*//')
  echo "DBCONTEXT:$CLASS:$FILE"
done
```

## Etape 3 : Verifier les plans en attente

```bash
# Plans GitFlow
PLANS_DIR=".claude/gitflow/plans"
if [ -d "$PLANS_DIR" ]; then
  echo "=== PLANS ==="
  # Plans actifs (non termines)
  find "$PLANS_DIR" -name "*.md" ! -name "*_DONE*" ! -name "*_ABORTED*" 2>/dev/null | while read plan; do
    NAME=$(basename "$plan")
    echo "PLAN:active:$NAME"
  done

  # Plans termines recemment (derniers 7 jours)
  find "$PLANS_DIR" -name "*_DONE*.md" -mtime -7 2>/dev/null | while read plan; do
    NAME=$(basename "$plan")
    echo "PLAN:done:$NAME"
  done

  # Plans avortes
  find "$PLANS_DIR" -name "*_ABORTED*.md" -mtime -7 2>/dev/null | while read plan; do
    NAME=$(basename "$plan")
    echo "PLAN:aborted:$NAME"
  done
fi
```

## Etape 4 : Detection des operations en cours

```bash
# Rebase en cours
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "OPERATION:rebase_in_progress"
  REBASE_HEAD=$(cat .git/rebase-merge/head-name 2>/dev/null || echo "unknown")
  echo "REBASE_BRANCH:$REBASE_HEAD"
fi

# Merge en cours
if [ -f ".git/MERGE_HEAD" ]; then
  echo "OPERATION:merge_in_progress"
  MERGE_HEAD=$(cat .git/MERGE_HEAD)
  echo "MERGE_COMMIT:$MERGE_HEAD"
fi

# Cherry-pick en cours
if [ -f ".git/CHERRY_PICK_HEAD" ]; then
  echo "OPERATION:cherry_pick_in_progress"
fi

# Conflit en cours
if git ls-files -u | grep -q .; then
  echo "CONFLICTS:yes"
  CONFLICT_COUNT=$(git ls-files -u | cut -f2 | sort -u | wc -l)
  echo "CONFLICT_COUNT:$CONFLICT_COUNT"
else
  echo "CONFLICTS:no"
fi
```

## Etape 5 : Analyse des risques

```bash
# Verifier divergence avec develop
if git show-ref --verify refs/heads/develop >/dev/null 2>&1; then
  BEHIND=$(git rev-list --count HEAD..develop 2>/dev/null || echo "0")
  if [ "$BEHIND" -gt 10 ]; then
    echo "RISK:high_divergence:$BEHIND commits behind develop"
  elif [ "$BEHIND" -gt 5 ]; then
    echo "RISK:moderate_divergence:$BEHIND commits behind develop"
  fi
fi

# Verifier migrations non commitees
UNCOMMITTED_MIGRATIONS=$(git status --porcelain | grep -c "Migrations/" || echo "0")
if [ "$UNCOMMITTED_MIGRATIONS" -gt 0 ]; then
  echo "RISK:uncommitted_migrations:$UNCOMMITTED_MIGRATIONS files"
fi

# Verifier ModelSnapshot modifie non commite
if git status --porcelain | grep -q "ModelSnapshot.cs"; then
  echo "RISK:uncommitted_modelsnapshot"
fi
```

## Etape 6 : Formatage de l'affichage

Genere un affichage structure :

```
================================================================================
                           GITFLOW STATUS
================================================================================

BRANCHE COURANTE
----------------
  Nom:      feature/add-users
  Type:     feature
  Status:   clean

SYNCHRONISATION
---------------
  vs develop:   2 ahead, 0 behind
  vs main:      15 ahead, 0 behind
  Dernier tag:  v1.2.0

EF CORE MIGRATIONS
------------------
  Status:       Active
  Total:        12 migrations
  Pending:      1 migration(s)

  Recentes:
    [Applied]  20241228_InitialCreate
    [Applied]  20241229_AddProducts
    [Pending]  20241230_AddUsers        <-- Non appliquee

PLANS GITFLOW
-------------
  Actifs:       1
    - feature-add-users_20241230.md

  Termines (7j): 2
  Avortes (7j):  0

OPERATIONS EN COURS
-------------------
  Aucune operation Git en cours

RISQUES DETECTES
----------------
  Aucun risque detecte

================================================================================
  Config: .claude/gitflow/config.json
  Plans:  .claude/gitflow/plans/
  Logs:   .claude/gitflow/logs/
================================================================================

Actions suggerees:
  1. Appliquer les migrations pending: dotnet ef database update
  2. Planifier l'integration: /gf-plan
```

## Variantes d'affichage

### Mode compact (--short)

```
[feature/add-users] clean | develop: +2/-0 | EF: 12 mig (1 pending) | Plans: 1 active
```

### Mode JSON (--json)

```json
{
  "branch": {
    "name": "feature/add-users",
    "type": "feature",
    "clean": true
  },
  "sync": {
    "develop": { "ahead": 2, "behind": 0 },
    "main": { "ahead": 15, "behind": 0 }
  },
  "efcore": {
    "enabled": true,
    "total": 12,
    "pending": 1,
    "migrations": [...]
  },
  "plans": {
    "active": 1,
    "done": 2,
    "aborted": 0
  },
  "risks": []
}
```

## Codes de sortie

| Code | Signification |
|------|---------------|
| 0 | Tout est OK |
| 1 | Avertissements (migrations pending, divergence) |
| 2 | Problemes (conflits, operation en cours) |
| 3 | Erreur (pas un repo Git, config manquante) |

## Actions suggerees automatiques

Selon l'etat detecte, suggerer :

| Etat | Suggestion |
|------|------------|
| Migrations pending | `dotnet ef database update` |
| Divergence > 5 | `git fetch && git rebase develop` |
| Working dir dirty | `git stash` ou `/gf-commit` |
| Operation en cours | `/gf-abort` ou resoudre manuellement |
| Pas de config | `/gf-init` |
| Plan actif | `/gf-exec` pour continuer |
