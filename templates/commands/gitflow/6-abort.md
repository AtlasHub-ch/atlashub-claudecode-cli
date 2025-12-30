---
description: Phase 6 - Abort plan with complete rollback including EF Core migrations
args: [plan_file]
---

# Phase 6: ABORT - Rollback & Recovery

Tu es un expert GitFlow et EF Core. Ta mission est d'annuler proprement une operation en cours et de restaurer l'etat precedent.

## Argument

`$ARGUMENTS` : Chemin vers le fichier plan (optionnel)

## Etape 1 : Analyse de l'etat actuel

```bash
echo "=== ANALYSE DE L'ETAT ACTUEL ==="

# Operations Git en cours
echo ""
echo "Operations Git en cours:"

REBASE_IN_PROGRESS=false
MERGE_IN_PROGRESS=false
CHERRY_PICK_IN_PROGRESS=false
HAS_CONFLICTS=false

if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "  [!] REBASE en cours"
  REBASE_IN_PROGRESS=true
  if [ -f ".git/rebase-merge/head-name" ]; then
    REBASE_BRANCH=$(cat .git/rebase-merge/head-name | sed 's|refs/heads/||')
    echo "      Branche: $REBASE_BRANCH"
  fi
fi

if [ -f ".git/MERGE_HEAD" ]; then
  echo "  [!] MERGE en cours"
  MERGE_IN_PROGRESS=true
  MERGE_COMMIT=$(cat .git/MERGE_HEAD)
  echo "      Commit: $MERGE_COMMIT"
fi

if [ -f ".git/CHERRY_PICK_HEAD" ]; then
  echo "  [!] CHERRY-PICK en cours"
  CHERRY_PICK_IN_PROGRESS=true
fi

# Conflits
if git ls-files -u 2>/dev/null | grep -q .; then
  echo "  [!] CONFLITS detectes"
  HAS_CONFLICTS=true
  echo "      Fichiers en conflit:"
  git ls-files -u | cut -f2 | sort -u | head -10 | while read f; do
    echo "        - $f"
  done
fi

if [ "$REBASE_IN_PROGRESS" = false ] && [ "$MERGE_IN_PROGRESS" = false ] && [ "$CHERRY_PICK_IN_PROGRESS" = false ]; then
  echo "  Aucune operation Git en cours"
fi

# Etat du working directory
echo ""
echo "Working directory:"
if git diff --quiet && git diff --cached --quiet; then
  echo "  Propre"
else
  echo "  [!] Modifications non commitees"
  git status --short | head -10
fi
```

## Etape 2 : Recherche des plans et checkpoints

```bash
echo ""
echo "=== PLANS ET CHECKPOINTS ==="

# Chercher le plan en cours
PLANS_DIR=".claude/gitflow/plans"
LOGS_DIR=".claude/gitflow/logs"

# Plans actifs
echo ""
echo "Plans actifs:"
find "$PLANS_DIR" -name "*.md" ! -name "*_DONE*" ! -name "*_ABORTED*" -type f 2>/dev/null | while read plan; do
  echo "  - $(basename "$plan")"
done

# Checkpoints recents
echo ""
echo "Checkpoints disponibles:"
find "$LOGS_DIR" -name "checkpoint_*.json" -type f 2>/dev/null | sort -r | head -5 | while read cp; do
  NAME=$(basename "$cp")
  TIMESTAMP=$(echo "$NAME" | grep -oE "[0-9]{8}_[0-9]{6}")
  PLAN=$(grep -oP '"plan":\s*"\K[^"]+' "$cp" 2>/dev/null || echo "unknown")
  COMMIT=$(grep -oP '"commit":\s*"\K[^"]+' "$cp" 2>/dev/null | cut -c1-8)
  echo "  - $NAME (plan: $PLAN, commit: $COMMIT)"
done

# Backups de migrations
echo ""
echo "Backups de migrations:"
find "$LOGS_DIR" -type d -name "migrations_backup_*" 2>/dev/null | sort -r | head -3 | while read bk; do
  NAME=$(basename "$bk")
  COUNT=$(find "$bk" -name "*.cs" 2>/dev/null | wc -l)
  echo "  - $NAME ($COUNT fichiers)"
done
```

