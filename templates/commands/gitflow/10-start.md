---
description: Phase 10 - Start a new feature, release or hotfix branch with worktree
agent: gitflow-start
model: haiku
---

# Phase 10: START - Demarrer une branche GitFlow (Worktree)

Tu es expert GitFlow. Cree une branche dans un **worktree separe** (par defaut).

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` ci-dessous sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer. NE PAS afficher ce code - ATTENDRE la reponse.

**Argument:** `$ARGUMENTS` = `{type} {name} [--no-worktree]`

---

## ETAPE 1: Analyser le contexte

**IMPORTANT:** Avant toute question, collecter ces informations :

```bash
# 1. Branche courante
CURRENT_BRANCH=$(git branch --show-current)

# 2. Version actuelle (package.json, .csproj, VERSION, etc.)
VERSION=$(cat package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*: "\(.*\)".*/\1/')
# Ou pour .NET: grep -oP '(?<=<Version>).*(?=</Version>)' *.csproj

# 3. Etat working directory
STATUS=$(git status --porcelain)

# 4. Commits develop vs main
DEVELOP_AHEAD=$(git rev-list --count origin/main..origin/develop 2>/dev/null || echo "0")
MAIN_AHEAD=$(git rev-list --count origin/develop..origin/main 2>/dev/null || echo "0")

# 5. Dernier tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")

# 6. Branches existantes
EXISTING_FEATURES=$(git branch -r | grep 'feature/' | wc -l)
EXISTING_RELEASES=$(git branch -r | grep 'release/' | wc -l)
EXISTING_HOTFIXES=$(git branch -r | grep 'hotfix/' | wc -l)

# 7. Compter les migrations sur develop (pour releases)
MIGRATIONS_ON_DEVELOP=$(find . -path "*/Migrations/*.cs" -not -name "*Designer*" -not -name "*ModelSnapshot*" 2>/dev/null | wc -l)
```

---

## ETAPE 2: Afficher le contexte

```
================================================================================
                         GITFLOW START - CONTEXTE
================================================================================

REPOSITORY
  Branche: {CURRENT_BRANCH} | Version: {VERSION} | Tag: {LAST_TAG}
  Working dir: {clean|dirty avec N fichiers}

SYNCHRONISATION
  develop → main: {DEVELOP_AHEAD} commits en avance
  main → develop: {MAIN_AHEAD} commits en avance
  {Si DEVELOP_AHEAD > 0: "Une release est recommandee"}
  {Si MAIN_AHEAD > 0: "⚠️ ATTENTION: main contient des commits absents de develop!"}

BRANCHES ACTIVES
  Features: {N} | Releases: {N} | Hotfixes: {N}

EF CORE (si projet .NET)
  Migrations sur develop: {MIGRATIONS_ON_DEVELOP}

================================================================================
```

---

## ETAPE 3: Questions dynamiques selon contexte

### Si `$ARGUMENTS` fourni → Parser et executer directement

```
$ARGUMENTS = "feature add-user-auth"
→ TYPE = "feature", NAME = "add-user-auth"
→ Sauter les questions, executer directement
```

### Si PAS d'arguments → Questionnaire dynamique

**Construire les options selon le contexte:**

```javascript
// Logique de construction des options
options = []

// Feature: toujours disponible depuis develop
if (CURRENT_BRANCH === 'develop' || canSwitchTo('develop')) {
  options.push({
    label: "feature",
    description: "Nouvelle fonctionnalite (depuis develop)"
  })
}

// Release: proposer SI develop a des commits ahead de main
if (DEVELOP_AHEAD > 0) {
  // Calculer les versions possibles
  const [major, minor, patch] = VERSION.split('.').map(Number)
  options.push({
    label: `release v${major}.${minor + 1}.0`,
    description: `Release minor - ${DEVELOP_AHEAD} commits a publier (Recommande)`
  })
  options.push({
    label: `release v${major + 1}.0.0`,
    description: "Release major - Changements breaking"
  })
}

// Hotfix: toujours disponible, mais mettre en avant si sur main ou si urgent
if (CURRENT_BRANCH === 'main') {
  options.unshift({
    label: "hotfix",
    description: "Correction urgente (depuis main) - PRIORITAIRE"
  })
} else {
  options.push({
    label: "hotfix",
    description: "Correction urgente (depuis main)"
  })
}
```

**AskUserQuestion avec options dynamiques:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Quel type de branche voulez-vous creer ?",
    header: "Type",
    options: options,  // Options construites dynamiquement
    multiSelect: false
  }]
})
```

---

## ETAPE 4: Question de suivi selon le type

### Si FEATURE selectionne:

```javascript
AskUserQuestion({
  questions: [{
    question: "Decrivez la feature (utilisé pour le nom de branche)",
    header: "Feature",
    options: [
      { label: "add-", description: "Ajouter une nouvelle fonctionnalite" },
      { label: "update-", description: "Ameliorer une fonctionnalite existante" },
      { label: "refactor-", description: "Refactoring de code" }
    ],
    multiSelect: false
  }]
})
// Puis demander le nom complet en texte libre
```

### Si RELEASE selectionne:

**Etape A: Verifier l'etat de main**

```javascript
// Si main contient des commits absents de develop (main corrompu/divergent)
if (MAIN_AHEAD > 0) {
  AskUserQuestion({
    questions: [{
      question: `⚠️ ATTENTION: main contient ${MAIN_AHEAD} commits absents de develop. Comment proceder ?`,
      header: "Main",
      options: [
        { label: "Reset main", description: "Cette release remettra main en sync avec develop (Recommande)" },
        { label: "Analyser d'abord", description: "Voir les commits divergents avant de decider" },
        { label: "Continuer normalement", description: "Ignorer la divergence (non recommande)" }
      ],
      multiSelect: false
    }]
  })
}

// Si "Analyser d'abord" → Afficher les commits divergents:
// git log origin/develop..origin/main --oneline
```

**Etape B: Gestion des migrations EF Core**

```javascript
// Si projet .NET avec plusieurs migrations
if (MIGRATIONS_ON_DEVELOP > 3) {
  AskUserQuestion({
    questions: [{
      question: `Il y a ${MIGRATIONS_ON_DEVELOP} migrations sur develop. Voulez-vous les consolider ?`,
      header: "Migrations",
      options: [
        { label: "Consolider", description: "Squash en 1 migration propre (Recommande pour releases)" },
        { label: "Garder separees", description: "Conserver l'historique des migrations" }
      ],
      multiSelect: false
    }]
  })
}

// Si "Consolider" → Executer le processus de squash:
// 1. Backup de la branche actuelle
// 2. dotnet ef migrations list → sauvegarder la liste
// 3. dotnet ef database drop (si DB locale de dev)
// 4. Supprimer tous les fichiers Migrations/
// 5. dotnet ef migrations add InitialCreate_v{version}
// 6. Commit avec message descriptif
```

**Etape C: Confirmer la version**

```javascript
const [major, minor, patch] = VERSION.split('.').map(Number)

AskUserQuestion({
  questions: [{
    question: "Confirmer la version de release",
    header: "Version",
    options: [
      { label: `${major}.${minor + 1}.0`, description: "Minor - Nouvelles fonctionnalites (Recommande)" },
      { label: `${major}.${minor}.${patch + 1}`, description: "Patch - Corrections uniquement" },
      { label: `${major + 1}.0.0`, description: "Major - Changements breaking" }
    ],
    multiSelect: false
  }]
})
```

### Si HOTFIX selectionne:

**⚠️ NOTE VERSIONING:** La version sera automatiquement incrementee (PATCH) lors du `/gitflow:11-finish`.
Exemple: `1.7.1` → `1.7.2`. Pas besoin de faire `npm version patch` manuellement.

```javascript
AskUserQuestion({
  questions: [{
    question: "Decrivez le hotfix (utilisé pour le nom de branche)",
    header: "Hotfix",
    options: [
      { label: "fix-", description: "Correction de bug" },
      { label: "security-", description: "Correction de securite" },
      { label: "revert-", description: "Annuler un changement" }
    ],
    multiSelect: false
  }]
})
// Puis demander le nom complet en texte libre
```

---

## ETAPE 5: Verifications pre-creation

| Check | Commande | Action si echec |
|-------|----------|-----------------|
| Working tree clean | `git status --porcelain` | Proposer stash ou commit |
| Branche n'existe pas | `git branch --list {branch}` | Erreur avec suggestion |
| Base a jour | `git fetch origin` | Fetch automatique |

**Si working directory dirty:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Working directory non propre. Que faire ?",
    header: "Action",
    options: [
      { label: "Stash", description: "git stash - Sauvegarder temporairement" },
      { label: "Commit", description: "Lancer /gitflow:3-commit d'abord" },
      { label: "Continuer", description: "Ignorer (non recommande)" }
    ],
    multiSelect: false
  }]
})
```

---

## ETAPE 6: Creer la branche

### Mode Worktree (defaut)

**Structure organisee:** `../worktrees/{type}s/{name}/`

```bash
WORKTREE_BASE="../worktrees"

