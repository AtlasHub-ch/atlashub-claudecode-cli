---
description: Reinitialiser completement la base de donnees (Drop + Recreate + Migrations)
agent: efcore-db-reset
---

# EF Core Database Reset

Supprime et recree la base de donnees, puis applique toutes les migrations.

**⚠️ ATTENTION: Cette commande SUPPRIME toutes les donnees !**

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer.

---

## ETAPE 1: Confirmation obligatoire

```javascript
AskUserQuestion({
  questions: [{
    question: "⚠️ ATTENTION: Cela va SUPPRIMER toutes les donnees de la base. Confirmer ?",
    header: "Reset DB",
    options: [
      { label: "Oui, supprimer", description: "Drop + Recreate la base (PERTE DE DONNEES)" },
      { label: "Non, annuler", description: "Garder la base actuelle" }
    ],
    multiSelect: false
  }]
})
```

**Si Non → Arreter immediatement**

---

## ETAPE 2: Verifier la configuration

```bash
# Verifier que appsettings.Local.json existe
if [ ! -f "appsettings.Local.json" ]; then
  echo "❌ appsettings.Local.json non trouve"
  exit 1
fi

# Detecter le projet EF Core
CSPROJ=$(find . -name "*.csproj" -exec grep -l "Microsoft.EntityFrameworkCore" {} \; | head -1)
PROJECT_DIR=$(dirname "$CSPROJ")
```

---

## ETAPE 3: Backup optionnel

```javascript
AskUserQuestion({
  questions: [{
    question: "Creer un backup avant la suppression ?",
    header: "Backup",
    options: [
      { label: "Oui", description: "Sauvegarder dans ./backups/ (Recommande)" },
      { label: "Non", description: "Pas de backup" }
    ],
    multiSelect: false
  }]
})
```

**Si backup:**

```bash
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).bak"
mkdir -p "$BACKUP_DIR"

# Extraire les infos de connexion depuis appsettings.Local.json
SERVER=$(grep -oP '"Server=\K[^;]+' appsettings.Local.json | head -1)
DATABASE=$(grep -oP '"Database=\K[^;]+' appsettings.Local.json | head -1)

# Backup SQL Server
sqlcmd -S "$SERVER" -E -Q "BACKUP DATABASE [$DATABASE] TO DISK = N'$(pwd)/$BACKUP_FILE' WITH FORMAT"
echo "✓ Backup cree: $BACKUP_FILE"
```

---

## ETAPE 4: Drop la base de donnees

```bash
cd "$PROJECT_DIR"

# Methode EF Core
dotnet ef database drop --force

# OU methode SQL directe si EF echoue
# sqlcmd -S "$SERVER" -E -Q "DROP DATABASE IF EXISTS [$DATABASE]"
```

---

## ETAPE 5: Recreer et appliquer les migrations

```bash
# Appliquer toutes les migrations (cree la base si inexistante)
dotnet ef database update --verbose
```

---

## ETAPE 6: Seed optionnel

```javascript
AskUserQuestion({
  questions: [{
    question: "Peupler la base avec des donnees de test ?",
    header: "Seed",
    options: [
      { label: "Oui", description: "Executer le seeding" },
      { label: "Non", description: "Base vide" }
    ],
    multiSelect: false
  }]
})
```

**Si oui:**

```bash
# Chercher un script de seed ou utiliser la commande dotnet
dotnet run --project "$PROJECT_DIR" -- --seed
# OU
dotnet ef database seed 2>/dev/null || echo "Pas de seed configure"
```

---

## ETAPE 7: Resume

```
================================================================================
                         DATABASE RESET TERMINE
================================================================================

✓ Ancienne base supprimee
✓ Nouvelle base creee
✓ {N} migration(s) appliquee(s)
{✓ Donnees de test inserees | ○ Base vide}
{✓ Backup: ./backups/backup_xxx.bak | ○ Pas de backup}

COMMANDES SUIVANTES:
  /efcore:db-status  → Verifier l'etat
  /efcore:db-seed    → Ajouter des donnees de test

================================================================================
```

---

## Securite

| Protection | Description |
|------------|-------------|
| Confirmation | Obligatoire avant suppression |
| Backup | Propose automatiquement |
| Env Check | Bloque si `ASPNETCORE_ENVIRONMENT=Production` |