## Etape 3 : Selection du type de rollback

Affiche les options disponibles :

```
+----------------------------------------------------------+
|                    OPTIONS DE ROLLBACK                    |
+----------------------------------------------------------+
|                                                          |
| [1] Annuler l'operation Git en cours                     |
|     - git rebase --abort / merge --abort                 |
|     - Restaure l'etat avant l'operation                  |
|                                                          |
| [2] Rollback au dernier checkpoint                       |
|     - Restaure le commit exact du checkpoint             |
|     - Restaure les migrations sauvegardees               |
|                                                          |
| [3] Rollback complet au debut du plan                    |
|     - Restaure l'etat initial avant le plan              |
|     - Reset hard + restauration migrations               |
|                                                          |
| [4] Rollback des migrations seulement                    |
|     - Garde les changements Git                          |
|     - Restaure les fichiers migration                    |
|                                                          |
| [5] Rollback de la base de donnees                       |
|     - Revient a une migration precedente                 |
|     - dotnet ef database update <migration>              |
|                                                          |
| [0] Annuler (ne rien faire)                              |
+----------------------------------------------------------+
```

## Etape 4 : Execution du rollback

### Option 1 : Annuler l'operation Git en cours

```bash
abort_git_operation() {
  echo "=== Annulation de l'operation Git ==="

  # Rebase
  if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo "Annulation du rebase..."
    git rebase --abort
    if [ $? -eq 0 ]; then
      echo "[OK] Rebase annule"
    else
      echo "[ERREUR] Impossible d'annuler le rebase"
      return 1
    fi
  fi

  # Merge
  if [ -f ".git/MERGE_HEAD" ]; then
    echo "Annulation du merge..."
    git merge --abort
    if [ $? -eq 0 ]; then
      echo "[OK] Merge annule"
    else
      echo "[ERREUR] Impossible d'annuler le merge"
      return 1
    fi
  fi

  # Cherry-pick
  if [ -f ".git/CHERRY_PICK_HEAD" ]; then
    echo "Annulation du cherry-pick..."
    git cherry-pick --abort
    if [ $? -eq 0 ]; then
      echo "[OK] Cherry-pick annule"
    else
      echo "[ERREUR] Impossible d'annuler le cherry-pick"
      return 1
    fi
  fi

  # Verification finale
  echo ""
  echo "Etat apres annulation:"
  git status
}
```

### Option 2 : Rollback au checkpoint

```bash
rollback_to_checkpoint() {
  local CHECKPOINT_FILE=$1

  echo "=== Rollback au checkpoint ==="
  echo "Checkpoint: $CHECKPOINT_FILE"

  # Lire les informations du checkpoint
  ORIGINAL_BRANCH=$(grep -oP '"branch":\s*"\K[^"]+' "$CHECKPOINT_FILE")
  ORIGINAL_COMMIT=$(grep -oP '"commit":\s*"\K[^"]+' "$CHECKPOINT_FILE")
  PLAN_NAME=$(grep -oP '"plan":\s*"\K[^"]+' "$CHECKPOINT_FILE")

  echo "  Branche originale: $ORIGINAL_BRANCH"
  echo "  Commit original: $ORIGINAL_COMMIT"
  echo ""

  # Confirmation
  echo "ATTENTION: Cette action va:"
  echo "  - Annuler toutes les operations Git en cours"
  echo "  - Revenir au commit: $ORIGINAL_COMMIT"
  echo "  - Restaurer les migrations sauvegardees (si disponibles)"
  echo ""

  # Annuler les operations en cours
  git rebase --abort 2>/dev/null
  git merge --abort 2>/dev/null
  git cherry-pick --abort 2>/dev/null

  # Checkout de la branche originale
  git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true

  # Reset au commit original
  echo "Reset au commit $ORIGINAL_COMMIT..."
  git reset --hard "$ORIGINAL_COMMIT"

  # Restaurer les migrations si backup existe
  TIMESTAMP=$(echo "$CHECKPOINT_FILE" | grep -oE "[0-9]{8}_[0-9]{6}")
  MIGRATIONS_BACKUP="$(dirname "$CHECKPOINT_FILE")/migrations_backup_${TIMESTAMP}"

  if [ -d "$MIGRATIONS_BACKUP" ]; then
    echo "Restauration des migrations..."
    # Trouver le dossier Migrations dans le projet
    find . -type d -name "Migrations" -not -path "*/bin/*" -not -path "*/obj/*" | head -1 | while read migrations_dir; do
      cp -r "$MIGRATIONS_BACKUP"/* "$migrations_dir/" 2>/dev/null || true
    done
    echo "[OK] Migrations restaurees"
  fi

  echo ""
  echo "[OK] Rollback termine"
  git log -1 --oneline
}
```

