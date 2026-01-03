---
description: Creer ou recreer la migration EF Core pour la branche courante (1 migration par feature)
agent: efcore-migration
---

# EF Core Migration - 1 Migration par Feature

Cree ou recree la migration unique pour la branche courante.

**REGLE D'OR : 1 seule migration par feature/hotfix. Si elle existe deja, on la supprime et on la recree.**

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer.

---

## ETAPE 0: Validation Cross-Branch (v1.2)

**NOUVEAU:** Avant de creer une migration, verifier qu'il n'y a pas de conflits avec les autres branches.

```bash
# Verifier si validation cross-branch activee
CROSS_BRANCH_ENABLED=$(git config --get efcore.crossBranch.enabled 2>/dev/null || echo "true")
BLOCK_ON_CONFLICT=$(git config --get efcore.crossBranch.blockOnConflict 2>/dev/null || echo "true")

if [ "$CROSS_BRANCH_ENABLED" = "true" ]; then
  echo "Validation cross-branch..."

  # Scanner les autres branches via worktrees
  WORKTREE_BASE=$(git config --get gitflow.worktrees.basePath 2>/dev/null || echo "../worktrees")

  if [ -d "$WORKTREE_BASE/develop" ]; then
    # Comparer ModelSnapshot avec develop
    LOCAL_SNAPSHOT=$(find . -name "*ModelSnapshot.cs" -not -path "*/node_modules/*" | head -1)
    DEVELOP_SNAPSHOT=$(find "$WORKTREE_BASE/develop" -name "*ModelSnapshot.cs" | head -1)

    if [ -n "$LOCAL_SNAPSHOT" ] && [ -n "$DEVELOP_SNAPSHOT" ]; then
      if ! diff -q "$LOCAL_SNAPSHOT" "$DEVELOP_SNAPSHOT" > /dev/null 2>&1; then
        # Differences detectees - analyser le niveau de risque
        DIFF_LINES=$(diff "$DEVELOP_SNAPSHOT" "$LOCAL_SNAPSHOT" 2>/dev/null | wc -l)

        if [ "$DIFF_LINES" -gt 100 ]; then
          echo ""
          echo "ATTENTION: CONFLIT CROSS-BRANCH DETECTE"
          echo ""
          echo "Votre ModelSnapshot differe significativement de develop."
          echo "Differences: $DIFF_LINES lignes"
          echo ""
          echo "RESOLUTIONS:"
          echo "  1. /efcore:rebase-snapshot    (recommande)"
          echo "  2. /efcore:conflicts          (voir details)"
          echo "  3. /efcore:migration --force  (non recommande)"
          echo ""

          if [ "$BLOCK_ON_CONFLICT" = "true" ]; then
            echo "BLOQUE: Utilisez --force pour ignorer"
            exit 1
          fi
        fi
      fi
    fi
  fi

  echo "Validation cross-branch: OK"
fi
```

**Options pour ignorer:**
- `--force` : Ignorer la validation cross-branch
- `--no-cross-check` : Desactiver la validation pour cette execution
- `--rebase-first` : Executer rebase-snapshot automatiquement si conflit

---

## ETAPE 1: Analyser le contexte Git

```bash
# Branche courante
CURRENT_BRANCH=$(git branch --show-current)

# Extraire le type et le nom
if [[ "$CURRENT_BRANCH" == feature/* ]]; then
  BRANCH_TYPE="Feature"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/feature\///' | sed 's/-/_/g' | sed 's/\b\w/\u&/g')
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
  BRANCH_TYPE="Hotfix"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/hotfix\///' | sed 's/-/_/g' | sed 's/\b\w/\u&/g')
elif [[ "$CURRENT_BRANCH" == release/* ]]; then
  BRANCH_TYPE="Release"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/release\///' | sed 's/v//')
else
  BRANCH_TYPE="Dev"
  BRANCH_NAME="Manual"
fi

# Version actuelle
VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json 2>/dev/null || grep -oP '(?<=<Version>).*(?=</Version>)' *.csproj 2>/dev/null | head -1)
VERSION_CLEAN=$(echo "$VERSION" | sed 's/\./_/g')
```

