---
description: Business Analysis workflow complet pour applications Microsoft (.NET/Blazor/EF Core)
---

# BA - Business Analysis Workflow

Expert Business Analyst pour applications Microsoft. Workflow complet EPCT.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│  BA WORKFLOW - Microsoft Stack                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1-INIT ──► 2-ANALYSE ──► 3-VALIDATE ──► 4-IMPLEMENT ──► 5-VERIFY│
│                                                                  │
│  [E]xplore   [E]xplore    [P]lan        [C]ode        [T]est    │
│  Scan .NET   Challenge    Specs 85%     Entites       dotnet    │
│  EF Core     Besoin       Validation    Controllers   build     │
│              Metier                     Blazor        test      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Phases

| Phase | Commande | Description | Output |
|-------|----------|-------------|--------|
| 1 | `/ba:1-init` | Scan projet .NET, detection EF Core | `config.json` |
| 2 | `/ba:2-analyse` | Challenge agressif du besoin metier | `analyses/*.md` |
| 3 | `/ba:3-validate` | Validation specs (seuil 85%) | `validations/*.md`, `specs/*.md` |
| 4 | `/ba:4-implement` | Generation code .NET/Blazor | Entites, Controllers, Pages |
| 5 | `/ba:5-verify` | Build, test, format | Rapport validation |

## Execution

### Workflow complet

```bash
# Phase 1: Initialisation
/ba:1-init

# Phase 2: Analyse fonctionnelle
/ba:2-analyse "Description de la fonctionnalite"

# Phase 3: Validation des specs
/ba:3-validate

# Phase 4: Implementation .NET
/ba:4-implement

# Phase 5: Verification
/ba:5-verify
```

### Execution selective

```bash
# Seulement analyse (sans code)
/ba:1-init && /ba:2-analyse "feature" && /ba:3-validate

# Reprendre a l'implementation
/ba:4-implement && /ba:5-verify
```

## Structure des artefacts

```
.claude/ba/
├── config.json              # Configuration projet
├── analyses/                # Documents d'analyse
│   └── YYYY-MM-DD-feature.md
├── validations/             # Specs validees
│   └── YYYY-MM-DD-feature.md
├── specs/                   # Specs techniques
│   └── YYYY-MM-DD-feature.md
└── implementations/         # Logs d'implementation
    └── YYYY-MM-DD-feature.md
```

## Stack Microsoft Supporte

| Composant | Version | Usage |
|-----------|---------|-------|
| .NET | 6.0 / 7.0 / 8.0 | Runtime |
| ASP.NET Core | Web API | Backend |
| Blazor | Server / WASM | Frontend |
| EF Core | 6.0+ | ORM |
| SQL Server | 2019+ | Database |
| Identity | Core | Auth |

## Agents utilises

| Agent | Model | Phase | Role |
|-------|-------|-------|------|
| ba:scan | haiku | 1-init | Scan projet .NET |
| ba:entity-analyzer | haiku | 2-analyse | Analyse entites |
| ba:doc-generator | haiku | 2-analyse | Generation doc |
| ba:code-generator | haiku | 4-implement | Generation code C# |
| ba:blazor-generator | haiku | 4-implement | Generation Blazor |
| snipper | sonnet | 5-verify | Fix erreurs |

## Regles

1. **Toujours commencer par** `/ba:1-init`
2. **Ne pas sauter de phases** - Chaque phase depend de la precedente
3. **Validation 85%** - Les specs doivent atteindre le seuil avant implementation
4. **Build MUST pass** - Ne pas valider si `dotnet build` echoue
5. **Tests requis** - Chaque entite/endpoint doit avoir des tests

## Prochain

Executez `/ba:1-init` pour commencer.
