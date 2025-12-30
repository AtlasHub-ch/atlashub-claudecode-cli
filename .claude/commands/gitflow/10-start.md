---
description: Phase 10 - Start a new feature, release or hotfix branch with worktree
---

# Phase 10: START - Demarrer une branche GitFlow (Worktree)

Tu es expert GitFlow. Cree une branche dans un **worktree separe** (par defaut).

**Argument:** `$ARGUMENTS` = `{type} {name} [--no-worktree]`

---

## Pourquoi Worktree par defaut ?

| Avantage | Description |
|----------|-------------|
| **Hotfix urgent** | Pas besoin de stash, ouvrir autre dossier |
| **Build cache** | Conserve par branche (node_modules, bin/) |
| **IDE** | Plusieurs fenetres, pas de reload |
| **Comparaison** | Code cote a cote |
| **Isolation** | Pas de pollution entre branches |

**Structure:**
```
projet/                    ← develop (main worktree)
projet-feature-auth/       ← feature/auth (worktree)
projet-hotfix-login/       ← hotfix/login-fix (worktree)
projet-release-v1.2.0/     ← release/v1.2.0 (worktree)
```

---

## Types de branches

| Type | Base | Cible | Exemple |
|------|------|-------|---------|
| `feature` | develop | develop | `feature/add-user-auth` |
| `release` | develop | main + develop | `release/v1.2.0` |
| `hotfix` | main | main + develop | `hotfix/fix-login-bug` |

---

## Workflow

### 1. Determiner le type

Si `$ARGUMENTS` fourni, parser :
```
$ARGUMENTS = "feature add-user-auth"
TYPE = "feature"
NAME = "add-user-auth"
```

Sinon, demander :

```
AskUserQuestion({
  questions: [{
    question: "Quel type de branche voulez-vous creer ?",
    header: "Type",
    options: [
      { label: "feature", description: "Nouvelle fonctionnalite (depuis develop)" },
      { label: "release", description: "Preparation release (depuis develop vers main)" },
      { label: "hotfix", description: "Correction urgente (depuis main)" }
    ],
    multiSelect: false
  }]
})
```

### 2. Determiner le nom

**Feature/Hotfix** - Demander description :
```
Entrez une description courte (ex: add-user-authentication):
```

**Release** - Proposer version :
```bash
# Lire version actuelle
CURRENT=$(cat package.json | jq -r '.version')

# Proposer increment
# 1.0.0 → 1.1.0 (minor) ou 1.0.1 (patch) ou 2.0.0 (major)
```

### 3. Verifications pre-creation

| Check | Commande | Action si echec |
|-------|----------|-----------------|
| Working tree clean | `git status --porcelain` | Stash ou commit |
| Branche n'existe pas | `git branch --list {branch}` | Erreur |
| Base a jour | `git fetch origin` | - |

### 4. Creer le worktree + branche

```bash
# Variables
PROJECT_NAME=$(basename $(pwd))
WORKTREE_PATH="../${PROJECT_NAME}-${TYPE}-${NAME}"

# Fetch pour avoir les refs a jour
git fetch origin

# Creer worktree avec nouvelle branche
# Feature (depuis develop)
git worktree add -b feature/{name} "$WORKTREE_PATH" origin/develop

# Release (depuis develop)
git worktree add -b release/v{version} "$WORKTREE_PATH" origin/develop

# Hotfix (depuis main)
git worktree add -b hotfix/{name} "$WORKTREE_PATH" origin/main
```

### 5. Actions post-creation

**Aller dans le worktree:**
```bash
cd "$WORKTREE_PATH"
```

**Release uniquement** - Bump version :
```bash
# package.json
npm version {version} --no-git-tag-force

# Ou .csproj
sed -i 's/<Version>.*<\/Version>/<Version>{version}<\/Version>/' *.csproj
```

**Tous types** - Push branche :
```bash
git push -u origin {branch}
```

**Ouvrir dans IDE (optionnel):**
```bash
code "$WORKTREE_PATH"  # VS Code
rider "$WORKTREE_PATH" # Rider
```

### Alternative: --no-worktree

Si vous preferez le mode classique (switch de branche) :

```bash
/gitflow:10-start feature ma-feature --no-worktree
```

Ceci fait un simple `git checkout -b` sans creer de worktree.

---

## Resume

```
BRANCHE CREEE
────────────────────────────────
Type:    {feature|release|hotfix}
Branche: {branch_name}
Base:    {develop|main}
Cible:   {develop|main+develop}

Version: {version} (si release)
────────────────────────────────
Prochaines etapes:
1. Faire vos modifications
2. /gitflow:3-commit
3. /gitflow:7-pull-request
4. /gitflow:11-finish (apres merge)
```

---

## Exemples

| Commande | Resultat |
|----------|----------|
| `/gitflow:10-start feature user-auth` | `feature/user-auth` depuis develop |
| `/gitflow:10-start release 1.2.0` | `release/v1.2.0` depuis develop |
| `/gitflow:10-start hotfix login-fix` | `hotfix/login-fix` depuis main |
| `/gitflow:10-start` | Mode interactif |

---

## Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Branch already exists" | Utiliser autre nom ou supprimer |
| "Working tree dirty" | `git stash` ou `/gitflow:3-commit` |
| "Not on correct base" | Checkout base d'abord |
