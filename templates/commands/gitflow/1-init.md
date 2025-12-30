---
description: Phase 1 - Initialize GitFlow structure and EF Core configuration
---

# Phase 1: INIT - Project Initialization

Tu es un expert GitFlow et EF Core. Ta mission est d'initialiser correctement le projet pour le workflow GitFlow avec support des migrations.

## Etape 1 : Verification des prerequis

Execute ces commandes pour analyser l'etat actuel :

```bash
# Verifier que c'est un repo Git
git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_GIT_REPO"

# Branches existantes
git branch -a

# Verifier si main/master existe
git show-ref --verify refs/heads/main 2>/dev/null && echo "MAIN_EXISTS" || echo "NO_MAIN"
git show-ref --verify refs/heads/master 2>/dev/null && echo "MASTER_EXISTS" || echo "NO_MASTER"

# Verifier si develop existe
git show-ref --verify refs/heads/develop 2>/dev/null && echo "DEVELOP_EXISTS" || echo "NO_DEVELOP"

# Detecter projets .NET
find . -name "*.csproj" -type f 2>/dev/null | head -10

# Detecter EF Core
grep -r "Microsoft.EntityFrameworkCore" --include="*.csproj" . 2>/dev/null | head -5

# Detecter les DbContext existants
grep -r "class.*:.*DbContext" --include="*.cs" . 2>/dev/null | head -5
```

## Etape 2 : Analyse des resultats

### Scenarios possibles

| Scenario | Action |
|----------|--------|
| Pas de repo Git | `git init` puis continuer |
| Pas de branche main | Creer depuis la branche courante |
| Pas de branche develop | Creer depuis main |
| EF Core detecte | Activer les options EF Core |
| Multi-DbContext | Configurer chaque contexte |

## Etape 3 : Creation de la structure

### 3.1 Branches GitFlow

```bash
# Si main n'existe pas, la creer
git checkout -b main 2>/dev/null || git checkout main

# Creer develop depuis main
git checkout -b develop 2>/dev/null || git checkout develop

# Retourner sur develop
git checkout develop
```

### 3.2 Structure de dossiers

Cree cette structure :

```
.claude/
└── gitflow/
    ├── config.json     # Configuration du projet
    ├── plans/          # Plans d'integration
    ├── logs/           # Historique des operations
    └── migrations/     # Tracking des migrations EF Core
        └── history.json
```

```bash
# Creer les dossiers
mkdir -p .claude/gitflow/plans
mkdir -p .claude/gitflow/logs
mkdir -p .claude/gitflow/migrations
```

### 3.3 Configuration initiale

Cree le fichier `.claude/gitflow/config.json` :

```json
{
  "$schema": "https://atlashub.ch/schemas/claude-gitflow-config.json",
  "version": "1.0.0",
  "initialized": "<DATE_ISO>",
  "git": {
    "branches": {
      "main": "main",
      "develop": "develop",
      "featurePrefix": "feature/",
      "releasePrefix": "release/",
      "hotfixPrefix": "hotfix/"
    },
    "remote": "origin",
    "mergeStrategy": "--no-ff",
    "tagPrefix": "v",
    "protectedBranches": ["main", "develop"]
  },
  "efcore": {
    "enabled": <TRUE_SI_DETECTE>,
    "contexts": [
      {
        "name": "<NOM_DBCONTEXT>",
        "projectPath": "<CHEMIN_CSPROJ>",
        "migrationsFolder": "Migrations",
        "startupProject": "<CHEMIN_STARTUP>"
      }
    ],
    "generateScript": true,
    "scriptOutputPath": "./scripts/migrations",
    "idempotentScripts": true,
    "validateBeforeMerge": true
  },
  "workflow": {
    "requireConfirmation": true,
    "autoDeleteBranch": false,
    "createCheckpoints": true,
    "verboseLogging": false,
    "commitConventions": {
      "migration": "db(migrations): ",
      "feature": "feat: ",
      "fix": "fix: ",
      "release": "release: "
    }
  }
}
```

### 3.4 Historique des migrations

Cree le fichier `.claude/gitflow/migrations/history.json` :

```json
{
  "initialized": "<DATE_ISO>",
  "contexts": {},
  "appliedMigrations": [],
  "pendingMigrations": [],
  "lastSync": null
}
```

## Etape 4 : Detection EF Core approfondie

Si EF Core est detecte, execute :

```bash
# Lister tous les DbContext
for csproj in $(find . -name "*.csproj" -type f); do
  if grep -q "Microsoft.EntityFrameworkCore" "$csproj"; then
    echo "=== $csproj ==="
    dir=$(dirname "$csproj")
    find "$dir" -type d -name "Migrations" 2>/dev/null
    dotnet ef migrations list --project "$csproj" --no-build 2>/dev/null || echo "Erreur ou pas de migrations"
  fi
done
```

## Etape 5 : Validation et resume

Affiche un resume de l'initialisation :

```
+--------------------------------------------------+
|           GitFlow Initialise avec succes          |
+--------------------------------------------------+
| Branches:                                         |
|   - main:    [cree/existe]                       |
|   - develop: [cree/existe]                       |
|                                                  |
| EF Core:                                         |
|   - Status:  [active/desactive]                  |
|   - Contextes: [liste]                           |
|   - Migrations: [nombre]                         |
|                                                  |
| Structure:                                       |
|   - .claude/gitflow/config.json                  |
|   - .claude/gitflow/plans/                       |
|   - .claude/gitflow/logs/                        |
|   - .claude/gitflow/migrations/                  |
+--------------------------------------------------+

Prochaines etapes:
1. Verifier la configuration: /gitflow:2-status
2. Commencer une feature: git checkout -b feature/ma-feature
3. Planifier l'integration: /gitflow:4-plan
```

## Etape 6 : Commit initial (optionnel)

Demande a l'utilisateur s'il veut committer la configuration :

```bash
git add .claude/gitflow/
git commit -m "chore(gitflow): initialisation GitFlow avec support EF Core

- Configuration des branches (main/develop)
- Structure de tracking des migrations
- Configuration du workflow

Generated by Claude GitFlow"
```

## Gestion des erreurs

| Erreur | Solution |
|--------|----------|
| Pas un repo Git | Proposer `git init` |
| Conflits de branches | Demander quelle branche utiliser comme base |
| EF Core non installe | Desactiver les options EF Core |
| Permissions | Verifier les droits d'ecriture |