### Option 3 : Rollback complet au debut du plan

```bash
rollback_to_plan_start() {
  local PLAN_FILE=$1

  echo "=== Rollback au debut du plan ==="

  # Lire le plan
  if [ ! -f "$PLAN_FILE" ]; then
    echo "ERREUR: Plan non trouve: $PLAN_FILE"
    return 1
  fi

  # Extraire le commit initial du plan
  INITIAL_COMMIT=$(grep -oP '\*\*Commit initial\*\*:\s*\K[^\s]+' "$PLAN_FILE" | head -1)
  INITIAL_BRANCH=$(grep -oP '\*\*Branche source\*\*:\s*\K[^\s]+' "$PLAN_FILE" | head -1)

  if [ -z "$INITIAL_COMMIT" ]; then
    echo "ERREUR: Commit initial non trouve dans le plan"
    return 1
  fi

  echo "Commit initial: $INITIAL_COMMIT"
  echo "Branche: $INITIAL_BRANCH"
  echo ""

  # Annuler operations en cours
  git rebase --abort 2>/dev/null
  git merge --abort 2>/dev/null

  # Checkout et reset
  git checkout "$INITIAL_BRANCH" 2>/dev/null || true
  git reset --hard "$INITIAL_COMMIT"

  # Marquer le plan comme avorte
  ABORTED_FILE="${PLAN_FILE%.md}_ABORTED_$(date +%Y%m%d_%H%M%S).md"
  mv "$PLAN_FILE" "$ABORTED_FILE"
  echo "Plan marque comme avorte: $ABORTED_FILE"

  echo ""
  echo "[OK] Rollback complet termine"
}
```

### Option 4 : Rollback des migrations seulement

```bash
rollback_migrations_only() {
  local BACKUP_DIR=$1

  echo "=== Rollback des migrations ==="

  if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERREUR: Backup non trouve: $BACKUP_DIR"
    return 1
  fi

  # Lister les fichiers a restaurer
  echo "Fichiers a restaurer:"
  find "$BACKUP_DIR" -name "*.cs" | head -10

  echo ""
  echo "ATTENTION: Cette action va remplacer les fichiers migration actuels"
  echo ""

  # Trouver le dossier Migrations
  MIGRATIONS_DIR=$(find . -type d -name "Migrations" -not -path "*/bin/*" -not -path "*/obj/*" | head -1)

  if [ -z "$MIGRATIONS_DIR" ]; then
    echo "ERREUR: Dossier Migrations non trouve"
    return 1
  fi

  # Copier les fichiers
  echo "Restauration vers: $MIGRATIONS_DIR"
  cp -r "$BACKUP_DIR"/* "$MIGRATIONS_DIR/"

  # Rebuild pour verifier
  echo "Verification du build..."
  dotnet build --no-restore 2>&1 | tail -5

  echo ""
  echo "[OK] Migrations restaurees"
}
```

### Option 5 : Rollback de la base de donnees

```bash
rollback_database() {
  echo "=== Rollback de la base de donnees ==="

  # Lister les migrations appliquees
  echo "Migrations actuelles:"
  dotnet ef migrations list --no-build 2>/dev/null | tail -20

  echo ""
  echo "Entrez le nom de la migration cible (ou 0 pour InitialCreate):"
  echo "(La DB sera ramenee a l'etat APRES cette migration)"
  echo ""

  # Lire la migration cible
  # Dans Claude Code, demander a l'utilisateur

  # Exemple d'execution
  # TARGET_MIGRATION="20241228_InitialCreate"

  echo "ATTENTION: Cette action va:"
  echo "  - Annuler toutes les migrations apres: <target>"
  echo "  - Les donnees ajoutees par ces migrations peuvent etre perdues"
  echo ""

  # Execution
  # dotnet ef database update "$TARGET_MIGRATION"

  echo "Pour executer:"
  echo "  dotnet ef database update <NomMigration>"
  echo ""
  echo "Pour revenir completement a zero:"
  echo "  dotnet ef database update 0"
}
```

