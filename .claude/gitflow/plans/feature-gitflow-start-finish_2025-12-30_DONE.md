# Plan: feature/gitflow-start-finish → develop

## Meta
- **Source**: feature/gitflow-start-finish
- **Cible**: develop
- **Type**: Feature Integration
- **Version**: 1.0.0 → 1.1.0 (auto-increment minor)
- **Date**: 2025-12-30

## Analyse

| Git | EF Core |
|-----|---------|
| 5 commits | N/A (Node.js/TypeScript) |
| 11 fichiers modifiés | N/A |
| Divergence: +0/-5 vs develop | - |

### Commits à intégrer
1. `bce1362` - chore: configure npm public registry for publication
2. `aef5a2a` - chore: remove prepare script, dist is committed
3. `4a440fd` - chore: add prepare script for npm install from git
4. `f36f490` - feat(gitflow): make worktree default in start command
5. `b817393` - feat: add gitflow start and finish commands

### Fichiers modifiés
- `.claude/commands/_resources/formatting-guide.md` (A)
- `.claude/commands/ba/3-validate.md` (M)
- `.claude/commands/ba/5-verify.md` (M)
- `.claude/commands/gitflow.md` (M)
- `.claude/commands/gitflow/10-start.md` (A)
- `.claude/commands/gitflow/11-finish.md` (A)
- `.claude/gitflow/config.json` (M)
- `package.json` (M)
- `templates/commands/gitflow.md` (M)
- `templates/commands/gitflow/10-start.md` (A)
- `templates/commands/gitflow/11-finish.md` (A)

## Stratégie: Rebase + Merge --no-ff

### Justification
- Pas de migrations EF Core (projet Node.js)
- Pas de conflit détecté
- Feature complète et stable
- Stratégie standard GitFlow pour features

## Pré-requis

- [x] Working directory propre
- [x] Branche synchronisée avec remote
- [ ] Build OK (`npm run build`)
- [ ] Tests OK (`npm test`)
- [ ] Linting OK (`npm run lint`)

## Étapes d'exécution

### 1. Préparation
```bash
git fetch origin
git checkout feature/gitflow-start-finish
git pull origin feature/gitflow-start-finish
```

### 2. Validation
```bash
npm run build
npm test
npm run lint
```

### 3. Rebase sur develop
```bash
git rebase origin/develop
# Résoudre conflits si nécessaire
git rebase --continue
```

### 4. Merge dans develop
```bash
git checkout develop
git merge feature/gitflow-start-finish --no-ff -m "Merge feature/gitflow-start-finish into develop"
```

### 5. Mise à jour version
```bash
# Update package.json: 1.0.0 → 1.1.0
npm version minor --no-git-tag-version
git add package.json
git commit -m "chore: bump version to 1.1.0"
```

### 6. Push
```bash
git push origin develop
```

### 7. Cleanup (optionnel)
```bash
git push origin --delete feature/gitflow-start-finish
git branch -d feature/gitflow-start-finish
```

## Rollback

En cas de problème:

```bash
# Identifier le commit avant merge
git reflog

# Reset hard
git reset --hard <commit_avant_merge>

# Force push (si déjà pushé)
git push origin develop --force
```

## Risques identifiés

- **Aucun** : Pas de conflit détecté, pas de migrations, divergence nulle

## Validation post-intégration

```bash
# Vérifier build
npm run build

# Vérifier tests
npm test

# Vérifier version
cat package.json | grep version

# Vérifier log
git log --oneline -10
```

## Exécuter ce plan

```bash
/gitflow:5-exec feature-gitflow-start-finish_2025-12-30.md
```

---

**Statut**: READY
**Approuvé par**: En attente
**Exécuté le**: -
