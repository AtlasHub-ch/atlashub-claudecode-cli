---
description: Analyser conflits avant merge (BLOQUANT si conflit detecte)
agent: efcore-conflicts
model: sonnet
---

# EF Core Conflicts - Cross-Branch Conflict Analysis

Analyse les conflits potentiels entre la branche courante et develop. **BLOQUANT** si conflit detecte.

**UTILISATION:** Avant un merge ou un commit pour s'assurer qu'il n'y a pas de conflits de migrations.

**COMPORTEMENT:** Retourne exit code 1 si conflit detecte (bloque le merge/commit).

---

## ETAPE 1: Verifier la branche courante

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Branche courante: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
  echo "Aucune analyse necessaire sur $CURRENT_BRANCH"
  exit 0
fi
```

---

## ETAPE 2: Localiser les ModelSnapshots

```bash
# Trouver le ModelSnapshot local
LOCAL_SNAPSHOT=$(find . -name "*ModelSnapshot.cs" -not -path "*/node_modules/*" 2>/dev/null | head -1)

if [ -z "$LOCAL_SNAPSHOT" ]; then
  echo "Aucun ModelSnapshot trouve - pas de migrations EF Core"
  exit 0
fi

echo "ModelSnapshot local: $LOCAL_SNAPSHOT"

# Trouver le ModelSnapshot de develop
WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")
DEVELOP_SNAPSHOT="$WORKTREE_BASE/develop/$(dirname $LOCAL_SNAPSHOT)/*ModelSnapshot.cs"

if [ ! -f "$DEVELOP_SNAPSHOT" ]; then
  # Fallback: obtenir depuis git
  DEVELOP_SNAPSHOT_CONTENT=$(git show develop:$LOCAL_SNAPSHOT 2>/dev/null)
  if [ -z "$DEVELOP_SNAPSHOT_CONTENT" ]; then
    echo "Impossible de trouver le ModelSnapshot de develop"
    exit 1
  fi
fi
```

---

## ETAPE 3: Comparer les ModelSnapshots

```bash
echo ""
echo "COMPARAISON MODELSNAPSHOT"
echo "========================="

# Creer un fichier temporaire pour develop si necessaire
if [ -n "$DEVELOP_SNAPSHOT_CONTENT" ]; then
  TEMP_DEVELOP=$(mktemp)
  echo "$DEVELOP_SNAPSHOT_CONTENT" > "$TEMP_DEVELOP"
  DEVELOP_SNAPSHOT="$TEMP_DEVELOP"
fi

# Comparer
if diff -q "$LOCAL_SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
  echo "ModelSnapshots identiques - Aucun conflit"
  CONFLICT_LEVEL="NONE"
else
  # Analyser les differences
  DIFF_OUTPUT=$(diff "$DEVELOP_SNAPSHOT" "$LOCAL_SNAPSHOT" 2>/dev/null)
  DIFF_LINES=$(echo "$DIFF_OUTPUT" | wc -l)

  echo "Differences detectees: $DIFF_LINES lignes"
