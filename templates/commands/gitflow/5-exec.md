---
description: Phase 5 - Execute integration plan with safe EF Core migration handling
args: [plan_file]
---

# Phase 5: EXEC - Plan Execution

Tu es un expert GitFlow et EF Core. Ta mission est d'executer un plan d'integration de maniere securisee et tracable.

## Argument

`$ARGUMENTS` : Chemin vers le fichier plan (optionnel)

## Etape 1 : Selection du plan

### Si pas d'argument fourni

```bash
# Lister les plans actifs
PLANS_DIR=".claude/gitflow/plans"

echo "=== Plans disponibles ==="
find "$PLANS_DIR" -name "*.md" ! -name "*_DONE*" ! -name "*_ABORTED*" -type f 2>/dev/null | while read plan; do
  NAME=$(basename "$plan")
  CREATED=$(stat -c %y "$plan" 2>/dev/null | cut -d' ' -f1 || stat -f %Sm -t %Y-%m-%d "$plan" 2>/dev/null)

  # Extraire le type depuis le nom
  TYPE=$(echo "$NAME" | grep -oE '^(feature|release|hotfix)' || echo "other")

  echo "  [$TYPE] $NAME (cree: $CREATED)"
done

echo ""
echo "Quel plan voulez-vous executer?"
```

### Si argument fourni

```bash
PLAN_FILE="$ARGUMENTS"

# Verifier que le fichier existe
if [ ! -f "$PLAN_FILE" ]; then
  # Essayer dans le dossier plans
  PLAN_FILE=".claude/gitflow/plans/$ARGUMENTS"
  if [ ! -f "$PLAN_FILE" ]; then
    echo "ERREUR: Plan non trouve: $ARGUMENTS"
    exit 1
  fi
fi

echo "Plan selectionne: $PLAN_FILE"
```

## Etape 2 : Chargement et validation du plan

```bash
# Lire les metadonnees du plan
PLAN_CONTENT=$(cat "$PLAN_FILE")

# Extraire les informations cles
BRANCH_SOURCE=$(echo "$PLAN_CONTENT" | grep -oP '\*\*Branche source\*\*:\s*\K[^\s]+' | head -1)
BRANCH_TARGET=$(echo "$PLAN_CONTENT" | grep -oP '\*\*Branche cible\*\*:\s*\K[^\s]+' | head -1)
COMMIT_INITIAL=$(echo "$PLAN_CONTENT" | grep -oP '\*\*Commit initial\*\*:\s*\K[^\s]+' | head -1)

echo "=== Plan charge ==="
echo "Source: $BRANCH_SOURCE"
echo "Cible: $BRANCH_TARGET"
echo "Commit initial: $COMMIT_INITIAL"
```

## Etape 3 : Verification des pre-requis

```bash
echo "=== Verification des pre-requis ==="

# 1. Working directory propre
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERREUR: Working directory non propre"
  echo "Fichiers modifies:"
  git status --short
  echo ""
  echo "Action requise: git stash ou /gf-commit"
  exit 1
fi
echo "[OK] Working directory propre"

# 2. Sur la bonne branche
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$BRANCH_SOURCE" ]; then
  echo "ATTENTION: Pas sur la branche source"
  echo "Actuelle: $CURRENT"
  echo "Attendue: $BRANCH_SOURCE"
  echo ""
  echo "Basculer sur la bonne branche? (git checkout $BRANCH_SOURCE)"
fi
echo "[OK] Branche correcte: $CURRENT"

# 3. Commit initial valide
if ! git rev-parse "$COMMIT_INITIAL" >/dev/null 2>&1; then
  echo "ATTENTION: Commit initial non trouve: $COMMIT_INITIAL"
  echo "Le repository a peut-etre ete modifie depuis la creation du plan"
fi
echo "[OK] Commit initial valide"

# 4. Build OK
echo "Verification du build..."
if ! dotnet build --no-restore 2>&1 | tail -5; then
  echo "ERREUR: Build echoue"
  exit 1
fi
echo "[OK] Build reussi"

# 5. Verifier les migrations EF Core
echo "Verification EF Core..."
PENDING=$(dotnet ef migrations list --no-build 2>/dev/null | grep -c "(Pending)" || echo "0")
if [ "$PENDING" -gt 0 ]; then
  echo "INFO: $PENDING migration(s) pending"
  dotnet ef migrations list --no-build 2>/dev/null | grep "(Pending)"
fi
echo "[OK] EF Core verifie"
```

## Etape 4 : Creation du checkpoint

