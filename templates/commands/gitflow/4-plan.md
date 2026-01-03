---
description: Phase 4 - Generate integration plan with versioning and EF Core analysis
agent: gitflow-plan
model: sonnet
---

# Phase 4: PLAN - Integration Planning

Tu es expert GitFlow et EF Core. Cree un plan d'integration pour la branche courante.

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
  echo "Pour creer une branche:"
  echo "  /gitflow:10-start feature \"description\""
  echo "  /gitflow:10-start release \"v1.x.0\""
  echo "  /gitflow:10-start hotfix \"correctif\""
  exit 1
fi
```

**Si branche invalide:** Afficher l'erreur et STOPPER. Ne pas continuer le workflow.

---

## Workflow

### 1. Analyser contexte

**Git:**
- Branche courante et type (feature/release/hotfix)
- Commits depuis divergence avec develop/main
- Fichiers modifies

**Version:**
- Lire depuis source configuree (csproj, VERSION, etc.)
- Calculer nouvelle version selon type branche

**EF Core:**
- Migrations sur cette branche
- Migrations sur develop (absentes ici)
- Conflit ModelSnapshot? (modifie des deux cotes)

### 2. Determiner strategie

**Feature → Develop:**
| Condition | Strategie |
|-----------|-----------|
| Pas de migrations | Rebase + Merge --no-ff |
| Migrations sans conflit | Rebase + Merge --no-ff |
| Conflit ModelSnapshot | Rebase + Remove migration + Re-add |

**Release → Main + Develop:**
| Condition | Strategie |
|-----------|-----------|
| Release stable | Tag v{VERSION} + Double merge |
| Migrations pending | Script SQL idempotent |
| Version | Auto-increment minor |

**Hotfix → Main + Develop:**
| Condition | Strategie |
|-----------|-----------|
| Migration urgente | Prefix `Hotfix_` + Script SQL |
| Version | Auto-increment patch |

### 3. Generer fichier plan

Cree `.claude/gitflow/plans/{type}-{nom}_{date}.md` :

````markdown
# Plan: {BRANCH_NAME}

## Meta
- **Source**: {branch} → **Cible**: {target}
- **Version**: {current} → {new}

## Analyse
| Git | EF Core |
|-----|---------|
| {n} commits | {n} migrations |
| {n} fichiers | Conflit: {oui|non} |

## Pre-requis
- [ ] Working dir propre
- [ ] Build OK
- [ ] Tests OK

## Etapes
1. Preparation (fetch, backup)
2. Migrations (si conflit: remove + rebase + re-add)
3. Integration (rebase/merge selon strategie)
4. Version (tag + update fichier source)
5. Validation (build, tests, migrations list)

## Rollback
Reset au commit initial + restore migrations backup

## Executer

```
/gitflow:5-exec {fichier_plan}
```
````

### 4. Afficher resume

````
Plan genere: .claude/gitflow/plans/{name}.md

Branche: {source} → {target}
Version: {current} → {new}
Strategie: {rebase|merge|remove+readd}

Executez:

```
/gitflow:5-exec
```
````

---

## Cas speciaux

**Migrations sur les deux branches:**
- Merger develop d'abord
- Resoudre conflits ModelSnapshot
- `dotnet ef migrations add MergeSnapshot --force`

**Hotfix avec migration:**
- Prefix migration `Hotfix_`
- Script SQL FROM derniere migration main
