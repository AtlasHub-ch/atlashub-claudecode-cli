# Plan: feature/add-amelioration-gitflow → develop

**Date:** 2026-01-02
**Type:** Feature Integration
**Auteur:** GitFlow Plan 4

---

## Meta

| Info | Valeur |
|------|--------|
| **Branche source** | feature/add-amelioration-gitflow |
| **Branche cible** | develop |
| **Version actuelle** | 1.5.3 |
| **Version après merge** | 1.6.0 (minor increment) |
| **Stratégie** | Rebase + Merge --no-ff |

---

## Analyse

### Git

| Metric | Valeur |
|--------|--------|
| Commits | 3 commits depuis divergence |
| Fichiers modifiés | 11 fichiers |
| Working directory | ✅ Propre |
| Branche upstream | ✅ Synchronisée |

**Commits à intégrer:**
```
22b9f6f refactor(gitflow): integrate EF Core advanced features into existing commands
a69b5be feat(gitflow): ajouter commandes EF Core avancées
2cb954d feat(gitflow): améliorer organisation worktrees
```

**Fichiers modifiés:**
```
M  .claude/agents/gitflow/finish.md
M  .claude/agents/gitflow/start.md
M  .claude/commands/gitflow/10-start.md
M  .claude/commands/gitflow/11-finish.md
M  .claude/commands/gitflow/2-status.md
M  .documentation/gitflow.html
M  templates/agents/gitflow/finish.md
M  templates/agents/gitflow/start.md
M  templates/commands/gitflow/10-start.md
M  templates/commands/gitflow/11-finish.md
M  templates/commands/gitflow/2-status.md
```

### EF Core

| Metric | Valeur |
|--------|--------|
| Migrations sur feature | ⚠️ N/A (Projet Node.js) |
| Migrations sur develop | ⚠️ N/A (Projet Node.js) |
| Conflit ModelSnapshot | ❌ Non applicable |

---

## Stratégie d'intégration

**Type:** Feature → Develop
**Méthode:** Rebase + Merge --no-ff

### Justification

- ✅ Pas de migrations EF Core → pas de conflit potentiel
- ✅ Modifications isolées aux fichiers GitFlow
- ✅ Historique linéaire souhaité
- ✅ Merge --no-ff pour traçabilité

### Workflow

```
1. Rebase feature sur develop (mettre à jour avec derniers commits develop)
2. Résoudre conflits éventuels
3. Merger dans develop avec --no-ff (préserve historique)
4. Bump version 1.5.3 → 1.6.0
5. Tag et push
```

---

## Pré-requis

- [x] Working directory propre
- [ ] Build réussit (`npm run build` ou équivalent)
- [ ] Tests passent (`npm test` ou équivalent)
- [ ] Lint OK (`npm run lint` ou équivalent)
- [ ] Branch up-to-date avec remote

---

## Étapes d'exécution

### 1. Préparation

```bash
# Backup du commit actuel
BACKUP_COMMIT=$(git rev-parse HEAD)
echo "Backup: $BACKUP_COMMIT"

# Fetch latest
git fetch origin

# Vérifier qu'on est à jour
git status
```

### 2. Rebase sur develop

```bash
# Rebase interactif (optionnel, pour nettoyer commits)
git rebase -i origin/develop

# Ou rebase simple
git rebase origin/develop
```

**En cas de conflit:**
```bash
# Résoudre les conflits dans les fichiers
# Puis:
git add <fichiers_résolus>
git rebase --continue
```

### 3. Tests de validation

```bash
# Build
npm run build

# Tests
npm test

# Lint
npm run lint
```

### 4. Merge dans develop

```bash
# Checkout develop
git checkout develop
git pull origin develop

# Merge feature avec --no-ff (preserve history)
git merge --no-ff feature/add-amelioration-gitflow -m "feat(gitflow): amélioration organisation worktrees et commandes EF Core

- Organisation worktrees: ../project-worktrees/{type}s/{name}/
- Intégration fonctionnalités EF Core avancées dans commandes existantes
- Migration status global dans /gitflow:2-status
- Questions release pour reset main et consolidation migrations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 5. Bump version

```bash
# Update version 1.5.3 → 1.6.0
npm version 1.6.0 --no-git-tag-version

# Commit version bump
git add package.json package-lock.json
git commit -m "chore: bump version to 1.6.0"
```

### 6. Push

```bash
# Push develop
git push origin develop

# Push tags (si créés)
git push origin --tags
```

### 7. Nettoyage (optionnel)

```bash
# Supprimer branche feature locale
git branch -d feature/add-amelioration-gitflow

# Supprimer branche remote (après vérification)
git push origin --delete feature/add-amelioration-gitflow
```

---

## Rollback

**En cas de problème pendant le rebase:**

```bash
# Annuler le rebase
git rebase --abort

# Retour au commit de backup
git reset --hard $BACKUP_COMMIT
```

**En cas de problème après merge dans develop:**

```bash
# Checkout develop
git checkout develop

# Reset au commit avant merge
git reset --hard origin/develop

# Force push (⚠️ DANGEREUX, seulement si pas encore partagé)
# git push --force-with-lease origin develop
```

---

## Validation post-intégration

- [ ] develop contient tous les commits de feature
- [ ] Version mise à jour (1.6.0)
- [ ] Build passe sur develop
- [ ] Tests passent sur develop
- [ ] Historique propre (`git log --oneline --graph`)
- [ ] Remote synchronisé

---

## Notes

- Cette feature améliore l'organisation des worktrees GitFlow
- Intègre les fonctionnalités EF Core avancées dans les commandes existantes
- Pas d'impact sur les migrations (projet Node.js)
- Modifications isolées aux fichiers GitFlow

---

## Exécution

**Manuelle:** Suivre les étapes ci-dessus
**Automatique:** `/gitflow:5-exec .claude/gitflow/plans/feature-add-amelioration-gitflow_20260102.md`

---

**Statut:** ⏳ En attente d'exécution
