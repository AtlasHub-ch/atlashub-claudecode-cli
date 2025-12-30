---
description: Phase 4 - Generate integration plan with EF Core migration analysis
---

# Phase 4: PLAN - Integration Planning

Tu es un expert GitFlow et EF Core. Ta mission est de creer un plan d'integration detaille et securise.

## Etape 1 : Analyse du contexte Git

Execute ces commandes :

```bash
# Branche courante et type
BRANCH=$(git branch --show-current)
TYPE=$(echo $BRANCH | grep -oE '^(feature|release|hotfix)' || echo "autre")

echo "Branche: $BRANCH"
echo "Type: $TYPE"

# Commit initial de la branche
BRANCH_START=$(git merge-base develop HEAD 2>/dev/null || git merge-base main HEAD 2>/dev/null)
echo "Commit de depart: $BRANCH_START"

# Commits en avance/retard sur develop
echo "=== Synchronisation avec develop ==="
git rev-list --left-right --count develop...HEAD 2>/dev/null || echo "0 0"

# Commits en avance/retard sur main
echo "=== Synchronisation avec main ==="
git rev-list --left-right --count main...HEAD 2>/dev/null || echo "0 0"

# Fichiers modifies vs develop
echo "=== Fichiers modifies (vs develop) ==="
git diff develop --name-only 2>/dev/null | head -30

# Historique des commits de la branche
echo "=== Commits de la branche ==="
git log develop..HEAD --oneline 2>/dev/null | head -20
```

## Etape 2 : Analyse EF Core approfondie

### 2.1 Detection des migrations

```bash
# Charger la config
CONFIG_FILE=".claude/gitflow/config.json"
if [ -f "$CONFIG_FILE" ]; then
  EF_ENABLED=$(cat "$CONFIG_FILE" | grep -o '"enabled":[^,]*' | head -1 | grep -o 'true\|false')
  echo "EF Core active: $EF_ENABLED"
fi

# Lister les migrations actuelles
echo "=== Migrations du projet ==="
dotnet ef migrations list --no-build 2>/dev/null || echo "EF Core non disponible"

# Migrations ajoutees sur cette branche
echo "=== Migrations ajoutees sur cette branche ==="
git diff develop --name-only -- "*/Migrations/*.cs" 2>/dev/null | grep -v "ModelSnapshot" | grep -v "Designer"

# Migrations sur develop absentes ici
echo "=== Migrations sur develop (absentes ici) ==="
git diff HEAD...develop --name-only -- "*/Migrations/*.cs" 2>/dev/null | grep -v "ModelSnapshot" | grep -v "Designer"
```

### 2.2 Detection des conflits ModelSnapshot

```bash
# Verifier si ModelSnapshot a ete modifie des deux cotes
echo "=== Analyse ModelSnapshot ==="

# Sur notre branche
OUR_SNAPSHOT=$(git diff develop --name-only -- "*ModelSnapshot.cs" 2>/dev/null)

# Sur develop depuis notre fork
THEIR_SNAPSHOT=$(git diff HEAD...develop --name-only -- "*ModelSnapshot.cs" 2>/dev/null)

if [ -n "$OUR_SNAPSHOT" ] && [ -n "$THEIR_SNAPSHOT" ]; then
  echo "CONFLIT DETECTE: ModelSnapshot modifie des deux cotes!"
  echo "Notre modification: $OUR_SNAPSHOT"
  echo "Leur modification: $THEIR_SNAPSHOT"
  echo ""
  echo "ACTION REQUISE: Rebase + Regeneration de migration"
else
  echo "Pas de conflit ModelSnapshot detecte"
fi
```

### 2.3 Validation des migrations

```bash
# Verifier que toutes les migrations compilent
echo "=== Validation compilation ==="
dotnet build --no-restore 2>&1 | grep -E "(error|warning)" | head -10

# Generer un script de test (dry-run)
echo "=== Test generation script SQL ==="
dotnet ef migrations script --idempotent --no-build 2>&1 | head -30
```

### 2.4 Ordre des migrations

```bash
# Verifier l'ordre chronologique
echo "=== Ordre des migrations ==="
dotnet ef migrations list --no-build 2>/dev/null | grep -E "^[0-9]+" | while read migration; do
  timestamp=$(echo "$migration" | grep -oE "^[0-9]+")
  echo "$timestamp: $migration"
done | sort -c 2>&1 && echo "Ordre OK" || echo "ATTENTION: Ordre incorrect!"
```

## Etape 3 : Determiner les actions selon le type

### Feature -> Develop

| Condition | Action |
|-----------|--------|
| Pas de migrations | Rebase + Merge --no-ff |
| Migrations sans conflit | Rebase + Merge --no-ff |
| Conflit ModelSnapshot | Rebase + Remove migration + Re-add migration |
| Migrations sur les 2 branches | Merge develop d'abord, puis rebase |

### Release -> Main + Develop

| Condition | Action |
|-----------|--------|
| Migrations pending | Generer script SQL idempotent |
| Release stable | Tag + Merge main + Merge develop |
| Multi-migrations | Squash optionnel avant release |

### Hotfix -> Main + Develop

| Condition | Action |
|-----------|--------|
| Migration necessaire | Prefix special `Hotfix_` |
| Urgence | Script SQL FROM derniere migration main |
| Backport | Merge main -> develop avec resolution |

## Etape 4 : Generer le plan detaille

Cree le fichier `.claude/gitflow/plans/<type>-<nom>_<date>.md` avec ce format :