# Creer le repertoire parent et le sous-repertoire du type
mkdir -p "${WORKTREE_BASE}/features"
mkdir -p "${WORKTREE_BASE}/releases"
mkdir -p "${WORKTREE_BASE}/hotfixes"

git fetch origin

# Feature (depuis develop)
WORKTREE_PATH="${WORKTREE_BASE}/features/{name}"
git worktree add -b feature/{name} "$WORKTREE_PATH" origin/develop

# Release (depuis develop)
WORKTREE_PATH="${WORKTREE_BASE}/releases/v{version}"
git worktree add -b release/v{version} "$WORKTREE_PATH" origin/develop

# Hotfix (depuis main)
WORKTREE_PATH="${WORKTREE_BASE}/hotfixes/{name}"
git worktree add -b hotfix/{name} "$WORKTREE_PATH" origin/main
```

### Mode --no-worktree

```bash
# Feature
git checkout develop && git pull origin develop
git checkout -b feature/{name}

# Release
git checkout develop && git pull origin develop
git checkout -b release/v{version}

# Hotfix
git checkout main && git pull origin main
git checkout -b hotfix/{name}
```

---

## ETAPE 6.5: Configuration appsettings.Local.json (Projets .NET)

**Detecter les projets .NET dans le worktree:**

```bash
# Chercher les fichiers appsettings.json
APPSETTINGS=$(find . -name "appsettings.json" -not -path "*/bin/*" -not -path "*/obj/*" 2>/dev/null)
```

**Si appsettings.json trouve:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Fichier appsettings.json detecte. Creer un appsettings.Local.json pour la config locale ?",
    header: "AppSettings",
    options: [
      { label: "Oui", description: "Copier et configurer la connexion DB (Recommande)" },
      { label: "Non", description: "Ignorer - je configurerai plus tard" }
    ],
    multiSelect: false
  }]
})
```

