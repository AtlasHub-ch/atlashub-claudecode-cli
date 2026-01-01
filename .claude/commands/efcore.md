---
description: Commandes EF Core - Gestion des migrations et de la base de donnees
---

# EF Core Commands

Ensemble de commandes pour gerer Entity Framework Core : migrations, base de donnees, et seeding.

## Commandes disponibles

| Commande | Description | Risque |
|----------|-------------|--------|
| `/efcore:migration` | Creer/recreer la migration (1 par feature) | Faible |
| `/efcore:db-status` | Afficher l'etat des migrations | Aucun (lecture) |
| `/efcore:db-deploy` | Appliquer les migrations | Faible |
| `/efcore:db-seed` | Peupler avec des donnees | Faible |
| `/efcore:db-reset` | Drop + Recreate la base | **ELEVE** |

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

## Configuration

Les commandes utilisent la configuration dans `.claude/gitflow/config.json` :

```json
{
  "efcore": {
    "database": {
      "configFile": "appsettings.Local.json",
      "connectionStringName": "DefaultConnection",
      "provider": "SqlServer"
    }
  }
}
```

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
