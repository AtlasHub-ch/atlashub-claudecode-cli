---
description: Afficher l'etat des migrations et de la base de donnees
agent: efcore-db-status
---

# EF Core Database Status

Affiche l'etat complet des migrations EF Core et de la connexion a la base.

**Commande rapide, lecture seule, sans modification.**

---

## ETAPE 1: Detecter la configuration

```bash
# Verifier les fichiers de config
CONFIG_LOCAL="appsettings.Local.json"
CONFIG_DEV="appsettings.Development.json"
CONFIG_DEFAULT="appsettings.json"

if [ -f "$CONFIG_LOCAL" ]; then
  CONFIG_USED="$CONFIG_LOCAL"
elif [ -f "$CONFIG_DEV" ]; then
  CONFIG_USED="$CONFIG_DEV"
else
  CONFIG_USED="$CONFIG_DEFAULT"
fi

# Detecter le projet EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
PROJECT_NAME=$(basename "$CSPROJ" .csproj)
```

---

## ETAPE 2: Tester la connexion

```bash
cd "$PROJECT_DIR"

# Tester la connexion avec EF Core
CONNECTION_OK=$(dotnet ef database list 2>&1)
if echo "$CONNECTION_OK" | grep -q "error\|Error\|failed"; then
  CONNECTION_STATUS="❌ Echec"
  CONNECTION_ERROR="$CONNECTION_OK"
else
  CONNECTION_STATUS="✓ OK"
fi
```

---

## ETAPE 3: Lister les migrations

```bash
# Migrations dans le code
CODE_MIGRATIONS=$(dotnet ef migrations list 2>/dev/null | grep -v "^Build" | grep -v "^$")
TOTAL_MIGRATIONS=$(echo "$CODE_MIGRATIONS" | wc -l)

# Migrations appliquees vs en attente
APPLIED=$(dotnet ef migrations list 2>/dev/null | grep "(Pending)" -v | grep -v "^Build" | wc -l)
PENDING=$(dotnet ef migrations list 2>/dev/null | grep "(Pending)" | wc -l)
```

---

## ETAPE 4: Afficher le rapport

```
================================================================================
                         EF CORE - DATABASE STATUS
================================================================================

PROJET
  Nom:           {PROJECT_NAME}
  Config:        {CONFIG_USED}
  DbContext:     {CONTEXT_NAME}

CONNEXION
  Status:        {CONNECTION_STATUS}
  Server:        {SERVER}
  Database:      {DATABASE}

MIGRATIONS
  Total:         {TOTAL_MIGRATIONS}
  Appliquees:    {APPLIED} ✓
  En attente:    {PENDING} {⚠️ si > 0}

================================================================================
```

**Si migrations en attente:**

```
MIGRATIONS EN ATTENTE
────────────────────────────────────────────────────────────────────────────────
  1. {MigrationName1}  (Pending)
  2. {MigrationName2}  (Pending)
────────────────────────────────────────────────────────────────────────────────

→ Utilisez /efcore:db-deploy pour appliquer les migrations
```

**Si erreur de connexion:**

```
⚠️  PROBLEME DE CONNEXION
────────────────────────────────────────────────────────────────────────────────
{CONNECTION_ERROR}
────────────────────────────────────────────────────────────────────────────────

VERIFICATIONS:
  1. SQL Server est-il demarre ?
  2. appsettings.Local.json est-il configure ?
  3. La base de donnees existe-t-elle ?

COMMANDES:
  /efcore:db-reset   → Creer/recreer la base
  /gitflow:10-start  → Configurer appsettings.Local.json
```

---

## ETAPE 4.5: Verification regle "1 migration par feature"

```bash
# Branche courante
CURRENT_BRANCH=$(git branch --show-current)

# Extraire le type de branche
if [[ "$CURRENT_BRANCH" == feature/* ]]; then
  BRANCH_TYPE="Feature"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/feature\///' | sed 's/-/_/g')
elif [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
  BRANCH_TYPE="Hotfix"
  BRANCH_NAME=$(echo "$CURRENT_BRANCH" | sed 's/hotfix\///' | sed 's/-/_/g')
else
  BRANCH_TYPE=""
fi

# Si sur une feature/hotfix, compter les migrations de cette branche
if [ -n "$BRANCH_TYPE" ]; then
  # Chercher les migrations qui matchent le pattern de la branche
  BRANCH_MIGRATIONS=$(find "$MIGRATIONS_DIR" -name "*.cs" 2>/dev/null | grep -iE "${BRANCH_TYPE}.*${BRANCH_NAME}" | grep -v "Designer" | grep -v "Snapshot" | wc -l)
fi
```

**Afficher la verification:**

```
REGLE "1 MIGRATION PAR FEATURE"
────────────────────────────────────────────────────────────────────────────────
  Branche:      {CURRENT_BRANCH}
  Migrations:   {BRANCH_MIGRATIONS} pour cette branche
```

**Si BRANCH_MIGRATIONS > 1:**

```
  ⚠️  ATTENTION: {BRANCH_MIGRATIONS} migrations detectees pour cette branche!
      Regle: 1 seule migration par feature/hotfix

      ACTION RECOMMANDEE:
        /efcore:migration  → Recreer une migration unique

      Les migrations multiples causent des problemes lors du merge.
────────────────────────────────────────────────────────────────────────────────
```

**Si BRANCH_MIGRATIONS == 1:**

```
  ✓ Regle respectee: 1 migration pour cette branche
────────────────────────────────────────────────────────────────────────────────
```

**Si BRANCH_MIGRATIONS == 0 et modifications en attente:**

```
  ○ Aucune migration pour cette branche
    → Utilisez /efcore:migration si vous avez modifie le modele
────────────────────────────────────────────────────────────────────────────────
```

---

## ETAPE 5: Infos supplementaires (optionnel)

```bash
# Taille de la base (si connexion OK)
DB_SIZE=$(sqlcmd -S "$SERVER" -E -Q "SELECT CAST(SUM(size * 8 / 1024.0) AS DECIMAL(10,2)) AS 'MB' FROM sys.master_files WHERE database_id = DB_ID('$DATABASE')" -h -1 2>/dev/null)

# Nombre de tables
TABLE_COUNT=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'" -h -1 2>/dev/null)
```

```
STATISTIQUES
  Taille:        {DB_SIZE} MB
  Tables:        {TABLE_COUNT}
```

---

## Options

| Option | Description |
|--------|-------------|
| `--verbose` | Afficher toutes les migrations avec details |
| `--json` | Sortie JSON pour scripting |
| `--context {name}` | Specifier le DbContext |
