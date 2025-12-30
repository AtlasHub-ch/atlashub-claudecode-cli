---
description: Phase 3 - Smart commit with EF Core migration validation
args: [message]
---

# Phase 3: COMMIT - Migration-aware commits

Tu es un expert GitFlow et EF Core. Ta mission est de gerer les commits de maniere intelligente, particulierement pour les migrations.

## Argument

`$ARGUMENTS` : Message de commit (optionnel, sera genere si absent)

## Etape 1 : Analyse du contexte

Execute ces commandes pour comprendre l'etat actuel :

```bash
# Branche courante
BRANCH=$(git branch --show-current)
echo "Branche: $BRANCH"

# Type de branche
TYPE=$(echo $BRANCH | grep -oE '^(feature|release|hotfix)' || echo "autre")
echo "Type: $TYPE"

# Fichiers modifies (staged)
echo "=== Fichiers stages ==="
git diff --cached --name-only

# Fichiers modifies (non staged)
echo "=== Fichiers non stages ==="
git diff --name-only

# Fichiers non suivis
echo "=== Fichiers non suivis ==="
git ls-files --others --exclude-standard
```

## Etape 2 : Detection des migrations

```bash
# Migrations dans les fichiers stages
echo "=== Migrations stagees ==="
git diff --cached --name-only | grep -E "Migrations/.*\.cs$" || echo "Aucune"

# Migrations dans les fichiers modifies (non stages)
echo "=== Migrations non stagees ==="
git diff --name-only | grep -E "Migrations/.*\.cs$" || echo "Aucune"

# Nouveaux fichiers migration non suivis
echo "=== Nouvelles migrations ==="
git ls-files --others --exclude-standard | grep -E "Migrations/.*\.cs$" || echo "Aucune"
```

## Etape 3 : Validation des migrations

### 3.1 Verification de completude

Une migration EF Core valide comprend TOUJOURS 3 fichiers :
- `{Timestamp}_{Name}.cs` - La migration principale
- `{Timestamp}_{Name}.Designer.cs` - Les metadonnees
- `{Context}ModelSnapshot.cs` - L'etat du modele (modifie)

```bash
# Trouver les migrations incompletes
STAGED_MIGRATIONS=$(git diff --cached --name-only | grep -E "Migrations/[0-9]+_.*\.cs$" | grep -v "Designer" | grep -v "ModelSnapshot")

for migration in $STAGED_MIGRATIONS; do
  base=$(echo "$migration" | sed 's/\.cs$//')
  designer="${base}.Designer.cs"
  dir=$(dirname "$migration")
  snapshot=$(find "$dir" -name "*ModelSnapshot.cs" 2>/dev/null | head -1)

  echo "Migration: $migration"

  # Verifier Designer
  if git diff --cached --name-only | grep -q "$designer"; then
    echo "  Designer: OK"
  else
    echo "  Designer: MANQUANT - $designer"
  fi

  # Verifier ModelSnapshot
  if git diff --cached --name-only | grep -q "ModelSnapshot.cs"; then
    echo "  ModelSnapshot: OK"
  else
    echo "  ModelSnapshot: MANQUANT"
  fi
done
```

### 3.2 Validation de la migration

```bash
# Verifier que le projet compile
dotnet build --no-restore 2>&1 | tail -20

# Verifier que la migration est valide (dry-run)
dotnet ef migrations script --idempotent --no-build 2>&1 | head -50
```

### 3.3 Detection des conflits potentiels

```bash
# Verifier si develop a des migrations que nous n'avons pas
git fetch origin develop 2>/dev/null

DEVELOP_MIGRATIONS=$(git diff origin/develop --name-only -- "*/Migrations/*.cs" 2>/dev/null | grep -v "ModelSnapshot" | wc -l)

if [ "$DEVELOP_MIGRATIONS" -gt 0 ]; then
  echo "ATTENTION: develop contient $DEVELOP_MIGRATIONS migration(s) absente(s) de cette branche"
  echo "Risque de conflit ModelSnapshot lors du merge!"
  git diff origin/develop --name-only -- "*/Migrations/*.cs" | head -10
fi
```

## Etape 4 : Classification du commit

Determine le type de commit selon les fichiers :