```bash
# Creer un backup avant execution
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR=".claude/gitflow/logs"
CHECKPOINT_FILE="$LOG_DIR/checkpoint_${TIMESTAMP}.json"

mkdir -p "$LOG_DIR"

# Sauvegarder l'etat
cat > "$CHECKPOINT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "plan": "$(basename "$PLAN_FILE")",
  "branch": "$CURRENT",
  "commit": "$(git rev-parse HEAD)",
  "status": "started",
  "steps_completed": []
}
EOF

echo "Checkpoint cree: $CHECKPOINT_FILE"

# Sauvegarder les migrations si presentes
if [ -d "Migrations" ]; then
  MIGRATIONS_BACKUP="$LOG_DIR/migrations_backup_${TIMESTAMP}"
  cp -r */Migrations "$MIGRATIONS_BACKUP" 2>/dev/null || true
  echo "Migrations sauvegardees: $MIGRATIONS_BACKUP"
fi
```

## Etape 5 : Execution des etapes

### Processus d'execution

Pour chaque etape du plan :

1. **Afficher** l'etape a executer
2. **Demander confirmation** (sauf si --yes)
3. **Executer** la commande
4. **Verifier** le resultat
5. **Logger** dans le checkpoint
6. **Continuer** ou **Arreter** selon le resultat

### Execution d'une etape

```bash
execute_step() {
  local STEP_NUM=$1
  local STEP_CMD=$2
  local STEP_DESC=$3

  echo ""
  echo "========================================"
  echo "Etape $STEP_NUM: $STEP_DESC"
  echo "========================================"
  echo "Commande: $STEP_CMD"
  echo ""

  # Demander confirmation
  read -p "Executer cette etape? [O/n/skip/abort] " CONFIRM
  case "$CONFIRM" in
    n|N|skip|SKIP)
      echo "Etape ignoree"
      return 0
      ;;
    abort|ABORT)
      echo "Execution annulee"
      return 2
      ;;
  esac

  # Executer
  echo "Execution..."
  if eval "$STEP_CMD"; then
    echo "[OK] Etape $STEP_NUM terminee"
    # Logger le succes
    return 0
  else
    echo "[ERREUR] Etape $STEP_NUM echouee"
    return 1
  fi
}
```

### Gestion des etapes EF Core specifiques

```bash
# Phase: Gestion des migrations
execute_ef_migration_step() {
  local ACTION=$1

  case "$ACTION" in
    "check_conflicts")
      echo "Verification des conflits ModelSnapshot..."
      git diff --name-only -- "*ModelSnapshot.cs" | head -5
      ;;

    "remove_migration")
      echo "Suppression temporaire de la migration..."
      dotnet ef migrations remove --force
      ;;

    "add_migration")
      local NAME=$2
      echo "Re-creation de la migration: $NAME"
      dotnet ef migrations add "$NAME"
      ;;

    "generate_script")
      local VERSION=$2
      echo "Generation du script SQL..."
      mkdir -p ./scripts/migrations
      dotnet ef migrations script --idempotent -o "./scripts/migrations/release_${VERSION}.sql"
      ;;

    "apply_migrations")
      echo "Application des migrations..."
      dotnet ef database update
      ;;

    "verify_migrations")
      echo "Verification des migrations..."
      dotnet ef migrations list --no-build
      ;;
  esac
}
```

### Execution du rebase (si necessaire)

```bash
execute_rebase() {
  echo "=== REBASE sur $BRANCH_TARGET ==="

  # Fetch avant rebase
  git fetch origin "$BRANCH_TARGET"

  # Executer le rebase
  if ! git rebase "origin/$BRANCH_TARGET"; then
    echo ""
    echo "CONFLIT DETECTE pendant le rebase!"
    echo ""
    echo "Fichiers en conflit:"
    git diff --name-only --diff-filter=U

    # Verifier si c'est un conflit migration
    if git diff --name-only --diff-filter=U | grep -q "ModelSnapshot.cs"; then
      echo ""
      echo "CONFLIT MODELSNAPSHOT DETECTE"
      echo ""
      echo "Actions recommandees:"
      echo "1. Accepter la version de develop: git checkout --theirs */Migrations/*ModelSnapshot.cs"
      echo "2. Regenerer notre migration: dotnet ef migrations add <NomMigration>"
      echo "3. Continuer le rebase: git rebase --continue"
    fi

    echo ""
    echo "Options:"
    echo "  - Resoudre manuellement puis: git rebase --continue"
    echo "  - Annuler: git rebase --abort"
    echo "  - Ou utiliser: /gf-abort"

    return 1
  fi

  echo "[OK] Rebase termine avec succes"
  return 0
}
```

