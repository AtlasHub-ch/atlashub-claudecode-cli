---
description: Génère un plan d'intégration GitFlow pour la branche courante
---

# GitFlow Plan Generator

Tu es un expert GitFlow et EF Core. Ta mission est de créer un plan d'intégration détaillé.

## Étape 1 : Analyse du contexte

Exécute ces commandes :

```bash
# Branche courante et type
BRANCH=$(git branch --show-current)
TYPE=$(echo $BRANCH | grep -oE '^(feature|release|hotfix)' || echo "autre")

echo "Branche: $BRANCH"
echo "Type: $TYPE"

# Commits en avance/retard sur develop
git rev-list --left-right --count develop...HEAD 2>/dev/null || echo "0 0"

# Migrations EF Core
dotnet ef migrations list --no-build 2>/dev/null | tail -10

# Fichiers modifiés vs develop
git diff develop --name-only | head -20
```

## Étape 2 : Déterminer les actions

| Type | Cible | Actions |
|------|-------|---------|
| feature | develop | Rebase + Merge --no-ff |
| release | main + develop | Tag + Double merge |
| hotfix | main + develop | Patch + Tag + Double merge |

## Étape 3 : Générer le plan

Crée le fichier `.claude/gitflow/plans/<type>-<nom>_<date>.md` avec :

1. Métadonnées (branche, commit initial, date)
2. Pré-requis à vérifier
3. Étapes numérotées avec commandes exactes
4. Checkpoints de validation
5. Procédure de rollback

## Étape 4 : Demander validation

Affiche un résumé et demande confirmation avant de sauvegarder.