---

## ETAPE 2: Detecter le projet EF Core

```bash
# Trouver le projet avec EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)

# Dossier des migrations
MIGRATIONS_DIR="$PROJECT_DIR/Migrations"
```

---

## ETAPE 3: Chercher migration existante pour cette branche

```bash
# Pattern de recherche base sur le nom de branche
SEARCH_PATTERN="${BRANCH_TYPE}_.*_${BRANCH_NAME}"

# Trouver les fichiers de migration correspondants
EXISTING_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" | grep -E "$SEARCH_PATTERN" | grep -v "Designer" | grep -v "Snapshot")
MIGRATION_COUNT=$(echo "$EXISTING_MIGRATIONS" | grep -c "." || echo "0")
```

**Afficher le contexte:**

```
================================================================================
                    EF CORE MIGRATION - CONTEXTE
================================================================================

BRANCHE
  Courante:    {CURRENT_BRANCH}
  Type:        {BRANCH_TYPE}
  Nom:         {BRANCH_NAME}

VERSION:       {VERSION}

MIGRATIONS EXISTANTES POUR CETTE BRANCHE:
  {MIGRATION_COUNT} migration(s) trouvee(s)
  {Liste des fichiers si > 0}

================================================================================
```

---

## ETAPE 4: Decision - Creer ou Recreer

### Si migration existante (MIGRATION_COUNT > 0):

```javascript
AskUserQuestion({
  questions: [{
    question: "Une migration existe deja pour cette branche. Que faire ?",
    header: "Migration",
    options: [
      { label: "Recreer", description: "Supprimer et recreer la migration (Recommande)" },
      { label: "Garder", description: "Garder l'existante, ajouter une nouvelle (Non recommande)" },
      { label: "Annuler", description: "Ne rien faire" }
    ],
    multiSelect: false
  }]
})
```

**Si Recreer:**

```bash
# 1. Lister les migrations a supprimer
echo "Migrations a supprimer:"
for file in $EXISTING_MIGRATIONS; do
  echo "  - $file"
  # Trouver les fichiers associes (Designer, etc.)
  BASE_NAME=$(basename "$file" .cs)
  rm -f "$MIGRATIONS_DIR/${BASE_NAME}.cs"
  rm -f "$MIGRATIONS_DIR/${BASE_NAME}.Designer.cs"
done

# 2. Annuler dans la DB si appliquee
LAST_GOOD_MIGRATION=$(dotnet ef migrations list 2>/dev/null | grep -v "(Pending)" | tail -2 | head -1)
if [ -n "$LAST_GOOD_MIGRATION" ]; then
  dotnet ef database update "$LAST_GOOD_MIGRATION" --force
fi
```

---

## ETAPE 5: Demander la description

```javascript
AskUserQuestion({
  questions: [{
    question: "Description courte de la migration (ex: AddUserRoles, FixEmailIndex)",
    header: "Description",
    options: [
      { label: "Add", description: "Ajout de tables/colonnes" },
      { label: "Update", description: "Modification de structure" },
      { label: "Fix", description: "Correction de schema" },
      { label: "Remove", description: "Suppression d'elements" }
    ],
    multiSelect: false
  }]
})

// Puis demander le nom specifique en texte libre
// Ex: "AddUserRoles", "FixEmailNullable", "RemoveObsoleteTable"
```

---

## ETAPE 6: Generer le nom de migration

```bash
# Pattern: {BranchType}_{Version}_{BranchName}_{Description}
# Exemple: Feature_1_2_0_UserAuth_AddRolesTable

MIGRATION_NAME="${BRANCH_TYPE}_${VERSION_CLEAN}_${BRANCH_NAME}_${DESCRIPTION}"

# Nettoyer le nom (pas d'espaces, pas de caracteres speciaux)
MIGRATION_NAME=$(echo "$MIGRATION_NAME" | sed 's/[^a-zA-Z0-9_]//g')

echo "Nom de migration: $MIGRATION_NAME"
```

