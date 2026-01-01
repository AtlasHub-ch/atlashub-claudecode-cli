---
description: Phase 6 - Abort with rollback including EF Core migrations
agent: gitflow-abort
model: sonnet
args: [option]
---

# Phase 6: ABORT - Rollback & Recovery

Tu es expert GitFlow et EF Core. Annule proprement et restaure l'etat precedent.

**Argument:** `$ARGUMENTS` = option (--git, --checkpoint, --full, --migrations, --database)

---

## Workflow

### 1. Analyser etat

**Operations Git en cours:**
- Rebase en cours? (`.git/rebase-merge/`)
- Merge en cours? (`.git/MERGE_HEAD`)
- Cherry-pick en cours? (`.git/CHERRY_PICK_HEAD`)
- Conflits? (`git ls-files -u`)

**Ressources disponibles:**
- Plans actifs dans `.claude/gitflow/plans/`
- Checkpoints dans `.claude/gitflow/logs/checkpoint_*.json`
- Backups migrations dans `.claude/gitflow/logs/migrations_backup_*/`

### 2. Proposer options

```
OPTIONS DE ROLLBACK
-------------------
[1] Annuler operation Git (rebase/merge --abort)
[2] Rollback au checkpoint (reset + restore migrations)
[3] Rollback complet plan (reset hard au debut)
[4] Rollback migrations seules (restore fichiers)
[5] Rollback database (ef database update {migration})
[0] Annuler
```

### 3. Executer selon option

**--git:** Annuler operation en cours
- `git rebase --abort`
- `git merge --abort`
- `git cherry-pick --abort`

**--checkpoint:** Rollback au dernier checkpoint
- Lire commit du checkpoint
- Abort operations en cours
- Reset hard au commit
- Restore migrations si backup existe

**--full:** Rollback complet au debut du plan
- Lire commit initial du plan
- Reset hard
- Marquer plan comme ABORTED

**--migrations:** Restaurer fichiers migration
- Copier depuis backup vers dossier Migrations
- Rebuild pour verifier

**--database {migration}:** Rollback DB
- `dotnet ef database update {migration}`
- Ou `dotnet ef database update 0` pour reset complet

### 4. Verification post-rollback

- Branche et commit actuels
- Status working directory
- Build OK?
- Migrations list

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:6-abort` | Analyse + propose options |
| `/gitflow:6-abort --git` | Annule operation Git |
| `/gitflow:6-abort --checkpoint` | Rollback dernier checkpoint |
| `/gitflow:6-abort --full` | Rollback complet |
| `/gitflow:6-abort --migrations` | Restore migrations |
| `/gitflow:6-abort --database {mig}` | Rollback DB |

## Scenarios courants

**Conflit rebase:**
```
/gitflow:6-abort --git
git fetch origin develop
/gitflow:4-plan
```

**Migration corrompue:**
```
/gitflow:6-abort --checkpoint
/gitflow:3-commit
```

**Annulation feature:**
```
/gitflow:6-abort --full
git branch -D feature/xxx
```
