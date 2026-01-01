---
description: Deployer les migrations EF Core sur la base de donnees locale
agent: efcore-db-deploy
---

# EF Core Database Deploy

Applique toutes les migrations en attente sur la base de donnees configuree dans `appsettings.Local.json`.

---

## ETAPE 1: Verifier la configuration

```bash
# Verifier que appsettings.Local.json existe
if [ ! -f "appsettings.Local.json" ]; then
  echo "❌ appsettings.Local.json non trouve"
  echo "   Utilisez /gitflow:10-start pour le creer"
  exit 1
fi

# Detecter le projet EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
if [ -z "$CSPROJ" ]; then
  echo "❌ Aucun projet EF Core detecte"
  exit 1
fi

PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)
```

---

## ETAPE 2: Verifier les migrations en attente

```bash
cd "$PROJECT_DIR"
dotnet ef migrations list --json 2>/dev/null | grep -E '"applied": false'
PENDING_COUNT=$(dotnet ef migrations list --json 2>/dev/null | grep -c '"applied": false' || echo "0")
```

**Afficher le statut:**

```
================================================================================
                         EF CORE - DATABASE DEPLOY
================================================================================

PROJET:      {PROJECT_NAME}
CONFIG:      appsettings.Local.json
MIGRATIONS:  {PENDING_COUNT} en attente

================================================================================
```

---

## ETAPE 3: Appliquer les migrations

```bash
# Appliquer les migrations avec la config locale
dotnet ef database update --configuration Release --verbose
```

**Si erreur de connexion:**

```
⚠️  Erreur de connexion a la base de donnees

VERIFICATIONS:
1. SQL Server est-il demarre ?
2. La base de donnees existe-t-elle ?
3. Les credentials sont-ils corrects ?

COMMANDES UTILES:
- Verifier la connexion:  sqlcmd -S {SERVER} -E
- Creer la base:          /efcore:db-reset
```

---

## ETAPE 4: Confirmation

```
================================================================================
                         DEPLOIEMENT TERMINE
================================================================================

✓ {N} migration(s) appliquee(s)
✓ Base de donnees a jour

COMMANDES SUIVANTES:
  /efcore:db-status  → Verifier l'etat
  /efcore:db-seed    → Peupler les donnees de test

================================================================================
```

---

## Options

| Option | Description |
|--------|-------------|
| `--verbose` | Afficher les details SQL |
| `--connection "..."` | Override connection string |
| `--context {name}` | Specifier le DbContext si multiple |
