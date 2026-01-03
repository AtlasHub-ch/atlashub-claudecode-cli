---
description: Rebaser ModelSnapshot sur develop et regenerer la migration
agent: efcore-rebase-snapshot
model: sonnet
---

# EF Core Rebase-Snapshot - Resync with Develop

Rebase le ModelSnapshot sur develop et regenere une migration consolidee. Utilise quand un conflit est detecte.

**UTILISATION:** Apres `/efcore:conflicts` signale un conflit HIGH.

**ATTENTION:** Cette operation modifie les fichiers de migration. Un backup est cree automatiquement.

---

## ETAPE 1: Verification des prerequis

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Branche courante: $CURRENT_BRANCH"

# Verifier que c'est une branche feature/release/hotfix
if [[ ! $CURRENT_BRANCH =~ ^(feature|release|hotfix)/ ]]; then
  echo "ERREUR: Cette commande ne peut etre executee que depuis une branche GitFlow"
  exit 1
fi

# Verifier que le working directory est propre
if [ -n "$(git status --porcelain)" ]; then
  echo "ERREUR: Working directory non propre"
  echo "Committez ou stashez vos changements d'abord"
  exit 1
fi

# Trouver le projet EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; 2>/dev/null | head -1)
if [ -z "$CSPROJ" ]; then
  echo "ERREUR: Aucun projet EF Core trouve"
  exit 1
fi

PROJECT_DIR=$(dirname "$CSPROJ")
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"
echo "Projet: $PROJECT_DIR"
echo "Migrations: $MIGRATIONS_DIR"
```

---

## ETAPE 2: Backup des migrations actuelles

```bash
BACKUP_DIR=".claude/gitflow/backup/migrations/rebase_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "BACKUP"
echo "======"
cp "$MIGRATIONS_DIR"/*.cs "$BACKUP_DIR/" 2>/dev/null
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
echo "  $BACKUP_COUNT fichiers sauvegardes dans $BACKUP_DIR"
```

---

## ETAPE 3: Identifier les migrations de cette branche

```bash
# Trouver les migrations ajoutees sur cette branche (pas sur develop)
echo ""
echo "MIGRATIONS DE CETTE BRANCHE"
echo "==========================="

# Obtenir la liste des migrations sur develop
DEVELOP_MIGRATIONS=$(git show develop:$MIGRATIONS_DIR 2>/dev/null | grep "\.cs$" | grep -v "Designer" | grep -v "Snapshot")

# Migrations locales
LOCAL_MIGRATIONS=$(ls -1 "$MIGRATIONS_DIR"/*.cs 2>/dev/null | xargs -n1 basename | grep -v "Designer" | grep -v "Snapshot")

# Nouvelles migrations (sur cette branche mais pas sur develop)
BRANCH_MIGRATIONS=""
for migration in $LOCAL_MIGRATIONS; do
  if ! echo "$DEVELOP_MIGRATIONS" | grep -q "$migration"; then
    BRANCH_MIGRATIONS="$BRANCH_MIGRATIONS $migration"
    echo "  + $migration"
  fi
done

if [ -z "$BRANCH_MIGRATIONS" ]; then
  echo "  Aucune migration specifique a cette branche"
  echo "  Rien a rebaser"
  exit 0
fi
```

---

## ETAPE 4: Reset ModelSnapshot sur develop

```bash
echo ""
echo "RESET MODELSNAPSHOT"
echo "==================="

# Obtenir le ModelSnapshot de develop
git fetch origin develop
SNAPSHOT_FILE=$(find "$MIGRATIONS_DIR" -name "*ModelSnapshot.cs" | head -1)
SNAPSHOT_NAME=$(basename "$SNAPSHOT_FILE")

git checkout origin/develop -- "$MIGRATIONS_DIR/$SNAPSHOT_NAME"
echo "  ModelSnapshot reset sur develop"
```

---

## ETAPE 5: Supprimer les migrations de cette branche

```bash
echo ""
echo "SUPPRESSION MIGRATIONS BRANCHE"
echo "=============================="

for migration in $BRANCH_MIGRATIONS; do
  BASE_NAME="${migration%.cs}"
  rm -f "$MIGRATIONS_DIR/$BASE_NAME.cs"
  rm -f "$MIGRATIONS_DIR/$BASE_NAME.Designer.cs"
  echo "  - $BASE_NAME"
done
```

---

## ETAPE 6: Regenerer la migration consolidee

```bash
echo ""
echo "REGENERATION MIGRATION"
echo "======================"

# Extraire info de branche pour le nom
BRANCH_TYPE=$(echo "$CURRENT_BRANCH" | cut -d'/' -f1)
BRANCH_NAME=$(echo "$CURRENT_BRANCH" | cut -d'/' -f2 | sed 's/-/_/g' | sed 's/.*/\u&/')