**Si OUI - Demander la configuration DB:**

```javascript
AskUserQuestion({
  questions: [
    {
      question: "Type d'authentification SQL Server ?",
      header: "Auth",
      options: [
        { label: "Windows Auth", description: "Trusted_Connection=true (Recommande)" },
        { label: "SQL Auth", description: "Username/Password" }
      ],
      multiSelect: false
    }
  ]
})

// Puis demander les infos en texte libre :
// - Server : (defaut: localhost ou .\SQLEXPRESS)
// - Database : nom de la base de donnees
// - Si SQL Auth : Username et Password
```

**Creer le fichier appsettings.Local.json:**

```bash
# Copier appsettings.json comme base
cp appsettings.json appsettings.Local.json

# Generer la connection string
# Windows Auth:
CONNECTION_STRING="Server=${SERVER};Database=${DATABASE};Trusted_Connection=true;TrustServerCertificate=true"

# SQL Auth:
CONNECTION_STRING="Server=${SERVER};Database=${DATABASE};User Id=${USERNAME};Password=${PASSWORD};TrustServerCertificate=true"
```

**Mettre a jour le fichier avec la connection string:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<CONNECTION_STRING>"
  }
}
```

**Ajouter au .gitignore si absent:**

```bash
if ! grep -q "appsettings.Local.json" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Local settings (ne pas committer)" >> .gitignore
  echo "appsettings.Local.json" >> .gitignore
  echo "appsettings.*.Local.json" >> .gitignore