**Exemples de noms generes:**

| Branche | Version | Description | Nom final |
|---------|---------|-------------|-----------|
| feature/user-auth | 1.2.0 | AddRolesTable | Feature_1_2_0_UserAuth_AddRolesTable |
| hotfix/login-fix | 1.2.1 | FixNullEmail | Hotfix_1_2_1_LoginFix_FixNullEmail |
| release/v1.3.0 | 1.3.0 | Initial | Release_1_3_0_Initial |

---

## ETAPE 7: Creer la migration

```bash
cd "$PROJECT_DIR"

# Creer la migration avec le nom genere
dotnet ef migrations add "$MIGRATION_NAME" --verbose

# Verifier la creation
if [ $? -eq 0 ]; then
  echo "✓ Migration creee avec succes"

  # Lister les fichiers crees
  NEW_FILES=$(find "$MIGRATIONS_DIR" -name "*${MIGRATION_NAME}*" -type f)
  echo ""
  echo "Fichiers crees:"
  for f in $NEW_FILES; do
    echo "  - $f"
  done
else
  echo "❌ Erreur lors de la creation"
  exit 1
fi
```

---

## ETAPE 8: Validation du contenu

```bash
# Afficher un apercu de la migration
MIGRATION_FILE=$(find "$MIGRATIONS_DIR" -name "*${MIGRATION_NAME}.cs" | grep -v "Designer" | head -1)

echo ""
echo "================================================================================
                    APERCU DE LA MIGRATION
================================================================================"
echo ""

# Afficher les methodes Up() et Down()
grep -A 20 "protected override void Up" "$MIGRATION_FILE"
echo ""
echo "..."
echo ""
grep -A 10 "protected override void Down" "$MIGRATION_FILE"
```

**Verifier les operations:**

```javascript
AskUserQuestion({
  questions: [{
    question: "La migration semble correcte ?",
    header: "Validation",
    options: [
      { label: "Oui, appliquer", description: "Deployer sur la DB locale" },
      { label: "Oui, pas maintenant", description: "Garder sans appliquer" },
      { label: "Non, supprimer", description: "Annuler et recommencer" }
    ],
    multiSelect: false
  }]
})
```

---

## ETAPE 9: Resume

```
================================================================================
                    MIGRATION CREEE
================================================================================

NOM:          {MIGRATION_NAME}
BRANCHE:      {CURRENT_BRANCH}
VERSION:      {VERSION}

FICHIERS:
  ✓ {timestamp}_{MIGRATION_NAME}.cs
  ✓ {timestamp}_{MIGRATION_NAME}.Designer.cs
  ✓ ApplicationDbContextModelSnapshot.cs (mis a jour)

REGLES RESPECTEES:
  ✓ 1 migration par feature
  ✓ Nommage standardise
  ✓ Tracabilite branche/version

================================================================================
PROCHAINES ETAPES
================================================================================

1. Verifier le code genere dans Migrations/
2. /efcore:db-deploy    → Appliquer sur la DB locale
3. /gitflow:3-commit    → Committer les changements
4. Avant merge: rebase sur develop + recreer si conflits

================================================================================
```

---

## Gestion des conflits de migration

Quand vous faites un rebase sur develop et qu'il y a des conflits sur ModelSnapshot :

```bash
# 1. Accepter la version de develop pour ModelSnapshot
git checkout --theirs Migrations/ApplicationDbContextModelSnapshot.cs

# 2. Supprimer votre migration
rm Migrations/*_{MIGRATION_NAME}.*

# 3. Recreer la migration
/efcore:migration
```

Cette commande le fera automatiquement si elle detecte un conflit.

---

## Options

| Option | Description |
|--------|-------------|
| `--name {name}` | Forcer un nom specifique |
| `--no-apply` | Ne pas proposer d'appliquer |
| `--force` | Supprimer l'existante sans confirmation |