# Version
VERSION=$(grep -oP '(?<=<Version>).*(?=</Version>)' "$CSPROJ" 2>/dev/null | head -1 || echo "1.0.0")
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')

# Nom de la migration
case $BRANCH_TYPE in
  "feature")
    MIGRATION_NAME="Feature_${VERSION_CLEAN}_${BRANCH_NAME}_Consolidated"
    ;;
  "hotfix")
    MIGRATION_NAME="Hotfix_${VERSION_CLEAN}_${BRANCH_NAME}_Fix"
    ;;
  "release")
    MIGRATION_NAME="Release_${VERSION_CLEAN}_Consolidated"
    ;;
  *)
    MIGRATION_NAME="Branch_${VERSION_CLEAN}_${BRANCH_NAME}"
    ;;
esac

echo "Nom: $MIGRATION_NAME"

cd "$PROJECT_DIR"
dotnet ef migrations add "$MIGRATION_NAME" --verbose

if [ $? -eq 0 ]; then
  echo "  Migration creee avec succes"
else
  echo "  ERREUR: Echec de creation de migration"
  echo "  Restauration du backup..."
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
```

---

## ETAPE 7: Validation

```bash
echo ""
echo "VALIDATION"
echo "=========="

# Build
dotnet build --no-restore
if [ $? -ne 0 ]; then
  echo "  ERREUR: Build echoue"
  echo "  Restauration du backup..."
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
echo "  Build: OK"

# Verifier que la migration peut generer un script
dotnet ef migrations script --no-build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "  ERREUR: Script generation echoue"
  exit 1
fi
echo "  Script: OK"
```

---

## ETAPE 8: Resume

```
================================================================================
                    REBASE-SNAPSHOT TERMINE
================================================================================

BRANCHE:          {current_branch}
BACKUP:           {backup_dir}

AVANT:
  Migrations:     {old_migrations}
  ModelSnapshot:  {old_hash}

APRES:
  Migration:      {new_migration_name}
  ModelSnapshot:  {new_hash} (= develop)

================================================================================
PROCHAINES ETAPES
================================================================================

1. Verifier le contenu de la migration
2. Tester: /efcore:db-reset && /efcore:db-deploy
3. Committer: /gitflow:3-commit

================================================================================
RESTAURATION (si necessaire)
================================================================================

cp {backup_dir}/*.cs {migrations_dir}/

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--no-backup` | Ne pas creer de backup (dangereux) |
| `--name <name>` | Forcer un nom de migration specifique |
| `--dry-run` | Afficher ce qui serait fait sans executer |

---

## Quand utiliser

| Situation | Action |
|-----------|--------|
| `/efcore:conflicts` retourne HIGH | Utiliser rebase-snapshot |
| Merge conflit sur ModelSnapshot | Utiliser rebase-snapshot |
| Plusieurs migrations a consolider | Utiliser rebase-snapshot |
| Migration cassee | Utiliser rebase-snapshot |