fi
```

---

## ETAPE 4: Analyser le type de conflit

```bash
if [ "$CONFLICT_LEVEL" != "NONE" ]; then
  # Extraire les entites modifiees
  LOCAL_ENTITIES=$(grep -E "entity\.(Property|HasKey|HasIndex|ToTable)" "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_ENTITIES=$(grep -E "entity\.(Property|HasKey|HasIndex|ToTable)" "$DEVELOP_SNAPSHOT" | sort -u)

  # Trouver les tables modifiees localement
  LOCAL_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$DEVELOP_SNAPSHOT" | sort -u)

  # Comparer les tables
  COMMON_MODIFIED=$(comm -12 <(echo "$LOCAL_TABLES") <(echo "$DEVELOP_TABLES"))

  if [ -n "$COMMON_MODIFIED" ]; then
    echo ""
    echo "TABLES MODIFIEES DES DEUX COTES:"
    echo "$COMMON_MODIFIED"
    CONFLICT_LEVEL="HIGH"
  else
    CONFLICT_LEVEL="LOW"
  fi

  # Verifier les colonnes
  LOCAL_COLUMNS=$(grep -oE 'Property<[^>]+>\("([^"]+)"' "$LOCAL_SNAPSHOT" | sort -u)
  DEVELOP_COLUMNS=$(grep -oE 'Property<[^>]+>\("([^"]+)"' "$DEVELOP_SNAPSHOT" | sort -u)

  # Nouvelles colonnes locales
  NEW_LOCAL_COLUMNS=$(comm -23 <(echo "$LOCAL_COLUMNS") <(echo "$DEVELOP_COLUMNS"))

  if [ -n "$NEW_LOCAL_COLUMNS" ]; then
    echo ""
    echo "NOUVELLES COLONNES (cette branche):"
    echo "$NEW_LOCAL_COLUMNS" | head -10
  fi
fi
```

---

## ETAPE 5: Scanner les autres branches actives

```bash
echo ""
echo "AUTRES BRANCHES AVEC MIGRATIONS"
echo "==============================="

for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)

  if [ "$BRANCH" = "$CURRENT_BRANCH" ] || [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "main" ]; then
    continue
  fi

  OTHER_SNAPSHOT=$(find "$worktree" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  if [ -n "$OTHER_SNAPSHOT" ]; then
    if ! diff -q "$LOCAL_SNAPSHOT" "$OTHER_SNAPSHOT" > /dev/null 2>&1; then
      echo "$BRANCH: ModelSnapshot different"

      # Verifier si meme table modifiee
      OTHER_TABLES=$(grep -oE 'ToTable\("([^"]+)"' "$OTHER_SNAPSHOT" | sort -u)
      OVERLAP=$(comm -12 <(echo "$LOCAL_TABLES") <(echo "$OTHER_TABLES"))

      if [ -n "$OVERLAP" ]; then
        echo "  ATTENTION: Tables communes modifiees avec $BRANCH"
        CONFLICT_LEVEL="HIGH"
      fi
    fi
  fi
done
```

---

## ETAPE 6: Verdict final

```bash
echo ""
echo "================================================================================
                    RESULTAT DE L'ANALYSE
================================================================================
"

case $CONFLICT_LEVEL in
  "NONE")
    echo "STATUT: OK"
    echo "Aucun conflit detecte. Merge autorise."
    exit 0
    ;;
  "LOW")
    echo "STATUT: OK (avec attention)"
    echo "Modifications sur tables differentes. Merge autorise."
    exit 0
    ;;
  "MEDIUM")
    echo "STATUT: ATTENTION"
    echo "FK vers memes tables. Verifier l'ordre de merge."
    exit 0
    ;;
  "HIGH")
    echo "STATUT: CONFLIT DETECTE"
    echo ""
    echo "RESOLUTION REQUISE:"
    echo "  1. /efcore:rebase-snapshot   (recommande)"
    echo "  2. /efcore:conflicts --force (non recommande)"
    echo "  3. Merger l'autre branche d'abord"
    echo ""
    echo "BLOQUANT: Merge non autorise."
    exit 1
    ;;
  "CRITICAL")
    echo "STATUT: CONFLIT CRITIQUE"
    echo ""
    echo "Meme colonne modifiee des deux cotes."
    echo "Intervention manuelle requise."
    echo ""
    exit 1
    ;;
esac
```

---

## Output Format

```
================================================================================
                    EF CORE CONFLICT ANALYSIS
================================================================================

BRANCHE: feature/user-auth
CIBLE:   develop

MODELSNAPSHOT
  Local:   a1b2c3d4 (13 migrations)
  Develop: e5f6g7h8 (12 migrations)
  Status:  DIFFERENT

TABLES MODIFIEES
  Local:   Users, Roles, UserRoles
  Develop: Users, Permissions

CONFLIT DETECTE
  Table "Users" modifiee des deux cotes

AUTRES BRANCHES
  feature/add-products: OK (tables differentes)

================================================================================
STATUT: CONFLIT - EXIT CODE 1
================================================================================

RESOLUTION:
  /efcore:rebase-snapshot    Rebaser sur develop (recommande)
  /efcore:conflicts --force  Forcer (non recommande)

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--force` | Ignorer le conflit (non recommande) |
| `--verbose` | Afficher les differences detaillees |
| `--json` | Output JSON pour CI/CD |
| `--target <branch>` | Comparer avec une autre branche que develop |

---

## Exit Codes

| Code | Signification |
|------|---------------|
| 0 | Aucun conflit ou conflit mineur |
| 1 | Conflit detecte - merge bloque |
| 2 | Erreur technique |