| Fichiers detectes | Type | Prefix |
|-------------------|------|--------|
| Seulement migrations | `migration` | `db(migrations):` |
| Migrations + code | `mixed` | `feat:` ou `fix:` |
| Code sans migration | `code` | Selon branche |
| Config/docs | `chore` | `chore:` |

### Regles de commit pour migrations

1. **Migration seule** : Committer separement des autres changements
2. **Migration + entite** : Acceptable si l'entite est directement liee
3. **Migration + feature complete** : Deconseille, separer les commits

## Etape 5 : Generation du message de commit

### Pour les migrations

Format recommande :
```
db(migrations): [action] [description courte]

Migration: {NomMigration}
Tables affectees:
- [CREATE/ALTER/DROP] {NomTable}

Context: {NomDbContext}
```

Exemple :
```
db(migrations): add Users table with authentication fields

Migration: 20241230143052_AddUsersTable
Tables affectees:
- CREATE Users
- CREATE UserRoles
- ALTER AspNetUsers (FK)

Context: ApplicationDbContext
```

### Pour les commits mixtes

```
feat({scope}): [description]

- [changement 1]
- [changement 2]

Migrations incluses:
- {NomMigration}
```

## Etape 6 : Preparation du commit

### 6.1 Si migrations detectees mais incompletes

```bash
# Ajouter les fichiers manquants
git add "**/Migrations/*.cs"

# Ou selectivement
git add path/to/Migrations/{timestamp}_*.cs
git add path/to/Migrations/*ModelSnapshot.cs
```

### 6.2 Verification finale

```bash
# Recap des fichiers a committer
echo "=== RESUME DU COMMIT ==="
git diff --cached --stat

# Nombre de fichiers migration
MIGRATION_COUNT=$(git diff --cached --name-only | grep -c "Migrations/")
echo "Fichiers migration: $MIGRATION_COUNT"
```

## Etape 7 : Execution du commit

### Option A : Commit migration dedie

```bash
# Si le message est fourni en argument
git commit -m "$ARGUMENTS"

# Sinon, utiliser le message genere
git commit -m "db(migrations): <description>

Migration: <nom>
Context: <context>

Generated by Claude GitFlow"
```

### Option B : Commit interactif

Si plusieurs types de changements, proposer de separer :

1. D'abord les migrations :
```bash
git stash --keep-index
git commit -m "db(migrations): ..."
git stash pop
```

2. Puis le reste du code :
```bash
git add .
git commit -m "feat: ..."
```

## Etape 8 : Post-commit

### 8.1 Mise a jour du tracking

```bash
# Ajouter au fichier history.json
MIGRATION_NAME=$(git diff --cached --name-only | grep -E "Migrations/[0-9]+_" | head -1 | sed 's/.*Migrations\///' | sed 's/\.cs$//')

# Mettre a jour .claude/gitflow/migrations/history.json
```

### 8.2 Verification post-commit

```bash
# Verifier que le commit est propre
git log -1 --stat

# Verifier qu'il n'y a plus de fichiers migration non commites
git status | grep -i migration && echo "ATTENTION: Fichiers migration restants!"
```

## Gestion des erreurs

| Erreur | Cause | Solution |
|--------|-------|----------|
| ModelSnapshot manquant | Oubli d'ajout | `git add **/Migrations/*ModelSnapshot.cs` |
| Designer manquant | Oubli d'ajout | `git add **/Migrations/*.Designer.cs` |
| Build echoue | Migration invalide | `dotnet ef migrations remove` puis corriger |
| Conflit detecte | Divergence avec develop | Rebase d'abord, puis recreer migration |

## Workflow recommande

```
+-------------------+     +-------------------+     +-------------------+
|  dotnet ef        | --> |    /gf-commit     | --> |   /gf-plan        |
|  migrations add   |     |                   |     |   (quand pret)    |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        v                         v                         v
   Cree les 3               Valide et                 Planifie le
   fichiers                 commit propre             merge
```

## Exemples d'utilisation

### Commit simple d'une migration
```
/gf-commit add Users table
```

### Commit avec validation forcee
```
/gf-commit --validate add authentication
```

### Voir ce qui sera commite (dry-run)
```
/gf-commit --dry-run
```
