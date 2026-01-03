---
description: Phase 11 - Finish and finalize a GitFlow branch (tag + merge back)
agent: gitflow-finish
model: sonnet
---

# Phase 11: FINISH - Finaliser une branche GitFlow

Tu es expert GitFlow. Finalise une branche apres merge de la PR.

**Argument:** `$ARGUMENTS` = branche a finaliser (optionnel, detecte automatiquement)

---

## Quand utiliser

| Situation | Action |
|-----------|--------|
| PR feature mergee | Cleanup uniquement |
| PR release mergee | Tag + merge back to develop |
| PR hotfix mergee | Tag + merge back to develop |

---

## Workflow

### 1. Detecter le contexte

```bash
# Branche courante ou argument
BRANCH=${ARGUMENTS:-$(git rev-parse --abbrev-ref HEAD)}

# Determiner le type
if [[ $BRANCH == feature/* ]]; then TYPE="feature"
elif [[ $BRANCH == release/* ]]; then TYPE="release"
elif [[ $BRANCH == hotfix/* ]]; then TYPE="hotfix"
else echo "Branche non GitFlow"; exit 1
fi
```

### 2. Verifier que PR est mergee

```bash
# Chercher PR associee
gh pr list --head $BRANCH --state merged --json number,mergedAt

# Si pas mergee
if [ -z "$PR" ]; then
  echo "⚠️ PR non trouvee ou non mergee"
  echo "Executez d'abord: /gitflow:7-pull-request puis /gitflow:9-merge"
  exit 1
fi
```

---

## Actions selon type

### Feature (simple cleanup)

```bash
# Detecter si on est dans un worktree et trouver le repo principal
CURRENT_DIR=$(pwd)
MAIN_WORKTREE=$(git worktree list --porcelain | grep -m1 "^worktree " | sed 's/worktree //')

# Revenir au repo principal AVANT de supprimer le worktree
cd "$MAIN_WORKTREE"

# Supprimer worktree si existe
WORKTREE_PATH="../worktrees/features/{name}"
if [ -d "$WORKTREE_PATH" ]; then
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
fi

# Supprimer branche locale
git checkout develop
git pull origin develop
git branch -d feature/{name}

# Supprimer branche remote (si pas fait par merge)
git push origin --delete feature/{name} 2>/dev/null || true
```

**Resume:**
```
FEATURE FINALISEE
────────────────────────────────
Branche:  feature/{name}
Mergee:   develop
PR:       #{number}
Cleanup:  ✓ Branche supprimee
────────────────────────────────
```

---

### Release (tag + merge back)

```bash
# 0. Detecter si on est dans un worktree et trouver le repo principal
CURRENT_DIR=$(pwd)
MAIN_WORKTREE=$(git worktree list --porcelain | grep -m1 "^worktree " | sed 's/worktree //')

# Revenir au repo principal AVANT toute operation
cd "$MAIN_WORKTREE"

# 1. Checkout main et pull
git checkout main
git pull origin main

# 2. Creer tag
VERSION=$(echo $BRANCH | sed 's/release\/v//')
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"

# 3. Merge back to develop
git checkout develop
git pull origin develop
git merge main --no-ff -m "chore: merge release v$VERSION back to develop"
git push origin develop

# 4. Cleanup worktree + branche
WORKTREE_PATH="../worktrees/releases/v$VERSION"
if [ -d "$WORKTREE_PATH" ]; then
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
fi
git branch -d release/v$VERSION
git push origin --delete release/v$VERSION 2>/dev/null || true
```

**Resume:**
```
RELEASE FINALISEE
════════════════════════════════════════
Version:  v{version}
Tag:      v{version} ✓
Main:     ✓ Mergee
Develop:  ✓ Merge back complete

Actions effectuees:
  ✓ Tag v{version} cree et pousse
  ✓ Main mis a jour
  ✓ Develop synchronise avec main
  ✓ Branche release supprimee
════════════════════════════════════════
```

---

### Hotfix (tag + merge back)