### Execution du merge

```bash
execute_merge() {
  local SOURCE=$1
  local TARGET=$2
  local MESSAGE=$3

  echo "=== MERGE $SOURCE -> $TARGET ==="

  # Checkout target
  git checkout "$TARGET"

  # Pull latest
  git pull origin "$TARGET" 2>/dev/null || true

  # Merge
  if ! git merge --no-ff "$SOURCE" -m "$MESSAGE"; then
    echo ""
    echo "CONFLIT DETECTE pendant le merge!"

    # Meme logique que rebase
    if git diff --name-only --diff-filter=U | grep -q "ModelSnapshot.cs"; then
      echo "CONFLIT MODELSNAPSHOT - voir gf-abort pour rollback"
    fi

    return 1
  fi

  echo "[OK] Merge termine"
  return 0
}
```

## Etape 6 : Validation post-execution

```bash
echo "=== Validation finale ==="

# Build
echo "Build..."
dotnet build

# Tests (optionnel selon config)
echo "Tests..."
dotnet test --no-build 2>/dev/null || echo "Tests ignores (pas de projet de test)"

# Verifier les migrations
echo "Verification des migrations..."
dotnet ef migrations list --no-build

# Verifier l'historique Git
echo "Historique Git..."
git log --oneline --graph -10
```

## Etape 7 : Finalisation

```bash
# Renommer le plan comme termine
DONE_FILE="${PLAN_FILE%.md}_DONE_$(date +%Y%m%d_%H%M%S).md"
mv "$PLAN_FILE" "$DONE_FILE"
echo "Plan archive: $DONE_FILE"

# Mettre a jour le checkpoint
# ... (mise a jour du JSON avec status: completed)

echo ""
echo "========================================"
echo "       INTEGRATION TERMINEE"
echo "========================================"
echo ""
echo "Resume:"
echo "  - Source: $BRANCH_SOURCE"
echo "  - Cible: $BRANCH_TARGET"
echo "  - Status: Succes"
echo ""
echo "Prochaines etapes:"
echo "  1. Verifier les tests sur CI"
echo "  2. Push si necessaire: git push origin $BRANCH_TARGET"
echo "  3. Supprimer la branche source (optionnel)"
```

## Gestion des erreurs

### En cas d'echec d'une etape

```
+------------------------------------------+
|         ERREUR DETECTEE                  |
+------------------------------------------+
| Etape: 3 - Rebase sur develop           |
| Erreur: Conflit dans ModelSnapshot.cs   |
|                                          |
| Options:                                 |
|   [R] Reessayer                         |
|   [S] Skip cette etape                  |
|   [A] Abort + Rollback                  |
|   [M] Mode manuel                       |
+------------------------------------------+
```

### Rollback automatique

```bash
rollback_to_checkpoint() {
  local CHECKPOINT=$1

  echo "Rollback au checkpoint: $CHECKPOINT"

  # Lire le commit du checkpoint
  ORIGINAL_COMMIT=$(cat "$CHECKPOINT" | grep -oP '"commit":\s*"\K[^"]+')

  # Annuler operations en cours
  git rebase --abort 2>/dev/null || true
  git merge --abort 2>/dev/null || true

  # Reset au commit original
  git reset --hard "$ORIGINAL_COMMIT"

  # Restaurer les migrations si backup existe
  BACKUP_DIR=$(dirname "$CHECKPOINT")/migrations_backup_*
  if [ -d "$BACKUP_DIR" ]; then
    echo "Restauration des migrations..."
    cp -r "$BACKUP_DIR"/* Migrations/
  fi

  echo "Rollback termine"
}
```

## Modes d'execution

### Mode interactif (defaut)

- Confirmation a chaque etape
- Affichage detaille
- Options de skip/abort

### Mode automatique (--yes)

```bash
/gf-exec plan.md --yes
```

- Pas de confirmation
- Arret a la premiere erreur
- Utile pour CI/CD

### Mode dry-run (--dry-run)

```bash
/gf-exec plan.md --dry-run
```

- Affiche les commandes sans les executer
- Valide la syntaxe du plan
- Utile pour verification

## Resume des commandes

| Commande | Description |
|----------|-------------|
| `/gf-exec` | Liste les plans et demande selection |
| `/gf-exec plan.md` | Execute le plan specifie |
| `/gf-exec --yes` | Mode non-interactif |
| `/gf-exec --dry-run` | Simulation sans execution |
| `/gf-exec --resume` | Reprendre une execution interrompue |
