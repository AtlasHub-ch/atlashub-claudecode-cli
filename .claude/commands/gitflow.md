---
description: GitFlow workflow with versioning and EF Core migration management
---

# GitFlow Workflow

Tu es expert GitFlow et EF Core. Gere le workflow de branches et migrations pour projets .NET.

**ULTRA THINK avant chaque phase.** Affiche le heading: `# 1. INIT`, `# 2. STATUS`, etc.

---

## Overview

```
                    ┌─────────────────────────────────────────┐
                    │           GITFLOW WORKFLOW              │
                    └─────────────────────────────────────────┘

10. START ──────────────────────────────────────────────────────┐
     │                                                          │
     ▼                                                          │
feature/* ──3.COMMIT──► 7.PR ──► 8.REVIEW ──► 9.MERGE ──► develop
     │                                                          │
     │                                                          │
10. START (release) ────────────────────────────────────────────┤
     │                                                          │
     ▼                                                          │
release/* ──3.COMMIT──► 7.PR(main) ──► 9.MERGE ──► 11.FINISH ──► main + tag
     │                                               │
     └───────────────── merge back ◄─────────────────┘
                                                          │
10. START (hotfix) ──────────────────────────────────────┤
     │                                                    │
     ▼                                                    │
hotfix/* ──3.COMMIT──► 7.PR(main) ──► 9.MERGE ──► 11.FINISH ──► main + tag
     │                                               │
     └───────────────── merge back ◄─────────────────┘

                    6. ABORT ◄── (rollback si probleme)
```

## Phases

| # | Command | Quand | Action |
|---|---------|-------|--------|
| 1 | `/gitflow:1-init` | Premier setup | Config + Branches + Versioning |
| 2 | `/gitflow:2-status` | Avant action | Etat complet |
| 3 | `/gitflow:3-commit` | Apres modifs | Validation EF Core |
| 4 | `/gitflow:4-plan` | Avant merge | Plan detaille |
| 5 | `/gitflow:5-exec` | Executer | Merge + Tag + Version |
| 6 | `/gitflow:6-abort` | Probleme | Rollback |
| 7 | `/gitflow:7-pull-request` | Feature prete | Creer PR + checks |
| 8 | `/gitflow:8-review` | Review PR | Checklist + feedback |
| 9 | `/gitflow:9-merge` | PR approuvee | Merge + post-actions |
| 10 | `/gitflow:10-start` | Nouvelle branche | Creer feature/release/hotfix |
| 11 | `/gitflow:11-finish` | Apres merge | Tag + merge back + cleanup |

## Workflow typique

```bash
# 1. Demarrer une feature
/gitflow:10-start feature ma-feature

# 2. Developper + commiter
/gitflow:3-commit

# 3. Creer PR vers develop
/gitflow:7-pull-request

# 4. Review et merge
/gitflow:8-review {PR}
/gitflow:9-merge {PR}

# 5. Pour release: finaliser (tag + merge back)
/gitflow:11-finish
```

## Versioning (.NET)

**Sources (priorite):** csproj → Directory.Build.props → AssemblyInfo → VERSION → git-tag

**Auto-increment:**
- feature → minor (1.2.0 → 1.3.0)
- hotfix → patch (1.2.0 → 1.2.1)
- release → confirmation

## EF Core Rules

1. **1 migration/feature** - Recreer, pas accumuler
2. **3 fichiers requis** - Migration + Designer + ModelSnapshot
3. **Sync avant merge** - Rebase sur develop
4. **Conflit ModelSnapshot** - Accept theirs + Recreate
5. **Release** - Script SQL idempotent

## Priority

**Safety > Correctness > Speed**

---

User: $ARGUMENTS