fi
```

**Verification de coherence des ports:**

```bash
# Collecter tous les fichiers appsettings*.json du projet
ALL_APPSETTINGS=$(find . -name "appsettings*.json" -not -path "*/bin/*" -not -path "*/obj/*" 2>/dev/null)

# Extraire les ports configures (URLs Kestrel, ports DB, etc.)
PORTS_FOUND=()
for file in $ALL_APPSETTINGS; do
  # Ports Kestrel (ex: "http://localhost:5000", "https://localhost:5001")
  KESTREL_PORTS=$(grep -oP '(?<=localhost:)\d+' "$file" 2>/dev/null)

  # Ports dans ConnectionStrings (ex: "Server=localhost,1433")
  DB_PORTS=$(grep -oP '(?<=localhost,)\d+|(?<=Server=)[^;,]+,\d+' "$file" 2>/dev/null | grep -oP '\d+$')

  PORTS_FOUND+=($KESTREL_PORTS $DB_PORTS)
done

# Detecter les conflits de ports entre projets
DUPLICATE_PORTS=$(echo "${PORTS_FOUND[@]}" | tr ' ' '\n' | sort | uniq -d)
```

**Si conflits de ports detectes:**

```javascript
if (DUPLICATE_PORTS.length > 0) {
  AskUserQuestion({
    questions: [{
      question: `⚠️ Ports en conflit detectes: ${DUPLICATE_PORTS.join(', ')}. Que faire ?`,
      header: "Ports",
      options: [
        { label: "Corriger", description: "Modifier les ports pour eviter les conflits (Recommande)" },
        { label: "Ignorer", description: "Continuer sans correction (attention aux erreurs au runtime)" }
      ],
      multiSelect: false
    }]
  })
}

// Si "Corriger" → Proposer des ports alternatifs:
// - API Backend: 5000, 5001, 5002... ou 7000, 7001...
// - Frontend: 3000, 4200, 8080...
// - DB: generalement pas de conflit (1433 SQL Server)
```

**Recommandation ports par type d'application:**

| Type | Port HTTP | Port HTTPS | Notes |
|------|-----------|------------|-------|
| API Backend | 5000-5099 | 5100-5199 | ou 7000-7099/7100-7199 |
| Web Frontend | 3000-3099 | - | SPA (React, Angular, Vue) |
| Blazor Server | 5200-5299 | 5300-5399 | |
| Identity Server | 5500 | 5501 | Auth centralisee |
| Gateway/BFF | 5600 | 5601 | API Gateway |

**Afficher resume:**

```
================================================================================
                    CONFIGURATION LOCALE CREEE
================================================================================

FICHIER:  appsettings.Local.json
SERVER:   {SERVER}
DATABASE: {DATABASE}
AUTH:     {Windows|SQL}

PORTS CONFIGURES:
  {PROJECT_NAME}: HTTP {PORT_HTTP} | HTTPS {PORT_HTTPS}
  {Si plusieurs projets, lister chaque projet avec ses ports}

VERIFICATION PORTS: {✓ Aucun conflit | ⚠️ Conflits corriges | ⚠️ Conflits ignores}

⚠️  Ce fichier est ignore par git (credentials securises)

PROCHAINE ETAPE:
  /efcore:db-deploy  → Deployer la base de donnees
================================================================================
```

---

## ETAPE 7: Actions post-creation

**Release uniquement** - Bump version :
```bash
npm version {version} --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump version to {version}"
```

**Push branche:**
```bash
git push -u origin {branch}
```

---

## ETAPE 8: Resume et prochaines etapes

```
================================================================================
                         BRANCHE CREEE
================================================================================

