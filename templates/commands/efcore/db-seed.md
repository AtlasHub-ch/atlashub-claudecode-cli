---
description: Peupler la base de donnees avec des donnees de test ou initiales
agent: efcore-db-seed
---

# EF Core Database Seed

Insere des donnees de test ou initiales dans la base de donnees.

> **INSTRUCTION CLAUDE:** Les blocs `AskUserQuestion({...})` sont des instructions pour utiliser le tool `AskUserQuestion` de maniere **interactive**. Tu DOIS executer le tool avec ces parametres pour obtenir la reponse de l'utilisateur AVANT de continuer.

---

## ETAPE 1: Detecter les methodes de seeding disponibles

```bash
# Chercher les differentes methodes de seed
SEED_METHODS=""

# 1. Classe DbSeeder ou DataSeeder
if grep -rq "class.*Seeder\|class.*Seed\|IDataSeeder" . --include="*.cs" 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS seeder-class"
fi

# 2. HasData() dans les configurations
if grep -rq "\.HasData(" . --include="*.cs" 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS hasdata"
fi

# 3. Script SQL de seed
if [ -f "./scripts/seed.sql" ] || [ -f "./Data/seed.sql" ]; then
  SEED_METHODS="$SEED_METHODS sql-script"
fi

# 4. Argument --seed dans Program.cs
if grep -q "\-\-seed" ./Program.cs 2>/dev/null; then
  SEED_METHODS="$SEED_METHODS cli-argument"
fi
```

---

## ETAPE 2: Afficher les options

```
================================================================================
                         EF CORE - DATABASE SEED
================================================================================

METHODES DETECTEES:
```

**Si methodes trouvees:**

```javascript
// Construire les options dynamiquement
options = []

if (SEED_METHODS.includes("seeder-class")) {
  options.push({
    label: "Seeder Class",
    description: "Executer la classe DbSeeder/DataSeeder"
  })
}

if (SEED_METHODS.includes("hasdata")) {
  options.push({
    label: "HasData (migrations)",
    description: "Les donnees sont deja dans les migrations"
  })
}

if (SEED_METHODS.includes("sql-script")) {
  options.push({
    label: "Script SQL",
    description: "Executer ./scripts/seed.sql"
  })
}

if (SEED_METHODS.includes("cli-argument")) {
  options.push({
    label: "CLI --seed",
    description: "Lancer l'app avec --seed"
  })
}

AskUserQuestion({
  questions: [{
    question: "Quelle methode de seeding utiliser ?",
    header: "Seed",
    options: options,
    multiSelect: false
  }]
})
```

**Si aucune methode trouvee:**

```
⚠️  Aucune methode de seeding detectee

OPTIONS:
1. Creer un script SQL dans ./scripts/seed.sql
2. Ajouter HasData() dans vos EntityTypeConfiguration
3. Creer une classe IDataSeeder

EXEMPLE HasData():
────────────────────────────────────────────────────────────────────────────────
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasData(new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@example.com"
        });
    }
}
────────────────────────────────────────────────────────────────────────────────
```

---

## ETAPE 3: Executer le seeding

### Option A: Seeder Class

```bash
# Detecter le projet startup
STARTUP_PROJECT=$(find . -name "*.csproj" -exec grep -l "Microsoft.AspNetCore" {} \; | head -1)

# Executer avec l'option seed
dotnet run --project "$STARTUP_PROJECT" -- --seed
```

### Option B: Script SQL

```bash
# Extraire les infos de connexion
SERVER=$(grep -oP 'Server=\K[^;]+' appsettings.Local.json | head -1)
DATABASE=$(grep -oP 'Database=\K[^;]+' appsettings.Local.json | head -1)

# Executer le script
sqlcmd -S "$SERVER" -E -d "$DATABASE" -i "./scripts/seed.sql"
```

### Option C: CLI --seed

```bash
dotnet run --project "$STARTUP_PROJECT" -- --seed
```

---

## ETAPE 4: Verification

```bash
# Compter les enregistrements dans les tables principales
TABLES=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'" -h -1)

for table in $TABLES; do
  COUNT=$(sqlcmd -S "$SERVER" -E -d "$DATABASE" -Q "SELECT COUNT(*) FROM [$table]" -h -1)
  echo "$table: $COUNT rows"
done
```

---

## ETAPE 5: Resume

```
================================================================================
                         SEEDING TERMINE
================================================================================

METHODE:     {methode utilisee}
RESULTATS:
  Users:     {N} enregistrements
  Products:  {N} enregistrements
  ...

✓ Base de donnees peuplee avec succes

COMMANDES SUIVANTES:
  /efcore:db-status  → Verifier l'etat
  dotnet run         → Lancer l'application

================================================================================
```

---

## Creer un script seed.sql

Si vous n'avez pas de methode de seeding, creez `./scripts/seed.sql`:

```sql
-- Seed data for development
SET IDENTITY_INSERT [Users] ON;

INSERT INTO [Users] ([Id], [Name], [Email], [CreatedAt])
VALUES
    (1, 'Admin', 'admin@example.com', GETDATE()),
    (2, 'Test User', 'test@example.com', GETDATE());

SET IDENTITY_INSERT [Users] OFF;

-- Add more seed data here...
```

Puis executez `/efcore:db-seed` et selectionnez "Script SQL".
