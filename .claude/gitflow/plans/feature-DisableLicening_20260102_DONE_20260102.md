# Plan GitFlow: feature/DisableLicening → develop

## Meta

| Information | Valeur |
|-------------|--------|
| **Source** | `feature/DisableLicening` |
| **Cible** | `develop` |
| **Type** | Feature branch |
| **Version actuelle** | 1.4.0 |
| **Version cible** | 1.5.0 (minor bump) |
| **Date création** | 2026-01-02 |
| **Stratégie** | Rebase + Merge --no-ff |

## Analyse

### Git

| Métrique | Valeur |
|----------|--------|
| **Commits sur feature** | 1 |
| **Commits sur develop** | 0 (aucun nouveau commit) |
| **Fichiers modifiés** | 8 fichiers |
| **Divergence** | Aucune (fast-forward possible) |

**Commits:**
```
edacd73 feat(license): disable license validation and add docs command
```

**Fichiers modifiés:**
- `dist/index.js`
- `dist/index.js.map`
- `package-lock.json`
- `package.json`
- `src/commands/docs.ts` (nouveau)
- `src/commands/index.ts`
- `src/index.ts`
- `src/lib/license.ts`

### EF Core

| Métrique | Valeur |
|----------|--------|
| **Migrations sur feature** | 0 (projet Node.js) |
| **Migrations sur develop** | 0 |
| **Conflit ModelSnapshot** | Non |

## Modifications principales

1. **Désactivation de la licence**
   - `src/lib/license.ts`: fonction `checkLicense()` retourne toujours `valid: true`

2. **Nouvelle commande docs**
   - `src/commands/docs.ts`: commande pour ouvrir la documentation HTML
   - Intégration dans `src/index.ts` et `src/commands/index.ts`

3. **Package configuration**
   - Ajout de `.documentation` dans les fichiers à publier

## Pré-requis

- [x] Working directory propre
- [ ] Build réussi (`npm run build`)
- [ ] Tests réussis (`npm test`)
- [ ] Lint passé (`npm run lint`)

## Stratégie d'intégration

**Type:** Feature → Develop (merge standard)

**Raisons:**
- Aucune migration EF Core (projet Node.js)
- Aucun commit divergent sur develop
- Fast-forward possible mais on utilise --no-ff pour traçabilité
- Pas de conflit attendu

**Commandes:**
```bash
# 1. Se positionner sur develop
git checkout develop

# 2. Récupérer les dernières modifications
git pull origin develop

# 3. Merger la feature avec --no-ff
git merge --no-ff feature/DisableLicening -m "Merge branch 'feature/DisableLicening' into develop"

# 4. Pousser vers origin
git push origin develop
```

## Étapes d'exécution

### 1. Préparation
```bash
# Sauvegarder l'état actuel
git branch backup-DisableLicening-20260102 feature/DisableLicening

# Fetch latest changes
git fetch origin

# Vérifier l'état
git status
```

### 2. Validation pre-merge
```bash
# Build
npm run build

# Tests (si disponibles)
npm test

# Lint
npm run lint
```

### 3. Intégration
```bash
# Checkout develop
git checkout develop

# Pull latest
git pull origin develop

# Merge feature avec --no-ff
git merge --no-ff feature/DisableLicening -m "Merge branch 'feature/DisableLicening' into develop

- Disable license validation (always returns valid enterprise plan)
- Add docs command to open HTML documentation in browser
- Include .documentation folder in npm package"

# Push
git push origin develop
```

### 4. Version bump (optionnel)
```bash
# Selon config GitFlow, feature → minor bump
# 1.4.0 → 1.5.0

npm version minor -m "chore: bump version to %s"
git push origin develop --tags
```

### 5. Nettoyage (optionnel)
```bash
# Supprimer la branche locale (si souhaité)
git branch -d feature/DisableLicening

# Supprimer la branche remote (si souhaité)
git push origin --delete feature/DisableLicening
```

### 6. Validation post-merge
```bash
# Vérifier l'historique
git log --oneline --graph --decorate -10

# Vérifier le build sur develop
npm run build

# Vérifier que la doc est incluse
ls -la .documentation/
```

## Rollback

Si quelque chose se passe mal après le merge:

```bash
# Revenir à l'état avant le merge
git checkout develop
git reset --hard origin/develop

# Ou utiliser le backup
git reset --hard backup-DisableLicening-20260102^
```

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Conflit de merge | Faible | Moyen | develop est à jour, pas de divergence |
| Build cassé | Faible | Moyen | Tests pre-merge obligatoires |
| Documentation manquante | Faible | Faible | Vérifier que .documentation est inclus |

## Notes

- Pas de migration EF Core à gérer (projet Node.js)
- Fast-forward possible mais --no-ff préféré pour l'historique
- Version bump de 1.4.0 → 1.5.0 recommandée (feature = minor)
- Branche backup créée pour rollback facile

## Exécution

Pour exécuter ce plan automatiquement:
```bash
/gitflow:5-exec feature-DisableLicening_20260102
```

Ou manuellement en suivant les étapes ci-dessus.

---

*Plan généré le 2026-01-02 par Claude GitFlow*
