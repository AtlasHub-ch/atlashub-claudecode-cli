# Plan d'Intégration: hotfix/documentation-versions

**Date de création:** 2026-01-02
**Statut:** DRAFT

---

## Métadonnées

| Information | Valeur |
|------------|--------|
| **Source** | hotfix/documentation-versions |
| **Cible** | main + develop |
| **Type** | Hotfix |
| **Version actuelle** | 1.5.1 |
| **Version cible** | 1.5.2 |
| **Auto-increment** | patch |

---

## Analyse

### Git

| Métrique | Valeur |
|----------|--------|
| Commits depuis main | 0 (branche vient d'être créée) |
| Fichiers modifiés (non committés) | 14 fichiers |
| Working directory | NON PROPRE ⚠️ |

**Fichiers modifiés:**
- `.documentation/` (11 fichiers HTML)
- `.documentation/css/styles.css`
- `package.json`
- `scripts/sync-doc-version.js` (nouveau)
- `scripts/fix-table-columns.js` (nouveau)

### EF Core

| Métrique | Valeur |
|----------|--------|
| Migrations sur branche | N/A (projet Node.js) |
| Migrations sur main | N/A |
| Conflit ModelSnapshot | Non |

**Note:** Ce projet utilise Node.js/TypeScript, pas de migrations EF Core.

---

## Stratégie d'Intégration

**Type:** Hotfix → Main + Develop
**Méthode:** Merge --no-ff (double merge)

### Workflow

```
hotfix/documentation-versions
    ↓
  main (v1.5.2) + tag
    ↓
  develop (sync)
```

### Actions requises

1. **Commit les changements** sur la branche hotfix
2. **Merge vers main** avec --no-ff
3. **Tag la version** v1.5.2
4. **Merge vers develop** pour synchronisation

---

## Pré-requis

- [ ] Working directory propre (actuellement: **NON ✗**)
- [ ] Build OK (`npm run build`)
- [ ] Tests OK (`npm test`)
- [ ] Lint OK (`npm run lint`)

---

## Étapes d'Exécution

### Phase 1: Préparation

```bash
# 1.1 Fetch latest changes
git fetch origin --prune --tags

# 1.2 Vérifier working directory
git status

# 1.3 Backup (checkpoint)
git stash push -m "Checkpoint before integration"
```

### Phase 2: Validation

```bash
# 2.1 Build
npm run build

# 2.2 Tests
npm test

# 2.3 Lint
npm run lint
```

### Phase 3: Commit (si nécessaire)

```bash
# Commit les changements actuels
git add .
git commit -m "hotfix: fix documentation version sync and table columns

- Add sync-doc-version.js script to auto-sync version in docs
- Add fix-table-columns.js script to fix bilingual table structure
- Update all HTML documentation files with correct version
- Fix CSS for bilingual content display
- Integrate version sync into prepublishOnly npm script

🤖 Generated with Claude Code
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Phase 4: Merge vers Main

```bash
# 4.1 Checkout main
git checkout main

# 4.2 Merge hotfix --no-ff
git merge --no-ff hotfix/documentation-versions -m "Merge hotfix: documentation-versions

Fix version synchronization and table formatting in documentation.

🤖 Generated with Claude Code
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4.3 Tag version
git tag -a v1.5.2 -m "Release v1.5.2

Hotfix: Documentation version sync and table formatting

🤖 Generated with Claude Code
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Phase 5: Merge vers Develop

```bash
# 5.1 Checkout develop
git checkout develop

# 5.2 Merge main (to sync hotfix)
git merge --no-ff main -m "Merge hotfix v1.5.2 from main

Sync documentation fixes.

🤖 Generated with Claude Code
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Phase 6: Push

```bash
# 6.1 Push main
git push origin main

# 6.2 Push tag
git push origin v1.5.2

# 6.3 Push develop
git push origin develop
```

### Phase 7: Cleanup

```bash
# 7.1 Delete hotfix branch (optionnel)
git branch -d hotfix/documentation-versions

# 7.2 Delete remote branch (optionnel)
git push origin --delete hotfix/documentation-versions

# 7.3 Return to develop
git checkout develop
```

---

## Rollback

**En cas d'erreur pendant le merge:**

```bash
# Abort merge
git merge --abort

# Restore checkpoint
git stash pop

# Return to hotfix branch
git checkout hotfix/documentation-versions
```

**Après push (DESTRUCTIF - à éviter):**

```bash
# Reset main to previous commit
git checkout main
git reset --hard HEAD~1
git push origin main --force

# Delete tag
git tag -d v1.5.2
git push origin :refs/tags/v1.5.2
```

---

## Validation Post-Intégration

- [ ] Tag v1.5.2 existe
- [ ] Main pointe sur le commit de merge
- [ ] Develop synchronisé avec main
- [ ] Build OK sur main
- [ ] Tests OK sur main
- [ ] Documentation version = 1.5.2

---

## Exécution

Pour exécuter ce plan automatiquement:

```bash
/gitflow:5-exec hotfix-documentation-versions_20260102.md
```

Ou manuellement:

```bash
/gitflow:11-finish
```

---

## Notes

**Changements inclus:**
- Synchronisation automatique de la version dans la documentation
- Correction du formatage des tableaux bilingues (colonnes séparées → spans dans une cellule)
- Mise à jour du CSS pour le contenu bilingue

**Impact:**
- Aucune breaking change
- Correction de bugs visuels uniquement
- Scripts utilitaires ajoutés pour maintenir la cohérence