## Etape 5 : Verification post-rollback

```bash
verify_rollback() {
  echo ""
  echo "=== VERIFICATION POST-ROLLBACK ==="

  # Etat Git
  echo ""
  echo "Etat Git:"
  echo "  Branche: $(git branch --show-current)"
  echo "  Commit: $(git log -1 --oneline)"
  echo "  Status:"
  git status --short | head -5

  # Operations en cours
  echo ""
  echo "Operations en cours:"
  if [ -d ".git/rebase-merge" ] || [ -f ".git/MERGE_HEAD" ] || [ -f ".git/CHERRY_PICK_HEAD" ]; then
    echo "  [!] Operations detectees (voir ci-dessus)"
  else
    echo "  Aucune"
  fi

  # Build
  echo ""
  echo "Verification build..."
  if dotnet build --no-restore 2>&1 | grep -q "Build succeeded"; then
    echo "  [OK] Build reussi"
  else
    echo "  [!] Build echoue - verification manuelle requise"
  fi

  # Migrations
  echo ""
  echo "Migrations EF Core:"
  dotnet ef migrations list --no-build 2>/dev/null | tail -5 || echo "  Non disponible"
}
```

## Etape 6 : Nettoyage (optionnel)

```bash
cleanup_after_abort() {
  echo ""
  echo "=== NETTOYAGE ==="

  echo "Voulez-vous nettoyer les fichiers temporaires?"
  echo ""
  echo "Fichiers a supprimer:"

  # Checkpoints obsoletes
  find ".claude/gitflow/logs" -name "checkpoint_*.json" -mtime +7 2>/dev/null | head -5

  # Backups de migrations anciens
  find ".claude/gitflow/logs" -type d -name "migrations_backup_*" -mtime +7 2>/dev/null | head -5

  # Plans avortes anciens
  find ".claude/gitflow/plans" -name "*_ABORTED_*.md" -mtime +30 2>/dev/null | head -5

  echo ""
  echo "Pour nettoyer manuellement:"
  echo "  rm -rf .claude/gitflow/logs/checkpoint_*.json"
  echo "  rm -rf .claude/gitflow/logs/migrations_backup_*"
}
```

## Resume des commandes

| Commande | Description |
|----------|-------------|
| `/gf-abort` | Analyse et propose les options |
| `/gf-abort --git` | Annule uniquement l'operation Git en cours |
| `/gf-abort --checkpoint` | Rollback au dernier checkpoint |
| `/gf-abort --full` | Rollback complet au debut du plan |
| `/gf-abort --migrations` | Rollback des fichiers migration seulement |
| `/gf-abort --database <migration>` | Rollback DB a une migration |

## Scenarios courants

### Conflit pendant rebase

```
1. /gf-abort --git           # Annule le rebase
2. git fetch origin develop  # Met a jour develop
3. /gf-plan                   # Regenere un plan
```

### Migration corrompue apres merge

```
1. /gf-abort --checkpoint     # Revient au checkpoint
2. dotnet ef migrations list  # Verifie l'etat
3. /gf-commit                 # Recommence proprement
```

### Annulation complete d'une feature

```
1. /gf-abort --full           # Rollback complet
2. git branch -D feature/xxx  # Supprime la branche (optionnel)
```

## Messages d'erreur courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Pas d'operation en cours" | Rien a annuler | Utiliser --checkpoint ou --full |
| "Checkpoint non trouve" | Fichier supprime | Utiliser --full avec le plan |
| "Commit non trouve" | Historique modifie | git reflog pour retrouver |
| "Build echoue apres rollback" | Migrations desynchronisees | dotnet ef database update |
