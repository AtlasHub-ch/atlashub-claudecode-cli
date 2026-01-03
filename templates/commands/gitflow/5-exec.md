---
description: Phase 5 - Execute plan with versioning auto-increment
agent: gitflow-exec
model: sonnet
args: [plan_file]
---

# Phase 5: EXEC - Plan Execution

Tu es expert GitFlow et EF Core. Execute le plan d'integration de maniere securisee.

**Argument:** `$ARGUMENTS` = chemin plan (optionnel, prend le plus recent)

---

## Pre-validation (OBLIGATOIRE)

**Verifier la branche courante AVANT toute action:**

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Branches autorisees: feature/*, release/*, hotfix/*
if [[ ! $BRANCH =~ ^(feature|release|hotfix)/ ]]; then
  echo "ERREUR: Cette commande ne peut etre executee que depuis une branche GitFlow"
  echo ""
  echo "Branche actuelle: $BRANCH"
  echo "Branches autorisees: feature/*, release/*, hotfix/*"
  echo ""
  echo "Vous devez etre sur la branche source du plan pour l'executer."
  echo "Utilisez: git checkout {branche-source}"
  exit 1
fi
```

**Si branche invalide:** Afficher l'erreur et STOPPER. Ne pas continuer le workflow.

---

## Workflow

### 1. Load plan

- Find plan file (argument or most recent in [.claude/gitflow/plans/](.claude/gitflow/plans/))
- Extract: source branch, target, initial commit, version

### 2. Verifier pre-requis

- Working directory propre
- Sur la bonne branche
- Build OK
- Plan valide

### 3. Create checkpoint (on source branch)

Save checkpoint in [.claude/gitflow/logs/](.claude/gitflow/logs/)`checkpoint_{timestamp}.json`:
- Branch, commit, plan, status
- Backup migrations if present
- **IMPORTANT: Commit checkpoint on source branch BEFORE merge**

```bash
git add .claude/gitflow/logs/checkpoint_{timestamp}.json
git commit -m "chore(gitflow): create integration checkpoint"
```

### 4. Executer etapes

**Rebase (si necessaire):**
- Fetch origin
- Rebase sur target
- Si conflit ModelSnapshot: accept theirs + regenerer migration

**Merge:**
- Checkout target (utiliser worktree si necessaire: `git -C {worktree_path}`)
- Pull
- Merge --no-ff source

**Release/Hotfix - Version:**
1. Lire version depuis source configuree (csproj, VERSION, etc.)
2. Creer tag avec version actuelle
3. Calculer nouvelle version (minor pour release, patch pour hotfix)
4. Mettre a jour le fichier source
5. Sync config.json

**Release - Double merge:**
- Merge sur main
- Tag
- Merge main sur develop

### 5. Archiver plan (sur target branch)

**IMPORTANT: Toujours archiver et commiter sur la branche cible AVANT le push**

```bash
# Sur target branch (develop)
mv .claude/gitflow/plans/{plan}.md .claude/gitflow/plans/{plan}_DONE_{timestamp}.md
# Mettre a jour checkpoint avec status "completed"
git add .claude/gitflow/logs/ .claude/gitflow/plans/
git commit -m "chore(gitflow): archive integration plan and checkpoint"
```

### 6. Push

- Push target branch
- Push tag(s)
- Verifier CI/CD declenche

### 7. Validation

- Build OK
- Tests OK (si disponibles)
- Migrations list correcte
- Historique git correct

### 8. Finaliser

- Afficher resume et prochaines etapes
- Suggerer nettoyage branche source si applicable

---

## Gestion conflits ModelSnapshot

Si conflit pendant rebase:
1. Accepter version develop: `git checkout --theirs */Migrations/*ModelSnapshot.cs`
2. Regenerer migration: `dotnet ef migrations add {NomMigration}`
3. Continuer rebase: `git rebase --continue`

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:5-exec` | Plan le plus recent |
| `/gitflow:5-exec {plan}` | Plan specifie |
| `/gitflow:5-exec --yes` | Sans confirmations |
| `/gitflow:5-exec --dry-run` | Simulation |
| `/gitflow:5-exec --resume` | Reprendre execution interrompue |

## Rollback rapide

Si echec:

```
/gitflow:6-abort --checkpoint
```
