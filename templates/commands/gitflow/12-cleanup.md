---
description: Phase 12 - Cleanup worktrees and orphan branches (audit and remove)
agent: gitflow-cleanup
model: sonnet
---

# Phase 12: CLEANUP - Audit et nettoyage des worktrees

Tu es expert GitFlow. Audite et nettoie les worktrees orphelins ou obsoletes.

**Argument:** `$ARGUMENTS` = options (--dry-run, --force, --stale-days=N)

---

## Prerequis

**IMPORTANT:** Cette commande doit etre executee depuis `main` ou `develop` uniquement.

```bash
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "develop" ]]; then
  echo "⚠️ ERREUR: Cette commande doit etre executee depuis main ou develop"
  echo "Branche courante: $CURRENT_BRANCH"
  echo ""
  echo "Executez: git checkout develop && /gitflow:12-cleanup"
  exit 1
fi
```

---

## Workflow

### 1. Collecter les informations

```bash
# Lister tous les worktrees
git worktree list --porcelain

# Lister toutes les branches locales
git branch -a

# Lister les branches remote
git fetch --prune
git branch -r
```

### 2. Analyser chaque worktree

Pour chaque worktree detecte:

| Verification | Condition | Status |
|--------------|-----------|--------|
| Branche existe localement | `git branch --list $BRANCH` | ✓ Active / ✗ Orphelin |
| Branche existe sur remote | `git branch -r --list origin/$BRANCH` | ✓ Trackee / ✗ Locale only |
| Derniere activite | `git log -1 --format=%ci $BRANCH` | Date dernier commit |
| Modifications non commitees | `git -C $WORKTREE status --porcelain` | ✓ Clean / ⚠️ Dirty |

### 3. Categoriser les worktrees

```
AUDIT WORKTREES
═══════════════════════════════════════════════════════════════

📁 Worktrees permanents (proteges):
   ✓ ../worktrees/main          → main
   ✓ ../worktrees/develop       → develop

📁 Worktrees actifs:
   ✓ ../worktrees/features/xxx  → feature/xxx (3 jours)
   ✓ ../worktrees/releases/v2   → release/v2.0.0 (1 jour)

⚠️ Worktrees orphelins (branche supprimee):
   ✗ ../worktrees/features/old  → feature/old (BRANCHE INEXISTANTE)
   ✗ ../worktrees/hotfixes/fix  → hotfix/fix (BRANCHE INEXISTANTE)

⏰ Worktrees stale (inactifs > {N} jours):
   ⚠ ../worktrees/features/abc  → feature/abc (45 jours sans commit)

💾 Worktrees dirty (modifications non commitees):
   ⚠ ../worktrees/features/wip  → feature/wip (fichiers modifies)

═══════════════════════════════════════════════════════════════
```

---

## Actions proposees

### Mode par defaut (interactif)

```
ACTIONS PROPOSEES
═══════════════════════════════════════════════════════════════

Orphelins a supprimer:
  [1] ../worktrees/features/old  (branche inexistante)
  [2] ../worktrees/hotfixes/fix  (branche inexistante)

Stale a examiner (> 30 jours):
  [3] ../worktrees/features/abc  (45 jours)

Options:
  [A] Supprimer tous les orphelins
  [S] Supprimer tous les stale
  [1-N] Supprimer individuellement
  [D] Details sur un worktree
  [Q] Quitter sans action

Choix: _
═══════════════════════════════════════════════════════════════
```

### Mode --dry-run

Affiche uniquement l'audit sans proposer d'actions.

### Mode --force

Supprime automatiquement tous les orphelins sans confirmation.

---

## Suppression d'un worktree

```bash
# Verifier si dirty
if [ -n "$(git -C $WORKTREE_PATH status --porcelain)" ]; then
  echo "⚠️ Worktree dirty - modifications non commitees"
  echo "Utilisez --force pour supprimer quand meme"
  exit 1
fi

# Supprimer le worktree
git worktree remove "$WORKTREE_PATH" --force

# Nettoyer le dossier si reste
rm -rf "$WORKTREE_PATH" 2>/dev/null || true

# Pruner les worktrees
git worktree prune
```

---

## Detection des dossiers orphelins

En plus des worktrees git, detecter les dossiers qui ne sont plus lies:

```bash
# Lister les worktrees connus
KNOWN_WORKTREES=$(git worktree list --porcelain | grep "^worktree " | sed 's/worktree //')

# Scanner les dossiers de worktrees
WORKTREE_BASE="../worktrees"
for TYPE in features releases hotfixes; do
  for DIR in "$WORKTREE_BASE/$TYPE"/*; do
    if [ -d "$DIR" ]; then
      # Verifier si c'est un worktree connu
      if ! echo "$KNOWN_WORKTREES" | grep -q "$DIR"; then
        echo "⚠️ Dossier orphelin: $DIR"
      fi
    fi
  done
done
```

---

## Resume final

```
CLEANUP COMPLETE
═══════════════════════════════════════════════════════════════

Worktrees analyses:     {total}
Permanents (proteges):  {n_permanent}
Actifs:                 {n_active}
Supprimes:              {n_deleted}
  - Orphelins:          {n_orphan}
  - Stale:              {n_stale}
Ignores (dirty):        {n_dirty}

Espace libere:          ~{size} MB

Dossiers orphelins:     {n_orphan_dirs}
  - Supprimes:          {n_orphan_dirs_deleted}

═══════════════════════════════════════════════════════════════
Environnement propre!
```

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:12-cleanup` | Audit interactif avec propositions |
| `/gitflow:12-cleanup --dry-run` | Audit seul, aucune action |
| `/gitflow:12-cleanup --force` | Supprime tous les orphelins automatiquement |
| `/gitflow:12-cleanup --stale-days=30` | Seuil pour worktrees stale (defaut: 30) |
| `/gitflow:12-cleanup --include-stale` | Inclut les stale dans la suppression auto |
| `/gitflow:12-cleanup --verbose` | Affiche les details de chaque worktree |

---

## Integration automatique

Cette commande est appelee automatiquement par:
- `/gitflow:11-finish` → Apres finalisation d'une branche
- `/gitflow:6-abort --branch` → Apres abandon d'une branche

Dans ces cas, seul le worktree de la branche concernee est nettoye (cleanup cible).

---

## Cleanup cible (usage interne)

Quand appelee depuis finish/abort avec une branche specifique:

```bash
# Usage interne
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
```

---

## Logs

Chaque cleanup est logue dans `.claude/gitflow/logs/cleanup_{timestamp}.json`:

```json
{
  "timestamp": "{ISO_DATE}",
  "type": "cleanup",
  "mode": "interactive|dry-run|force|targeted",
  "branch": "{main|develop}",
  "worktrees": {
    "analyzed": {n},
    "deleted": [
      { "path": "...", "branch": "...", "reason": "orphan|stale" }
    ],
    "skipped": [
      { "path": "...", "branch": "...", "reason": "dirty|active|permanent" }
    ]
  },
  "orphan_dirs": {
    "found": {n},
    "deleted": {n}
  }
}
```