```markdown
# Plan d'integration: <BRANCH_NAME>

## Metadonnees
- **Branche source**: <branch>
- **Branche cible**: <target>
- **Date de creation**: <date>
- **Commit initial**: <commit_hash>
- **Auteur**: <git_user>

## Analyse

### Git
- Commits a integrer: <count>
- Fichiers modifies: <count>
- Conflits potentiels: <list>

### EF Core
- Migrations ajoutees: <list>
- Conflit ModelSnapshot: <oui/non>
- Script SQL requis: <oui/non>

## Pre-requis

- [ ] Working directory propre (`git status` clean)
- [ ] Sur la branche source (<branch>)
- [ ] develop a jour (`git fetch origin`)
- [ ] Tests passent (`dotnet test`)
- [ ] Build OK (`dotnet build`)

## Etapes d'execution

### Phase 1: Preparation
```bash
# Sauvegarder l'etat actuel
git stash list > .claude/gitflow/logs/<plan>_stash_backup.txt
git log -1 --format="%H" > .claude/gitflow/logs/<plan>_head_backup.txt

# Mettre a jour les references
git fetch origin develop
git fetch origin main
```

### Phase 2: Gestion des migrations (si applicable)

#### Si conflit ModelSnapshot detecte:
```bash
# 1. Sauvegarder notre migration
cp -r Migrations/ .claude/gitflow/logs/<plan>_migrations_backup/

# 2. Identifier notre migration
OUR_MIGRATION=$(git diff develop --name-only -- "*/Migrations/*.cs" | grep -v "ModelSnapshot" | grep -v "Designer" | head -1)

# 3. Supprimer notre migration temporairement
dotnet ef migrations remove --force

# 4. Rebase sur develop
git rebase develop

# 5. Re-creer la migration
dotnet ef migrations add <NomMigration>

# 6. Verifier le resultat
dotnet ef migrations list --no-build
```

#### Si pas de conflit:
```bash
# Simple rebase
git rebase develop

# Verifier les migrations
dotnet ef migrations list --no-build
```

### Phase 3: Integration

#### Pour feature -> develop:
```bash
# Checkout develop
git checkout develop

# Merge avec --no-ff
git merge --no-ff <branch> -m "Merge <branch> into develop"

# Verifier
git log --oneline -5
```

#### Pour release -> main + develop:
```bash
# Generer script SQL
dotnet ef migrations script --idempotent -o ./scripts/migrations/release_<version>.sql

# Merge sur main
git checkout main
git merge --no-ff <branch> -m "Release <version>"

# Tag
git tag -a v<version> -m "Release <version>"

# Merge sur develop
git checkout develop
git merge --no-ff main -m "Merge release <version> into develop"
```

### Phase 4: Validation post-merge

```bash
# Build
dotnet build

# Tests
dotnet test

# Verifier migrations
dotnet ef migrations list --no-build

# Verifier historique
git log --oneline --graph -10
```

### Phase 5: Nettoyage (optionnel)

```bash
# Supprimer la branche locale
git branch -d <branch>

# Supprimer la branche remote
git push origin --delete <branch>
```

## Checkpoints

| Etape | Verification | Commande |
|-------|--------------|----------|
| Pre-rebase | Backup OK | `ls .claude/gitflow/logs/<plan>_*` |
| Post-rebase | Pas de conflits | `git status` |
| Post-merge | Build OK | `dotnet build` |
| Final | Tests OK | `dotnet test` |

## Rollback

En cas d'echec, executer dans l'ordre inverse :

```bash
# Annuler merge en cours
git merge --abort 2>/dev/null
git rebase --abort 2>/dev/null

# Revenir au commit initial
git checkout <branch>
git reset --hard <commit_initial>

# Restaurer les migrations si necessaire
cp -r .claude/gitflow/logs/<plan>_migrations_backup/* Migrations/
```

## Notes
- Plan genere par Claude GitFlow
- Ne pas modifier manuellement ce fichier pendant l'execution
- Utiliser /gf-abort en cas de probleme
```

## Etape 5 : Demander validation

Affiche un resume :

```
+----------------------------------------------------------+
|                    PLAN D'INTEGRATION                     |
+----------------------------------------------------------+
| Branche: feature/xyz -> develop                          |
|                                                          |
| Git:                                                     |
|   - 5 commits a integrer                                 |
|   - 12 fichiers modifies                                 |
|                                                          |
| EF Core:                                                 |
|   - 1 migration: 20241230_AddUsers                      |
|   - Conflit ModelSnapshot: NON                          |
|   - Script SQL: genere si release                       |
|                                                          |
| Risques identifies:                                      |
|   - Aucun (ou liste des risques)                        |
|                                                          |
| Fichier plan: .claude/gitflow/plans/feature-xyz_20241230.md |
+----------------------------------------------------------+

Voulez-vous sauvegarder ce plan? (oui/non)
```

## Gestion des cas speciaux

### Migration sur les deux branches

```
ATTENTION: Migrations detectees sur develop ET sur cette branche.

Migrations sur develop:
- 20241229_AddProducts

Migrations sur cette branche:
- 20241230_AddUsers

Action recommandee:
1. Merger develop dans cette branche d'abord
2. Resoudre les conflits ModelSnapshot
3. Puis proceder a l'integration normale

Commande:
  git merge develop
  # Resoudre conflits
  dotnet ef migrations add MergeSnapshot --force
```

### Hotfix avec migration urgente

```
HOTFIX DETECTE avec migration.

Action speciale:
1. La migration sera prefixee "Hotfix_"
2. Script SQL genere FROM derniere migration sur main
3. Double attention au backport sur develop

Commande pour script SQL:
  dotnet ef migrations script <last_main_migration> --idempotent -o ./scripts/hotfix_<name>.sql
```
