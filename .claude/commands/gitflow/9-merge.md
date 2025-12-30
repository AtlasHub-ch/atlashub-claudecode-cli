---
description: Phase 9 - Merge Pull Request with all checks validated
---

# Phase 9: MERGE - Merge PR avec validation complete

Tu es expert GitFlow. Execute le merge avec tous les checks de securite.

**Argument:** `$ARGUMENTS` = numero PR (requis)

---

## Pre-merge checks

### 1. Status PR

```bash
gh pr view {number} --json state,mergeable,mergeStateStatus,reviews,checks
```

| Check | Requis | Action si echec |
|-------|--------|-----------------|
| State = OPEN | OUI | "PR deja mergee ou fermee" |
| Mergeable = true | OUI | "Resoudre conflits d'abord" |
| MergeStateStatus = CLEAN | OUI | Attendre CI ou resoudre |

### 2. Reviews

| Check | Condition | Action |
|-------|-----------|--------|
| Min approvals | Config: `minReviewers` | Attendre reviews |
| No changes requested | Aucun "Request changes" actif | Resoudre feedback |
| Required reviewers | Si configure | Verifier presence |

```bash
# Verifier reviews
gh pr view {number} --json reviews --jq '.reviews[] | select(.state=="APPROVED")'
```

### 3. CI/CD Checks

```bash
gh pr checks {number}
```

| Status | Action |
|--------|--------|
| Tous ✓ | Continuer |
| En cours | Attendre |
| Echec | BLOQUER - afficher details |

### 4. Branch Protection

| Rule | Verification |
|------|--------------|
| Up-to-date | `git rev-list --count HEAD..origin/{base}` = 0 |
| Linear history | Si requis, rebase avant merge |
| Signed commits | Si requis, verifier signatures |

---

## EF Core Pre-merge (si applicable)

### Validation migrations

```bash
# Lister migrations dans la PR
git diff origin/{base}...HEAD --name-only | grep -E "Migrations/.*\.cs$"
```

| Check | Validation | Bloquant |
|-------|------------|----------|
| Sync ModelSnapshot | Pas de conflit avec develop | OUI |
| Build migrations | `dotnet ef migrations script` OK | OUI |
| Pas de data loss | Scan DropTable/DropColumn | WARNING |

### Si conflit ModelSnapshot detecte

```
⚠️ CONFLIT MODELSNAPSHOT DETECTE
────────────────────────────────
Le ModelSnapshot a diverge de develop.

Options:
1. Rebase + recreer migration (recommande)
2. Merge manuel (risque)

Commande recommandee:
  git rebase origin/develop
  dotnet ef migrations remove
  dotnet ef migrations add {MigrationName}
────────────────────────────────
```

---

## Execution Merge

### Strategie selon type

| Type branche | Merge strategy | Options |
|--------------|----------------|---------|
| `feature/*` | Squash | `--squash` |
| `hotfix/*` | Merge commit | `--merge` |
| `release/*` | Merge commit | `--merge` |

### Commande

```bash
# Squash (feature)
gh pr merge {number} --squash --delete-branch

# Merge commit (hotfix/release)
gh pr merge {number} --merge --delete-branch
```

### Options supplementaires

| Option | Condition | Action |
|--------|-----------|--------|
| `--auto` | CI en cours | Merge auto quand vert |
| `--delete-branch` | Config autoDeleteBranch | Supprimer branche source |
| `--admin` | Override protections | DANGEREUX - confirmation requise |

---

## Post-merge actions

### 1. Versioning (si release/hotfix)

```bash
# Lire version actuelle
VERSION=$(cat package.json | jq -r '.version')

# Creer tag
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"
```

### 2. Changelog (optionnel)

```bash
# Ajouter entree CHANGELOG
echo "## v$VERSION - $(date +%Y-%m-%d)" >> CHANGELOG.md
gh pr view {number} --json title,body >> CHANGELOG.md
```

### 3. Notifications (si configure)

| Canal | Message |
|-------|---------|
| Slack | "PR #{number} merged to {base}" |
| Teams | Idem |
| Email | Idem |

### 4. Cleanup

```bash
# Supprimer branche locale
git branch -d {branch}

# Fetch et prune
git fetch --prune
```

---

## Resume

```
MERGE COMPLETE
════════════════════════════════════════
PR:       #{number}
Titre:    {title}
Base:     {base}
Strategy: {squash|merge}

Checks passes:
  ✓ Reviews:     {count} approvals
  ✓ CI:          All green
  ✓ Conflicts:   None
  ✓ EF Core:     {OK|N/A}

Post-merge:
  ✓ Branch deleted: {branch}
  ✓ Tag created:    {tag|N/A}

════════════════════════════════════════
```

---

## Erreurs et recovery

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Not mergeable" | Conflits | `git rebase origin/{base}` |
| "Checks failing" | CI rouge | Corriger et re-push |
| "Review required" | Pas d'approval | Demander review |
| "Branch protected" | Rules non respectees | Verifier requirements |

### Rollback si probleme post-merge

```bash
# Identifier commit merge
MERGE_COMMIT=$(git log --merges -1 --format="%H")

# Revert
git revert -m 1 $MERGE_COMMIT
git push origin {base}
```

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:9-merge 123` | Merge PR #123 |
| `/gitflow:9-merge 123 --auto` | Merge auto quand CI vert |
| `/gitflow:9-merge 123 --dry-run` | Simulation |
| `/gitflow:9-merge 123 --admin` | Override protections (danger) |
