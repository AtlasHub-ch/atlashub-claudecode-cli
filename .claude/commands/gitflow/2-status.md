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

EF CORE
  Migrations: {total} total, {pending} pending
  [Pending] {liste}

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
