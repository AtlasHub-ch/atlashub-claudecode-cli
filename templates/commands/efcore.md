---
description: Commandes EF Core - Gestion des migrations et de la base de donnees
---

# EF Core Commands

Ensemble de commandes pour gerer Entity Framework Core : migrations, base de donnees, et seeding.

## Commandes disponibles

### Migrations

| Commande | Description | Risque |
|----------|-------------|--------|
| `/efcore:migration` | Creer/recreer la migration (1 par feature) | Faible |
| `/efcore:db-status` | Afficher l'etat des migrations | Aucun (lecture) |
| `/efcore:db-deploy` | Appliquer les migrations | Faible |
| `/efcore:db-seed` | Peupler avec des donnees | Faible |
| `/efcore:db-reset` | Drop + Recreate la base | **ELEVE** |

### Cross-Branch (v1.2)

| Commande | Description | Risque |
|----------|-------------|--------|
| `/efcore:scan` | Scanner les migrations sur toutes les branches | Aucun (lecture) |
| `/efcore:conflicts` | Analyser les conflits potentiels (BLOQUANT) | Aucun (lecture) |
| `/efcore:rebase-snapshot` | Rebaser ModelSnapshot sur develop | Moyen |
| `/efcore:squash` | Fusionner plusieurs migrations en une | **ELEVE** |

## Regle d'or : 1 Migration par Feature

**Ne jamais accumuler plusieurs migrations sur une feature.** Si vous modifiez le modele :
1. Supprimez la migration existante
2. Recreez-la avec `/efcore:migration`

La commande `/efcore:migration` gere cela automatiquement.

## Nommage des migrations

Pattern : `{BranchType}_{Version}_{BranchName}_{Description}`

| Branche | Version | Description | Nom genere |
|---------|---------|-------------|------------|
| feature/user-auth | 1.2.0 | AddRolesTable | `Feature_1_2_0_UserAuth_AddRolesTable` |
| hotfix/login-fix | 1.2.1 | FixNullEmail | `Hotfix_1_2_1_LoginFix_FixNullEmail` |
| release/v1.3.0 | 1.3.0 | Initial | `Release_1_3_0_Initial` |

## Workflow typique

```
1. /gitflow:10-start feature xxx    → Cree worktree + appsettings.Local.json
2. /efcore:db-deploy                → Appliquer les migrations existantes
3. ... modifications du modele ...
4. /efcore:migration                → Creer LA migration pour cette feature
5. /efcore:db-deploy                → Appliquer sur la DB locale
6. /gitflow:3-commit                → Committer
```

## Workflow Cross-Branch (v1.2)

Avec les worktrees GitFlow, plusieurs branches peuvent avoir des migrations en parallele. Pour eviter les conflits :

```
1. /efcore:scan                → Scanner toutes les branches actives
2. /efcore:conflicts           → Verifier s'il y a des conflits (BLOQUANT)
3. /efcore:rebase-snapshot     → Si conflit, rebaser sur develop
4. /efcore:migration           → Creer/recreer la migration
```

### Ordre de merge recommande

Le scan analyse les migrations et recommande un ordre de merge :

```
BRANCHES ACTIVES (3)
--------------------
feature/user-roles    +1 migration    Conflit: NONE
feature/add-products  +1 migration    Conflit: POTENTIAL
feature/orders        +2 migrations   Conflit: HIGH

ORDRE DE MERGE RECOMMANDE:
1. feature/user-roles (independant)
2. feature/add-products (avant orders)
3. feature/orders (rebase requis)
```

## Configuration

Les commandes utilisent la configuration dans `.claude/gitflow/config.json` :

```json
{
  "efcore": {
    "database": {
      "configFile": "appsettings.Local.json",
      "connectionStringName": "DefaultConnection",
      "provider": "SqlServer"
    },
    "crossBranch": {
      "enabled": true,
      "scanOnMigrationCreate": true,
      "blockOnConflict": true,
      "cacheExpiry": 300
    }
  }
}
```

### Options crossBranch

| Option | Description | Defaut |
|--------|-------------|--------|
| `enabled` | Activer la validation cross-branch | `true` |
| `scanOnMigrationCreate` | Scanner avant `/efcore:migration` | `true` |
| `blockOnConflict` | Bloquer si conflit detecte | `true` |
| `cacheExpiry` | Duree de cache du scan (secondes) | `300` |

## Fichier appsettings.Local.json

Ce fichier contient la connection string locale et n'est **jamais committe** :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyApp;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

Le fichier est cree automatiquement par `/gitflow:10-start` et ajoute au `.gitignore`.

## Prerequis

- .NET SDK installe
- EF Core Tools : `dotnet tool install --global dotnet-ef`
- SQL Server (ou autre provider configure)
