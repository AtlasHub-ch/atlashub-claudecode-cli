---
description: Fusionner plusieurs migrations en une seule (pour releases)
agent: efcore-squash
model: sonnet
---

# EF Core Squash - Consolidate Migrations

Fusionne plusieurs migrations en une seule migration consolidee. Typiquement utilise avant une release.

**UTILISATION:** Avant de creer une branche release pour nettoyer l'historique des migrations.

**ATTENTION:** Cette operation est **DESTRUCTIVE**. L'historique des migrations sera perdu.

---

## ETAPE 1: Verification des prerequis

```bash
# Verifier branche
CURRENT_BRANCH=$(git branch --show-current)
echo "Branche courante: $CURRENT_BRANCH"

# Verifier etat propre
if [ -n "$(git status --porcelain)" ]; then
  echo "ERREUR: Working directory non propre"
  exit 1
fi

# Trouver le projet EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"

# Lister les migrations
ALL_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -v "Designer" | grep -v "Snapshot" | sort)
MIGRATION_COUNT=$(echo "$ALL_MIGRATIONS" | grep -c "." || echo "0")

echo "Migrations trouvees: $MIGRATION_COUNT"
```

---

## ETAPE 2: Demander confirmation

```javascript
AskUserQuestion({
  questions: [{
    question: "Vous allez fusionner " + MIGRATION_COUNT + " migrations en une seule. Cette operation est DESTRUCTIVE. Continuer ?",
    header: "Squash",
    options: [
      { label: "Oui, squash", description: "Fusionner toutes les migrations (recommande pour release)" },
      { label: "Selectif", description: "Choisir les migrations a fusionner" },
      { label: "Annuler", description: "Ne rien faire" }
    ],
    multiSelect: false
  }]
})
```

---

## ETAPE 3: Backup complet

```bash
# Creer backup
BACKUP_DIR=".claude/gitflow/backup/migrations/squash_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backup vers $BACKUP_DIR"
cp "$MIGRATIONS_DIR"/*.cs "$BACKUP_DIR/"
echo "  $(ls -1 "$BACKUP_DIR" | wc -l) fichiers sauvegardes"

# Sauvegarder aussi le schema de la DB actuelle
dotnet ef dbcontext script > "$BACKUP_DIR/schema_before_squash.sql" 2>/dev/null
```

---

## ETAPE 4: Supprimer toutes les migrations

```bash
echo "Suppression des migrations..."

# Garder le ModelSnapshot pour reference
cp "$MIGRATIONS_DIR"/*ModelSnapshot.cs "$BACKUP_DIR/ModelSnapshot_backup.cs"

# Supprimer tous les fichiers de migration
for file in $(find "$MIGRATIONS_DIR" -name "*.cs" -not -name "*ModelSnapshot.cs"); do
  rm -f "$file"
  echo "  - $(basename "$file")"
done

# Reinitialiser le ModelSnapshot (optionnel - EF le regenerera)
# rm "$MIGRATIONS_DIR"/*ModelSnapshot.cs
```

---

## ETAPE 5: Creer la migration consolidee

```bash
# Version
VERSION=$(grep -oP '(?<=<Version>).*(?=</Version>)' "$CSPROJ" 2>/dev/null | head -1 || echo "1.0.0")
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')

# Nom de la migration
if [[ "$CURRENT_BRANCH" == release/* ]]; then
  MIGRATION_NAME="Release_${VERSION_CLEAN}_Initial"
else
  MIGRATION_NAME="Consolidated_${VERSION_CLEAN}_AllMigrations"
fi

echo ""
echo "Creation de la migration consolidee: $MIGRATION_NAME"

cd "$PROJECT_DIR"
dotnet ef migrations add "$MIGRATION_NAME" --verbose

if [ $? -eq 0 ]; then
  echo "  Migration creee"
else
  echo "  ERREUR - restauration du backup"
  cp "$BACKUP_DIR"/*.cs "$MIGRATIONS_DIR/"
  exit 1
fi
```

---

## ETAPE 6: Generer script SQL idempotent

```bash
# Generer le script SQL pour deploiement
SCRIPTS_DIR="./scripts/migrations"
mkdir -p "$SCRIPTS_DIR"

SCRIPT_NAME="${MIGRATION_NAME}.sql"
dotnet ef migrations script --idempotent -o "$SCRIPTS_DIR/$SCRIPT_NAME"

if [ $? -eq 0 ]; then
  echo "  Script SQL genere: $SCRIPTS_DIR/$SCRIPT_NAME"
else
  echo "  Impossible de generer le script SQL"
fi
```

---

## ETAPE 7: Validation

```bash
echo ""
echo "Validation..."

# Build
dotnet build --no-restore
if [ $? -ne 0 ]; then
  echo "  ERREUR: Build echoue"
  exit 1
fi
echo "  Build OK"

# Verifier que la migration peut s'appliquer (dry run)
dotnet ef migrations script --no-build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "  ERREUR: Script generation echoue"
  exit 1
fi
echo "  Script generation OK"
```

---

## ETAPE 8: Resume

```
================================================================================
                    SQUASH TERMINE
================================================================================

BRANCHE:          {current_branch}
BACKUP:           {backup_dir}

AVANT:
  Migrations: {old_count}

APRES:
  Migration:  {migration_name}
  Script SQL: scripts/migrations/{script_name}.sql

================================================================================
IMPORTANT - PRODUCTION
================================================================================

Si votre base de production a deja des migrations appliquees:
1. NE PAS appliquer cette migration consolidee directement
2. Utiliser le script SQL idempotent
3. Ou marquer la migration comme appliquee:
   dotnet ef database update {migration_name} --connection "..." -- --skip-apply

================================================================================
PROCHAINES ETAPES
================================================================================

1. Verifier le contenu de la migration consolidee
2. Tester sur une DB de dev: /efcore:db-reset && /efcore:db-deploy
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
| `--no-script` | Ne pas generer de script SQL |
| `--name <name>` | Forcer un nom de migration |
| `--keep-snapshot` | Garder le ModelSnapshot actuel |
| `--dry-run` | Afficher sans executer |

---

## Quand utiliser Squash

| Situation | Utiliser Squash ? |
|-----------|-------------------|
| Avant release | OUI - nettoyer l'historique |
| Apres merge de plusieurs features | OUI - consolider |
| En production | NON - utiliser scripts SQL |
| Branche feature en cours | ATTENTION - preferer rebase-snapshot |
