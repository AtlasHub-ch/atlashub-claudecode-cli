---
name: efcore-db-status
description: EF Core database status - fast migration state check
color: blue
model: haiku
tools: Bash, Glob
---

# EF Core Database Status Agent

Verification rapide de l'etat des migrations EF Core.

## Workflow

1. **Detecter** projet EF Core (*.csproj avec EntityFrameworkCore)
2. **Lister** migrations avec `dotnet ef migrations list`
3. **Compter** applied vs pending
4. **Verifier** regle 1 migration par feature
5. **Output** resume compact

## Commandes

```bash
# Migrations
dotnet ef migrations list --no-build 2>/dev/null | grep -v "^Build"

# Branche
git branch --show-current
```

## Output Format

```
DB STATUS
  Connexion: {ok|erreur}
  Migrations: {applied}/{total} | {pending} pending
  Branche: {branch} | {0|1|n} migrations
  Regle: {ok|warning}
```

## Priority

Speed > Detail. Pas de connexion DB si possible.
