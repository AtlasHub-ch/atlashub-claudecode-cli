---
description: Phase 8 - Review Pull Request with checklist and suggestions
agent: gitflow-review
model: haiku
---

# Phase 8: REVIEW - Review PR avec checklist

Tu es expert code review .NET/EF Core. Analyse la PR et fournis feedback structure.

**Argument:** `$ARGUMENTS` = numero PR ou URL (requis)

---

## Chargement PR

```bash
# Recuperer infos PR
gh pr view {number} --json title,body,files,commits,reviews,checks

# Recuperer diff
gh pr diff {number}
```

---

## Checklist Review

### 1. Code Quality

| Check | Critere | Poids |
|-------|---------|-------|
| Lisibilite | Noms clairs, structure logique | HIGH |
| DRY | Pas de duplication | MEDIUM |
| SOLID | Principes respectes | MEDIUM |
| Complexite | Methodes < 20 lignes, cyclomatic < 10 | LOW |

### 2. Patterns .NET

| Check | Validation |
|-------|------------|
| Async/Await | Pas de `.Result` ou `.Wait()` |
| Dependency Injection | Pas de `new Service()` |
| Null handling | `?.` ou `??` ou `required` |
| Exceptions | Specifiques, pas `catch (Exception)` |

### 3. EF Core (si migrations)

| Check | Validation | Severite |
|-------|------------|----------|
| 3 fichiers | Migration + Designer + ModelSnapshot | BLOQUANT |
| Naming | Convention `{Date}_{Description}` | WARNING |
| Down() | Methode Down implementee | WARNING |
| Indexes | Sur colonnes FK et filtres frequents | INFO |
| Data loss | Pas de DropColumn sans backup | BLOQUANT |

### 4. Tests

| Check | Critere |
|-------|---------|
| Coverage | Nouveau code couvert |
| Naming | `{Method}_Should_{Behavior}_When_{Condition}` |
| Arrange/Act/Assert | Structure claire |
| Mocks | Pas de dependances reelles |

### 5. Security

| Check | Pattern a detecter | Severite |
|-------|-------------------|----------|
| Secrets | `password`, `apikey`, `secret` hardcodes | BLOQUANT |
| SQL Injection | String concat dans queries | BLOQUANT |
| XSS | `@Html.Raw()` sans sanitization | HIGH |
| Auth | `[AllowAnonymous]` sur endpoints sensibles | HIGH |

---

## Analyse automatique

### Fichiers a examiner en priorite

| Priorite | Type | Raison |
|----------|------|--------|
| 1 | `*Migration*.cs` | Impact base de donnees |
| 2 | `*Controller*.cs` | Surface d'attaque |
| 3 | `*Service*.cs` | Logique metier |
| 4 | `*.razor` | UI et securite XSS |
| 5 | Tests | Qualite couverture |

### Metriques

```
METRIQUES PR
────────────────────────────────
Fichiers:    {count} (+{added}/-{removed})
Commits:     {count}
Insertions:  +{lines}
Deletions:   -{lines}

Ratio tests: {test_files}/{total_files}
────────────────────────────────
```

---

## Output Review

### Format

```
CODE REVIEW - PR #{number}
════════════════════════════════════════

RESUME: {APPROVE | CHANGES_REQUESTED | COMMENT}

BLOQUANTS ({count}):
🔴 [{file}:{line}] {description}
   Suggestion: {fix}

WARNINGS ({count}):
🟡 [{file}:{line}] {description}
   Suggestion: {fix}

SUGGESTIONS ({count}):
🟢 [{file}:{line}] {description}

POINTS POSITIFS:
✨ {ce qui est bien fait}

════════════════════════════════════════
```

### Soumission review

```bash
# Approve
gh pr review {number} --approve --body "{comments}"

# Request changes
gh pr review {number} --request-changes --body "{comments}"

# Comment only
gh pr review {number} --comment --body "{comments}"
```

---

## Resume

```
REVIEW COMPLETE
────────────────────────────────
PR:       #{number}
Status:   {APPROVED|CHANGES_REQUESTED|COMMENTED}

Issues:
  Bloquants:   {count}
  Warnings:    {count}
  Suggestions: {count}

EF Core: {OK|ISSUES|N/A}
Tests:   {COVERED|MISSING|N/A}
Security: {OK|ISSUES}
────────────────────────────────
Prochain: /gitflow:9-merge #{number}
```

---

## Modes

| Commande | Action |
|----------|--------|
| `/gitflow:8-review 123` | Review PR #123 |
| `/gitflow:8-review --security` | Focus securite |
| `/gitflow:8-review --ef-core` | Focus migrations |
| `/gitflow:8-review --quick` | Checklist rapide |
