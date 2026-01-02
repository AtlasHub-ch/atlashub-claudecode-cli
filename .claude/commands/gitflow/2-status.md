---
description: Phase 2 - Display GitFlow state with versioning and EF Core details
agent: gitflow-status
model: haiku
---

# Phase 2: STATUS - Overview

Tu es expert GitFlow et EF Core. Affiche l'etat complet du projet .NET.

---

## Informations a collecter

### Git
- Branche courante et type (feature/release/hotfix/develop/main)
- Etat working directory (clean/dirty)
- Synchronisation vs develop et main (commits ahead/behind)
- Dernier tag

### Version
Lire depuis la source configuree dans `.claude/gitflow/config.json`:
- `versioning.source` → type (csproj, Directory.Build.props, AssemblyInfo, VERSION, git-tag)
- `versioning.sourceFile` → chemin du fichier
- Lire la version actuelle depuis CE fichier (pas depuis config.json)

### EF Core
- Lister les migrations (total et pending)
- Lister les DbContext detectes

### EF Core - Vue globale (toutes branches)
Si `--all-branches` ou si plusieurs branches GitFlow actives:
```bash
# Scanner les branches actives
FEATURES=$(git branch -r | grep 'feature/' | wc -l)
RELEASES=$(git branch -r | grep 'release/' | wc -l)
HOTFIXES=$(git branch -r | grep 'hotfix/' | wc -l)

# Pour chaque branche, detecter migrations ajoutees
for BRANCH in $(git branch -r | grep -E 'feature/|release/|hotfix/'); do
  MIGRATIONS=$(git diff origin/develop..$BRANCH --name-only | grep -E "Migrations/.*\.cs$" | grep -v Designer | grep -v ModelSnapshot)
  CONFLICT=$(git diff origin/develop..$BRANCH --name-only | grep "ModelSnapshot" | wc -l)
done
```

### Plans GitFlow
- Plans actifs (non termines)
- Plans termines recemment (7 jours)

### Operations en cours
- Rebase, merge, cherry-pick en cours?
- Conflits detectes?

### Risques
- Divergence > 5 commits vs develop
- Migrations non commitees
- ModelSnapshot modifie non commite

---

## Affichage

```
================================================================================
                           GITFLOW STATUS
================================================================================

BRANCHE: {branch} ({type}) | {clean|dirty}
VERSION: {version} ({source})

SYNC
  vs develop: +{ahead}/-{behind} | vs main: +{ahead}/-{behind} | Tag: {tag}

EF CORE (branche courante)
  Migrations: {total} total, {pending} pending
  [Pending] {liste}

--------------------------------------------------------------------------------
BRANCHES ACTIVES ({features} features, {releases} releases, {hotfixes} hotfixes)
--------------------------------------------------------------------------------
{Si branches actives avec migrations:}
  feature/add-users        +1 migration  (AddUsersTable)      Conflit: NON
  feature/add-orders       +1 migration  (AddOrdersTable)     Conflit: NON
  feature/add-products     +2 migrations (AddProducts, AddFK) Conflit: OUI

  ORDRE DE MERGE RECOMMANDE:
  1. feature/add-users (independant)
  2. feature/add-orders (independant)
  3. feature/add-products (conflit ModelSnapshot - rebase requis)
--------------------------------------------------------------------------------

PLANS: {n} active | OPERATIONS: {none|rebase|merge} | RISKS: {liste}

================================================================================
Actions: /gitflow:4-plan | /gitflow:3-commit | /gitflow:6-abort
================================================================================
```

---

## Modes

| Mode | Output |
|------|--------|
| Normal | Affichage complet |
| `--short` | `[branch] status \| vX.Y.Z \| +X/-Y \| N pending` |
| `--json` | JSON structure |

## Codes sortie

| Code | Signification |
|------|---------------|
| 0 | OK |
| 1 | Warnings (pending, divergence) |
| 2 | Problemes (conflits, operation en cours) |
| 3 | Erreur (pas repo, no config) |

## Actions suggerees

| Etat | Suggestion |
|------|------------|
| Pending migrations | `dotnet ef database update` |
| Divergence > 5 | `git rebase develop` |
| Dirty workdir | `/gitflow:3-commit` ou `git stash` |
| Operation en cours | `/gitflow:6-abort` |
| No config | `/gitflow:1-init` |
