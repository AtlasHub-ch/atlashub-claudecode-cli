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

## Workflow

### 1. Charger plan

- Trouver le fichier plan (argument ou plus recent dans `.claude/gitflow/plans/`)
- Extraire: branche source, cible, commit initial, version

### 2. Verifier pre-requis

- Working directory propre
- Sur la bonne branche
- Build OK
- Plan valide

### 3. Creer checkpoint

Sauvegarder dans `.claude/gitflow/logs/checkpoint_{timestamp}.json`:
- Branche, commit, plan, status
- Backup migrations si presentes

### 4. Executer etapes

**Rebase (si necessaire):**
- Fetch origin
- Rebase sur target
- Si conflit ModelSnapshot: accept theirs + regenerer migration

**Merge:**
- Checkout target
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

### 5. Validation

- Build OK
- Tests OK (si disponibles)
- Migrations list correcte
- Historique git correct

### 6. Finaliser

- Archiver plan (suffix `_DONE_{timestamp}`)
- Afficher resume et prochaines etapes

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

Si echec: `/gitflow:6-abort --checkpoint`