```bash
# 0. Detecter si on est dans un worktree et trouver le repo principal
CURRENT_DIR=$(pwd)
MAIN_WORKTREE=$(git worktree list --porcelain | grep -m1 "^worktree " | sed 's/worktree //')

# Revenir au repo principal AVANT toute operation
cd "$MAIN_WORKTREE"

# 1. Checkout main et pull
git checkout main
git pull origin main

# 2. Creer tag (patch version)
VERSION=$(cat package.json | jq -r '.version')
git tag -a "v$VERSION" -m "Hotfix v$VERSION"
git push origin "v$VERSION"

# 3. Merge back to develop
git checkout develop
git pull origin develop
git merge main --no-ff -m "chore: merge hotfix v$VERSION back to develop"
git push origin develop

# 4. Cleanup worktree + branche
WORKTREE_PATH="../worktrees/hotfixes/{name}"
if [ -d "$WORKTREE_PATH" ]; then
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
fi
git branch -d hotfix/{name}
git push origin --delete hotfix/{name} 2>/dev/null || true
```

**Resume:**
```
HOTFIX FINALISE
════════════════════════════════════════
Hotfix:   {name}
Version:  v{version}
Tag:      v{version} ✓

Actions effectuees:
  ✓ Tag v{version} cree et pousse
  ✓ Main mis a jour
  ✓ Develop synchronise (merge back)
  ✓ Branche hotfix supprimee
════════════════════════════════════════
```

---

## Gestion des conflits (merge back)

Si conflit lors du merge back to develop :

```
⚠️ CONFLIT DETECTE - MERGE BACK
────────────────────────────────
Le merge de main vers develop a des conflits.

Fichiers en conflit:
{liste fichiers}

Options:
1. Resoudre manuellement puis: git merge --continue
2. Annuler: git merge --abort

Commande recommandee:
  Resoudre conflits dans IDE
  git add .
  git merge --continue
  git push origin develop
────────────────────────────────
```

---

## Cleanup automatique des worktrees

Apres chaque finish, un cleanup cible est effectue pour le worktree de la branche finalisee:

```bash
# Fonction de cleanup cible (appelee automatiquement)
cleanup_worktree_for_branch() {
  BRANCH=$1
  WORKTREE_BASE="../worktrees"

  # Determiner le chemin selon le type
  if [[ $BRANCH == feature/* ]]; then
    NAME=${BRANCH#feature/}
    WORKTREE_PATH="$WORKTREE_BASE/features/$NAME"
  elif [[ $BRANCH == release/* ]]; then
    VERSION=${BRANCH#release/}
    WORKTREE_PATH="$WORKTREE_BASE/releases/$VERSION"
  elif [[ $BRANCH == hotfix/* ]]; then
    NAME=${BRANCH#hotfix/}
    WORKTREE_PATH="$WORKTREE_BASE/hotfixes/$NAME"
  fi

  # Supprimer si existe
  if [ -d "$WORKTREE_PATH" ]; then
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
    rm -rf "$WORKTREE_PATH" 2>/dev/null || true
    git worktree prune
    echo "✓ Worktree nettoye: $WORKTREE_PATH"
  fi
}

# Appel automatique
cleanup_worktree_for_branch "$BRANCH"
```

**Note:** Pour un audit complet de tous les worktrees, utilisez:

```
/gitflow:12-cleanup
```

---

## Resume final

```
GITFLOW FINISH COMPLETE
════════════════════════════════════════
Type:     {feature|release|hotfix}
Branche:  {branch_name}
Status:   FINALISEE

Resultats:
  PR:       #{number} (mergee)
  Tag:      {tag|N/A}
  Main:     {updated|N/A}
  Develop:  {updated|unchanged}
  Cleanup:  ✓ Branche supprimee
  Worktree: ✓ Nettoye

════════════════════════════════════════
Workflow GitFlow complete!
```

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:11-finish` | Finaliser branche courante |
| `/gitflow:11-finish feature/xxx` | Finaliser branche specifiee |
| `/gitflow:11-finish --dry-run` | Simulation |
| `/gitflow:11-finish --skip-tag` | Sans creation de tag |
