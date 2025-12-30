---
description: Affiche l'état GitFlow complet du repository
---

# GitFlow Status

Affiche :

1. **Branche courante** et son type (feature/release/hotfix/autre)
2. **Synchronisation** avec develop et main (commits ahead/behind)
3. **Migrations EF Core** pending
4. **Plans en attente** dans `.claude/gitflow/plans/`
5. **Dernier tag** de version

## Commandes à exécuter

```bash
git branch --show-current
git rev-list --left-right --count develop...HEAD
git rev-list --left-right --count main...HEAD
git describe --tags --abbrev=0 main 2>/dev/null
dotnet ef migrations list --no-build 2>/dev/null
ls -la .claude/gitflow/plans/*.md 2>/dev/null | grep -v "_DONE"
```

## Format d'affichage

Utilise un format visuel avec des emojis et une structure claire.
