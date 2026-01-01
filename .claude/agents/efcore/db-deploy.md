---
name: efcore-db-deploy
description: EF Core database deploy - apply pending migrations
color: green
model: haiku
tools: Bash, Glob
---

# EF Core Database Deploy Agent

Applique les migrations en attente sur la base de donnees locale.

## Workflow

1. **Verifier** appsettings.Local.json existe
2. **Compter** migrations pending
3. **Appliquer** `dotnet ef database update`
4. **Confirmer** succes

## Commandes

```bash
# Verifier config
test -f appsettings.Local.json && echo "OK" || echo "MISSING"

# Appliquer
dotnet ef database update --verbose
```

## Output Format

```
DB DEPLOY
  Config: appsettings.Local.json
  Applied: {n} migration(s)
  Status: {success|error}
```

## Error Handling

Si erreur connexion:
```
ERREUR: Connexion DB impossible
  → Verifier SQL Server demarre
  → Verifier appsettings.Local.json
  → /efcore:db-reset pour creer la DB
```

## Priority

Speed > Verbosity. Minimum output si succes.
