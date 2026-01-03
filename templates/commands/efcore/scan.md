---
description: Scanner toutes les branches pour migrations avec analyse de risque
agent: efcore-scan
model: sonnet
---

# EF Core Scan - Cross-Branch Migration Scanner

Scanne toutes les branches actives pour detecter les migrations et analyser les risques de conflit.

**UTILISATION:** Avant de creer une migration ou avant un merge pour verifier l'etat des autres branches.

**SECURITE:** Lecture seule - aucune modification.

---

## ETAPE 1: Lister les worktrees actifs

```bash
# Verifier que les worktrees existent
WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")

if [ ! -d "$WORKTREE_BASE" ]; then
  echo "Structure worktrees non trouvee: $WORKTREE_BASE"
  echo "Executez /gitflow:1-init pour creer la structure"
  exit 1
fi

# Lister tous les worktrees
echo "WORKTREES DETECTES"
echo "=================="
git worktree list
echo ""
```

---

## ETAPE 2: Scanner les migrations par branche

```bash
# Pour chaque worktree
for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ -z "$BRANCH" ]; then
    continue
  fi

  # Trouver le dossier Migrations
  MIGRATIONS_DIR=$(find "$worktree" -type d -name "Migrations" 2>/dev/null | head -1)

  if [ -n "$MIGRATIONS_DIR" ]; then
    # Compter les migrations
    MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -v "Designer" | grep -v "Snapshot" | wc -l)

    # Hash du ModelSnapshot
    SNAPSHOT=$(find "$MIGRATIONS_DIR" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)
    if [ -n "$SNAPSHOT" ]; then
      SNAPSHOT_HASH=$(md5sum "$SNAPSHOT" 2>/dev/null | cut -d' ' -f1 | head -c 8)
    else
      SNAPSHOT_HASH="N/A"
    fi

    echo "$BRANCH | $MIGRATION_COUNT migrations | Snapshot: $SNAPSHOT_HASH"
  fi
done
```

---

## ETAPE 3: Comparer avec develop

```bash
# Obtenir le hash du ModelSnapshot de develop
DEVELOP_WORKTREE="$WORKTREE_BASE/develop"

if [ -d "$DEVELOP_WORKTREE" ]; then
  DEVELOP_SNAPSHOT=$(find "$DEVELOP_WORKTREE" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$DEVELOP_SNAPSHOT" ]; then
    DEVELOP_HASH=$(md5sum "$DEVELOP_SNAPSHOT" 2>/dev/null | cut -d' ' -f1)
    echo ""
    echo "REFERENCE: develop ModelSnapshot = ${DEVELOP_HASH:0:8}"
  fi
fi
```

---

## ETAPE 4: Analyser les risques de conflit

```bash
echo ""
echo "ANALYSE DES RISQUES"
echo "==================="

# Comparer chaque branche avec develop
for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "main" ]; then
    continue
  fi

  SNAPSHOT=$(find "$worktree" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$SNAPSHOT" ] && [ -n "$DEVELOP_SNAPSHOT" ]; then
    # Comparer les snapshots
    if diff -q "$SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
      RISK="NONE"
    else
      # Analyser les differences
      DIFF_LINES=$(diff "$DEVELOP_SNAPSHOT" "$SNAPSHOT" 2>/dev/null | wc -l)

      if [ "$DIFF_LINES" -lt 50 ]; then
        RISK="LOW"
      elif [ "$DIFF_LINES" -lt 200 ]; then
        RISK="MEDIUM"
      else
        RISK="HIGH"
      fi
    fi

    echo "$BRANCH: $RISK"
  fi
done
```

---

## ETAPE 5: Recommander l'ordre de merge

```bash
echo ""
echo "ORDRE DE MERGE RECOMMANDE"
echo "========================="
echo "1. Branches avec RISK=NONE (independantes)"
echo "2. Branches avec RISK=LOW (modifications mineures)"
echo "3. Branches avec RISK=MEDIUM (attention a l'ordre)"
echo "4. Branches avec RISK=HIGH (rebase requis avant merge)"
```

---

## Output Format

```
================================================================================
                    EF CORE CROSS-BRANCH SCAN
================================================================================

WORKTREES DETECTES (5)
  main/                    [main]
  develop/                 [develop]
  features/user-auth/      [feature/user-auth]
  features/add-products/   [feature/add-products]
  hotfixes/login-fix/      [hotfix/login-fix]

MIGRATIONS PAR BRANCHE
  develop          | 12 migrations | Snapshot: a1b2c3d4 (REFERENCE)
  feature/user-auth     | 13 migrations | Snapshot: e5f6g7h8
  feature/add-products  | 13 migrations | Snapshot: i9j0k1l2
  hotfix/login-fix      | 12 migrations | Snapshot: a1b2c3d4

ANALYSE DES RISQUES
  feature/user-auth     : LOW      (table differente)
  feature/add-products  : MEDIUM   (FK vers meme table)
  hotfix/login-fix      : NONE     (snapshot = develop)

ORDRE DE MERGE RECOMMANDE
  1. hotfix/login-fix      (NONE - merge direct)
  2. feature/user-auth     (LOW - merge OK)
  3. feature/add-products  (MEDIUM - apres user-auth)

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--json` | Output en format JSON pour CI/CD |
| `--branch <name>` | Scanner une branche specifique |
| `--verbose` | Afficher les details des differences |
| `--no-recommend` | Ne pas afficher les recommandations |

---

## Utilisation dans CI/CD

```yaml
# GitHub Actions
- name: Scan EF Core migrations
  run: |
    OUTPUT=$(claude-code "/efcore:scan --json")
    CONFLICTS=$(echo $OUTPUT | jq '.risks[] | select(.level == "HIGH") | length')
    if [ "$CONFLICTS" -gt 0 ]; then
      echo "::warning::High risk migration conflicts detected"
    fi
```
