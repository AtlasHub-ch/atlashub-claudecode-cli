---
description: Phase 7 - Create Pull Request with auto-generated description and checks
---

# Phase 7: PULL-REQUEST - Creation PR avec checks

Tu es expert GitFlow. Cree une Pull Request avec validation complete.

**Argument:** `$ARGUMENTS` = branche cible (optionnel, default: develop)

---

## Pre-checks obligatoires

### 1. Validation branche

```bash
# Branche courante
CURRENT=$(git rev-parse --abbrev-ref HEAD)

# Verifier que ce n'est pas main/develop
if [[ "$CURRENT" == "main" || "$CURRENT" == "develop" ]]; then
  echo "ERREUR: Impossible de creer PR depuis $CURRENT"
  exit 1
fi
```

### 2. Synchronisation

| Check | Commande | Action si echec |
|-------|----------|-----------------|
| Fetch | `git fetch origin` | - |
| A jour vs target | `git rev-list --count HEAD..origin/{target}` | `git rebase origin/{target}` |
| Pas de conflits | `git merge-tree` | Resoudre conflits d'abord |

### 3. Qualite code

| Check | Commande | Bloquant |
|-------|----------|----------|
| Build | `dotnet build` | OUI |
| Tests | `dotnet test` | OUI |
| Format | `dotnet format --verify-no-changes` | NON (warning) |

### 4. EF Core (si applicable)

| Check | Validation |
|-------|------------|
| Migrations completes | 3 fichiers (Migration + Designer + ModelSnapshot) |
| Build avec migrations | `dotnet ef migrations script --idempotent` |
| Pas de pending | Toutes migrations commitees |

---

## Generation PR

### Titre automatique

| Type branche | Format titre |
|--------------|--------------|
| `feature/*` | `feat: {description from branch name}` |
| `hotfix/*` | `fix: {description from branch name}` |
| `release/*` | `release: v{version}` |
| Autre | `{branch name}` |

**Extraction description:**
```
feature/add-user-authentication → "add user authentication"
hotfix/fix-login-bug → "fix login bug"
```

### Description automatique

```markdown
## Summary

{Liste des commits depuis divergence avec develop}

## Changes

- {Fichiers modifies groupes par type}

## Checklist

- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Breaking changes documentés
- [ ] Migration EF Core testée (si applicable)

## EF Core Migrations

{Liste des migrations incluses, ou "Aucune migration"}

---
🤖 Generated with GitFlow
```

### Labels automatiques

| Condition | Label |
|-----------|-------|
| `feature/*` | `enhancement` |
| `hotfix/*` | `bug` |
| `release/*` | `release` |
| Contient migrations | `database` |
| Tests modifies | `tests` |

---

## Execution

```bash
gh pr create \
  --base {target} \
  --title "{titre}" \
  --body "{description}" \
  --label "{labels}" \
  --assignee "@me"
```

### Options supplementaires

| Option | Condition | Action |
|--------|-----------|--------|
| `--draft` | Si WIP dans titre | Creer comme draft |
| `--reviewer` | Si configure dans config.json | Ajouter reviewers |
| `--milestone` | Si release | Associer milestone |

---

## Post-creation

1. Afficher URL de la PR
2. Afficher checklist restante
3. Suggerer `/gitflow:8-review` pour auto-review

---

## Resume

```
PULL REQUEST CREEE
────────────────────────────────
PR:      #{number}
Titre:   {titre}
Base:    {target} ← {current}
URL:     {url}

Checks:
  Build:      ✓/✗
  Tests:      ✓/✗
  EF Core:    ✓/✗/N/A
  Conflicts:  ✓/✗

Labels: {labels}
────────────────────────────────
Prochain: /gitflow:8-review #{number}
```

---

## Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "No commits between" | Verifier que branche a des commits |
| "Merge conflict" | `git rebase origin/{target}` + resoudre |
| "Build failed" | Corriger erreurs avant PR |
| "PR already exists" | Afficher URL existante |

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:7-pull-request` | PR vers develop |
| `/gitflow:7-pull-request main` | PR vers main |
| `/gitflow:7-pull-request --draft` | PR en draft |
| `/gitflow:7-pull-request --dry-run` | Simulation |
