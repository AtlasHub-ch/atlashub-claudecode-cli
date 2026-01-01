---
description: Phase 6 - Abort operations, rollback, and branch abandonment
agent: gitflow-abort
model: sonnet
args: [option]
---

# Phase 6: ABORT - Rollback & Recovery

Tu es expert GitFlow et EF Core. Annule proprement et restaure l'etat precedent.

**Argument:** `$ARGUMENTS` = option (--git, --checkpoint, --full, --migrations, --database, --branch)

---

## Workflow

### 1. Analyser etat

**Operations Git en cours:**
- Rebase en cours? (`.git/rebase-merge/`)
- Merge en cours? (`.git/MERGE_HEAD`)
- Cherry-pick en cours? (`.git/CHERRY_PICK_HEAD`)
- Conflits? (`git ls-files -u`)

**Type de branche (pour --branch):**
- `feature/*` → abandon feature
- `release/*` → abandon release
- `hotfix/*` → abandon hotfix
- autre → erreur

**Ressources disponibles:**
- Plans actifs dans `.claude/gitflow/plans/`
- Checkpoints dans `.claude/gitflow/logs/checkpoint_*.json`
- Backups migrations dans `.claude/gitflow/logs/migrations_backup_*/`

### 2. Proposer options (si aucun argument)

```
OPTIONS DE ROLLBACK
═══════════════════════════════════════════════════════════════
[1] --git         Annuler operation Git (rebase/merge --abort)
[2] --checkpoint  Rollback au checkpoint (reset + restore)
[3] --full        Rollback complet plan (reset hard au debut)
[4] --migrations  Rollback migrations seules (restore fichiers)
[5] --database    Rollback database (ef database update)
[6] --branch      Abandonner branche courante (feature/release/hotfix)
[0] Annuler
═══════════════════════════════════════════════════════════════
```

---

## Option: --git

Annuler operation Git en cours:

```bash
git rebase --abort   # si rebase
git merge --abort    # si merge
git cherry-pick --abort  # si cherry-pick
```

---

## Option: --checkpoint

Rollback au dernier checkpoint:

1. Lire commit du checkpoint
2. Abort operations en cours
3. Reset hard au commit
4. Restore migrations si backup existe

---

## Option: --full

Rollback complet au debut du plan:

1. Lire commit initial du plan
2. Reset hard
3. Marquer plan comme ABORTED

---

## Option: --migrations

Restaurer fichiers migration depuis backup:

1. Copier depuis `.claude/gitflow/logs/migrations_backup_*/`
2. Rebuild pour verifier

---

## Option: --database {migration}

Rollback database:

```bash
dotnet ef database update {migration}
# ou reset complet:
dotnet ef database update 0
```

---

## Option: --branch (ABANDON)

Abandonner la branche courante sans merger. Detection automatique du type.

### Workflow abandon

```
1. Detecter type de branche (feature/release/hotfix)
2. Demander confirmation avec resume
3. Salvage si applicable (release → corrections vers develop)
4. Logger l'abandon
5. Supprimer la branche
6. Nettoyer worktree si applicable
```

### Feature → Abandon

```
⚠ ABANDON FEATURE

Branche: feature/{name}
Commits: {n} depuis develop

Actions:
✗ NE PAS merger sur develop
✓ Archiver (optionnel avec --archive)
✓ Supprimer la branche
```

**Options specifiques:**
- `--archive` : Creer tag `archive/feature/{name}` avant suppression
- `--keep-local` : Garder branche locale

### Release → Abandon

```
⚠ ABANDON RELEASE

Branche: release/{version}
Commits: {n} depuis develop
  - {n} corrections (bug fixes)
  - {n} autres commits

Actions:
✗ NE PAS merger sur main
✗ NE PAS creer de tag
✓ Salvage corrections vers develop (sauf si --no-salvage)
✓ Supprimer la branche
```

**Options specifiques:**
- `--salvage` (defaut) : Merge corrections vers develop
- `--no-salvage` : Ne pas recuperer les corrections
- `--keep-local` : Garder branche locale

**Salvage workflow:**
```bash
git checkout develop
git merge --no-ff release/{version} -m "chore: salvage fixes from abandoned release/{version}"
```

### Hotfix → Abandon

```
⚠ ABANDON HOTFIX

Branche: hotfix/{name}
Commits: {n} depuis main

Actions:
✗ NE PAS merger sur main
✗ NE PAS merger sur develop
✓ Supprimer la branche
```

**Options specifiques:**
- `--salvage-to-develop` : Merger vers develop (rare)
- `--keep-local` : Garder branche locale

### Log abandon

Creer `.claude/gitflow/logs/abort_{timestamp}.json`:

```json
{
  "timestamp": "{ISO_DATE}",
  "type": "branch-abort",
  "branch_type": "feature|release|hotfix",
  "branch_name": "{full_name}",
  "reason": "{raison si fournie}",
  "commits_count": {n},
  "salvaged": true|false,
  "salvage_commit": "{hash}"|null,
  "archived": true|false,
  "archive_tag": "{tag}"|null
}
```

### Nettoyage worktree

Si la branche utilise un worktree:

```bash
git worktree remove {path} --force
```

---

## Modes complets

| Commande | Action |
|----------|--------|
| `/gitflow:6-abort` | Analyse + propose options |
| `/gitflow:6-abort --git` | Annule operation Git |
| `/gitflow:6-abort --checkpoint` | Rollback dernier checkpoint |
| `/gitflow:6-abort --full` | Rollback complet |
| `/gitflow:6-abort --migrations` | Restore migrations |
| `/gitflow:6-abort --database {mig}` | Rollback DB |
| `/gitflow:6-abort --branch` | Abandonner branche courante |
| `/gitflow:6-abort --branch --archive` | Abandon + archive (feature) |
| `/gitflow:6-abort --branch --no-salvage` | Abandon sans salvage (release) |
| `/gitflow:6-abort --branch --reason "..."` | Abandon avec raison |

---

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

**Abandonner feature en cours:**
```
/gitflow:6-abort --branch
# ou avec archive
/gitflow:6-abort --branch --archive
```

**Abandonner release echouee:**
```
/gitflow:6-abort --branch
# Corrections seront salvagees vers develop
```

**Abandonner hotfix invalide:**
```
/gitflow:6-abort --branch
# Rien n'est merge, branche supprimee
```

---

## Resume post-abandon

```
═══════════════════════════════════════════════════════════════
                    BRANCHE ABANDONNEE
═══════════════════════════════════════════════════════════════

Type:        {feature|release|hotfix}
Branche:     {nom complet}
Commits:     {n} (perdus|salvages|archives)
Raison:      {raison ou "non specifiee"}

Actions effectuees:
  {✓|✗} Salvage vers develop
  {✓|✗} Archive creee
  ✓ Branche supprimee
  {✓|✗} Worktree nettoye

═══════════════════════════════════════════════════════════════

Prochaines etapes:
  - Documenter la raison si besoin
  - Creer issue pour suivi si applicable
  - Demarrer nouvelle branche: /gitflow:10-start {type} {nom}

═══════════════════════════════════════════════════════════════
```

---

## Recuperation si erreur

**Feature archivee:**
```bash
git checkout -b feature/{name} archive/feature/{name}
```

**Branche non archivee (reflog):**
```bash
git reflog
git checkout -b {branch} {commit-hash}
```
