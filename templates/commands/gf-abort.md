---
description: Annule un plan GitFlow en cours et propose un rollback
args: [fichier_plan]
---

# GitFlow Abort

## Processus

1. Identifier le plan à annuler
2. Détecter les opérations Git en cours (rebase, merge, cherry-pick)
3. Proposer les options :
   - Annuler l'opération en cours
   - Rollback au dernier checkpoint
   - Rollback complet à l'état initial
4. Exécuter l'action choisie
5. Marquer le plan comme `_ABORTED`

## Commandes de détection

```bash
test -d .git/rebase-merge && echo "REBASE_IN_PROGRESS"
test -f .git/MERGE_HEAD && echo "MERGE_IN_PROGRESS"
test -f .git/CHERRY_PICK_HEAD && echo "CHERRY_PICK_IN_PROGRESS"
```

## Commandes de rollback

```bash
git rebase --abort 2>/dev/null
git merge --abort 2>/dev/null
git cherry-pick --abort 2>/dev/null
```
