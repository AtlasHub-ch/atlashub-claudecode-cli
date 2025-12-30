---
description: Exécute un plan d'intégration GitFlow étape par étape
args: [fichier_plan]
---

# GitFlow Plan Executor

## Argument

`$ARGUMENTS` : Chemin vers le fichier plan (optionnel)

## Processus

1. Si pas d'argument, lister les plans dans `.claude/gitflow/plans/`
2. Charger et parser le plan sélectionné
3. Vérifier les pré-requis (branche correcte, pas de changements non commités)
4. Exécuter chaque étape avec confirmation
5. Logger les résultats dans le plan
6. Renommer le plan avec suffix `_DONE` à la fin

## Gestion des erreurs

Si une commande échoue :
- Afficher l'erreur clairement
- Proposer : Réessayer / Skip / Abort + Rollback
- Si rollback : exécuter les commandes de la section rollback du plan