TYPE:     {feature|release|hotfix}
BRANCHE:  {branch_name}
BASE:     {develop|main}
CIBLE:    {develop|main+develop}
VERSION:  {version} (si release)

WORKTREE: ../worktrees/{type}s/{name} (ou "meme repertoire" si --no-worktree)

================================================================================
PROCHAINES ETAPES
================================================================================

1. {Si worktree: "cd ../worktrees/{type}s/{name}" ou "code ../worktrees/{type}s/{name}"}
2. Faire vos modifications
3. /gitflow:3-commit
4. /gitflow:7-pull-request
5. /gitflow:11-finish (apres merge PR)

================================================================================
```

---

## Exemples

| Commande | Resultat |
|----------|----------|
| `/gitflow:10-start` | Mode interactif avec contexte |
| `/gitflow:10-start feature user-auth` | `feature/user-auth` direct |
| `/gitflow:10-start release` | Propose versions basees sur actuelle |
| `/gitflow:10-start hotfix login-fix` | `hotfix/login-fix` direct |
| `/gitflow:10-start feature test --no-worktree` | Sans worktree |

---

## Cas speciaux

### Develop tres en avance de main (> 10 commits)

```
⚠️  ATTENTION: develop a {N} commits en avance de main.
    Une release est fortement recommandee avant de creer une nouvelle feature.

    Voulez-vous:
    1. Creer une release d'abord (Recommande)
    2. Continuer avec la feature quand meme
```

### Release en cours

```
⚠️  Une release est deja en cours: release/v1.2.0

    Voulez-vous:
    1. Continuer sur la release existante
    2. Creer une nouvelle release (rare)
```

### Hotfix urgent depuis n'importe quelle branche

```
Si hotfix selectionne depuis une branche != main:
→ Stash automatique des changements
→ Checkout main
→ Creer hotfix
→ Message: "Vos changements ont ete stash. Recuperez-les avec 'git stash pop' apres le hotfix."
```

### Main divergent (commits absents de develop)

**Situation:** main contient des commits qui ne sont pas sur develop (ex: hotfix mal merge, commit direct sur main)

**Detection:**
```bash
MAIN_AHEAD=$(git rev-list --count origin/develop..origin/main 2>/dev/null || echo "0")
```

**Si utilisateur choisit "Reset main":**
```bash
# Pendant la release, au moment du finish:
# 1. Merge develop → release (normal)
# 2. Au lieu de merge release → main, faire un reset:
git checkout main
git reset --hard release/v{version}
git push --force-with-lease origin main
# 3. Puis merge release → develop (normal)
```

**Note:** This operation is logged in [.claude/gitflow/logs/](.claude/gitflow/logs/)`main-resets.json`

### Consolidation des migrations EF Core

**Situation:** Plusieurs migrations accumulees sur develop (> 3)

**Avantages de consolider:**
- 1 seule migration = schema propre
- Pas de conflits ModelSnapshot lors des merges
- Deploy plus rapide en production

**Processus si utilisateur choisit "Consolider":**

```bash
# 1. S'assurer d'etre sur la branche release
cd "${WORKTREE_PATH}"

# 2. Sauvegarder la liste des migrations
dotnet ef migrations list > migrations-backup.txt

# 3. Identifier le DbContext
CONTEXT=$(grep -l "DbContext" **/*.cs | head -1)

# 4. Supprimer toutes les migrations
rm -rf Migrations/

# 5. Creer une migration consolidee
dotnet ef migrations add InitialCreate_v{version} --context {DbContext}

# 6. Verifier que le build passe
dotnet build

# 7. Commit la consolidation
git add -A
git commit -m "db(migrations): consolidate migrations for v{version}

Merged migrations:
$(cat migrations-backup.txt)

Single migration: InitialCreate_v{version}"

rm migrations-backup.txt
```

**⚠️ IMPORTANT:**
- Ceci est uniquement pour les releases (pas features/hotfixes)
- La DB de production doit etre synchronisee avec les migrations AVANT la consolidation
- Apres consolidation, les environnements de dev doivent recreer leur DB locale
